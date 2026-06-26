/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, PackagePlus, HardHat, Box, Users, RotateCcw, BookOpen, BarChart3, Settings, LogOut, Cpu, Zap, Truck, AlertCircle
} from 'lucide-react';
import {
  sendTelegramMessage,
  formatExitMessage, formatPpeMessage, formatLoanMessage, formatWelcomeMessage, formatLogoutMessage,
  formatReturnLoanMessage, formatEditRecordMessage, formatDeleteRequestMessage,
  formatProductActionMessage, formatPersonnelActionMessage, formatUserActionMessage,
  formatRestoreMessage, sendTelegramBackup
} from './services/telegramService';
import { AuthScreen }            from './components/AuthScreen';
import { DashboardView }         from './components/DashboardView';
import { GeneralExitForm }       from './components/GeneralExitForm';
import { SafetyIssuanceForm }    from './components/SafetyIssuanceForm';
import { WarehouseManager }      from './components/WarehouseManager';
import { PersonnelManager }      from './components/PersonnelManager';
import { LoanManager }           from './components/LoanManager';
import { GlobalLogView }         from './components/GlobalLogView';
import { ReportingView }         from './components/ReportingView';
import { SystemSettings }        from './components/SystemSettings';
import { UnregisteredExitsView } from './components/UnregisteredExitsView';
import { WaybillManager }        from './components/WaybillManager';
import { AIAssistantOverlay }    from './components/AIAssistantOverlay';
import { RecordOverlay }         from './components/RecordOverlay';
import { EditOverlay }           from './components/EditOverlay';
import { ModificationAuthModal } from './components/ModificationAuthModal';
import { SignatureModal }        from './components/SignatureModal';
import { CameraModal }           from './components/CameraModal';
import { User, UserRole, Product, ExitRecord, Recipient, Waybill, UserPermissions, DEFAULT_ADMIN_PERMISSIONS, DEFAULT_OPERATOR_PERMISSIONS } from './types';

// ─── Helper: دریافت دسترسی‌های موثر کاربر ────────────────────────────────────
function getPerms(user: User): UserPermissions {
  if (user.permissions) return user.permissions;
  return user.role === UserRole.ADMIN ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_OPERATOR_PERMISSIONS;
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface AppData {
  products:   Product[];
  exits:      ExitRecord[];
  recipients: Recipient[];
  ppeRecords: ExitRecord[];
  waybills:   Waybill[];
  users:      User[];
}

const SESSION_KEY = 'P21_SESSION';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'sadegh',  password: 'p21admin', fullName: 'صادق محمدی',    role: UserRole.ADMIN,    modPassword: '21'  },
  { id: '2', username: 'مهران',   password: '123',      fullName: 'مهران رستگاری', role: UserRole.OPERATOR, modPassword: '123' },
];

const EMPTY_DATA: AppData = {
  products: [], exits: [], recipients: [], ppeRecords: [], waybills: [], users: [],
};

// ─── Sync helpers ─────────────────────────────────────────────────────────────
// _dirty  → شمارش عملیات save در حال انجام یا در صف
// _savedVersion → آخرین نسخه‌ای که به سرور ارسال شد (برای مقایسه ETag)
let _dirty   = 0;
let _timer: ReturnType<typeof setTimeout> | null = null;
let _savedVersion = 0;   // هر بار که save می‌کنیم این را افزایش می‌دهیم
let _serverVersion = 0;  // آخرین نسخه‌ای که از سرور خواندیم

function _doSave(data: AppData) {
  _dirty += 1;
  _savedVersion += 1;
  const myVersion = _savedVersion;
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => {
    const body = JSON.stringify({ ...data, _v: myVersion });
    fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      .then(r => r.json())
      .catch(() => {})
      .finally(() => {
        _dirty = Math.max(0, _dirty - 1);
        _serverVersion = myVersion; // سرور آخرین داده ما را دارد
      });
  }, 300);
}

function _parseServer(raw: any): AppData {
  return {
    users:      Array.isArray(raw.users)      && raw.users.length      > 0 ? raw.users      : DEFAULT_USERS,
    products:   Array.isArray(raw.products)   ? raw.products   : [],
    exits:      Array.isArray(raw.exits)      ? raw.exits      : [],
    recipients: Array.isArray(raw.recipients) ? raw.recipients : [],
    ppeRecords: Array.isArray(raw.ppeRecords) ? raw.ppeRecords : [],
    waybills:   Array.isArray(raw.waybills)   ? raw.waybills   : [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState('dashboard');
  const [ready, setReady]     = useState(false);
  const [data, setData]       = useState<AppData>(EMPTY_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
  });

  const [selectedRecord, setSelectedRecord] = useState<ExitRecord | null>(null);
  const [editingRecord,  setEditingRecord]  = useState<ExitRecord | null>(null);
  const [secCtx, setSecCtx] = useState<{ action: () => void; desc: string } | null>(null);
  const [aiOpen,   setAiOpen]   = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [camOpen,  setCamOpen]  = useState(false);
  const [tempSig,  setTempSig]  = useState('');
  const [tempPhoto,setTempPhoto]= useState<string | null>(null);

  const dataRef        = useRef<AppData>(data);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { dataRef.current = data; });
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Persist session
  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  // ── THE key helper: update data + immediately save ATOMICALLY ───────────
  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = fn(prev);
      _doSave(next);
      return next;
    });
  }, []);

  // ── Poller ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let firstLoad = true;

    const applyServer = (raw: any) => {
      // اگه save فعال داریم و firstLoad نیست — skip کن (داده‌های ما جدیدتره)
      if (_dirty > 0 && !firstLoad) return;

      const serverVer = typeof raw._v === 'number' ? raw._v : 0;
      // اگه نسخه سرور از اونچه ما داریم کمتره و firstLoad نیست — skip کن
      if (!firstLoad && serverVer > 0 && serverVer <= _serverVersion) return;

      const incoming = _parseServer(raw);
      _serverVersion = serverVer;
      setData(incoming);

      const cu = currentUserRef.current;
      if (cu) {
        const fresh = incoming.users.find((u: any) => u.id === cu.id);
        if (fresh && JSON.stringify(fresh) !== JSON.stringify(cu)) {
          setCurrentUser(fresh);
        }
      }
    };

    const poll = () => {
      // هیچوقت poll رو block نکن — حتی وقتی dirty هستیم هم بخوان
      // فقط در applyServer تصمیم بگیر که اعمال بشه یا نه
      fetch('/api/state')
        .then(r => r.json())
        .then(raw => {
          applyServer(raw);
          if (firstLoad && !(Array.isArray(raw.users) && raw.users.length > 0)) {
            _doSave(_parseServer(raw));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (firstLoad) { firstLoad = false; setReady(true); }
        });
    };

    poll();
    // هر 2 ثانیه — sync سریع بین همه دستگاه‌ها
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, []);

  // Sync currentUser whenever users list changes from server poll
  useEffect(() => {
    if (!currentUser || data.users.length === 0) return;
    const fresh = data.users.find(u => u.id === currentUser.id);
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
      setCurrentUser(fresh);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.users]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    if (currentUser) sendTelegramMessage(formatLogoutMessage(currentUser), true, true);
    setCurrentUser(null);
    setTab('dashboard');
  };

  // ── Security modal ────────────────────────────────────────────────────────
  const secCheck = (action: () => void, desc: string) => setSecCtx({ action, desc });

  // ── Delete ────────────────────────────────────────────────────────────────
  const requestDelete = (type: string, id: string) => {
    const op = currentUser?.fullName || 'System';
    const d = dataRef.current;
    let target: any =
      type === 'EXIT'      ? d.exits.find(e => e.id === id) :
      type === 'PPE'       ? d.ppeRecords.find(p => p.id === id) :
      type === 'PRODUCT'   ? d.products.find(p => p.code === id) :
      type === 'RECIPIENT' ? d.recipients.find(r => r.fullName === id) : null;

    if (currentUser?.role !== UserRole.ADMIN && (type === 'EXIT' || type === 'PPE')) {
      if (target?.delivererName !== currentUser?.fullName) {
        toast.error('شما فقط مجاز به حذف اسناد ثبت شده توسط خودتان هستید.');
        return;
      }
    }
    secCheck(() => {
      update(prev => ({
        ...prev,
        exits:      type === 'EXIT'      ? prev.exits.filter(e => e.id !== id)          : prev.exits,
        ppeRecords: type === 'PPE'       ? prev.ppeRecords.filter(p => p.id !== id)     : prev.ppeRecords,
        products:   type === 'PRODUCT'   ? prev.products.filter(p => p.code !== id)     : prev.products,
        recipients: type === 'RECIPIENT' ? prev.recipients.filter(r => r.fullName !== id): prev.recipients,
      }));
      const delOrigMsgId = (target as any)?.telegramMsgId;
      sendTelegramMessage(formatDeleteRequestMessage(type, id, op, target, delOrigMsgId), false, false);
    }, `تایید نهایی حذف ${type === 'EXIT' || type === 'PPE' ? 'سند' : 'داده'}: ${id}`);
  };

  const requestEdit = (record: ExitRecord) => {
    if (currentUser?.role !== UserRole.ADMIN && record.delivererName !== currentUser?.fullName) {
      toast.error('شما فقط مجاز به ویرایش اسناد ثبت شده توسط خودتان هستید.');
      return;
    }
    setEditingRecord(record);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <Cpu size={48} className="text-indigo-400 animate-pulse" />
        <p className="text-white/50 font-black tracking-widest text-sm">در حال بارگذاری...</p>
      </div>
    </div>
  );

  if (!currentUser) return (
    <AuthScreen
      users={data.users}
      onLogin={u => { setCurrentUser(u); sendTelegramMessage(formatWelcomeMessage(u), true, true); }}
    />
  );

  const { products, exits, recipients, ppeRecords, waybills, users } = data;
  const perms = getPerms(currentUser);

  // تب‌های قابل مشاهده بر اساس دسترسی
  const allTabs = [
    { id: 'dashboard',    label: 'میز کار',                  icon: LayoutDashboard, allowed: true },
    { id: 'exit',         label: 'خروج کالا',                icon: PackagePlus,     allowed: perms.canViewExit },
    { id: 'ppe',          label: 'ایمنی',                    icon: HardHat,         allowed: perms.canViewPPE },
    { id: 'unregistered', label: 'خروج کالاهای ثبت نشده',   icon: AlertCircle,     allowed: perms.canViewUnregistered },
    { id: 'warehouse',    label: 'انبار کالا',               icon: Box,             allowed: perms.canViewWarehouse },
    { id: 'personnel',    label: 'پرسنل',                    icon: Users,           allowed: perms.canViewPersonnel },
    { id: 'loans',        label: 'امانات',                   icon: RotateCcw,       allowed: perms.canViewLoans },
    { id: 'waybills',     label: 'بارنامه‌ها',               icon: Truck,           allowed: perms.canViewWaybills },
    { id: 'log',          label: 'دفتر کل',                  icon: BookOpen,        allowed: perms.canViewLog },
    { id: 'reports',      label: 'گزارش‌گیری اکسل',          icon: BarChart3,       allowed: perms.canViewReports },
    { id: 'system',       label: 'سیستم',                    icon: Settings,        allowed: true },
  ];

  return (
    <div className="min-h-screen text-white pb-10">
      {/* ── NAV ── */}
      {/* ULTRA HEADER */}
      <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(1,4,9,0.92)',backdropFilter:'blur(30px)',borderBottom:'1px solid rgba(99,102,241,0.15)',marginBottom:24,boxShadow:'0 4px 40px rgba(99,102,241,0.12)',overflow:'hidden'}} className="no-print">
        {/* Animated top border */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,#10b981,#6366f1,transparent)',backgroundSize:'200% 100%',animation:'headerBorder 3s linear infinite'}} />
        {/* Scanline */}
        <div style={{position:'absolute',inset:0,background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(99,102,241,0.01) 2px,rgba(99,102,241,0.01) 4px)',pointerEvents:'none'}} />

        <style>{`
          @keyframes headerBorder{0%{background-position:0% 0%}100%{background-position:200% 0%}}
          @keyframes logoGlow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)}50%{box-shadow:0 0 40px rgba(99,102,241,0.6),0 0 60px rgba(6,182,212,0.3)}}
          @keyframes tabSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
          @keyframes userPulse{0%,100%{opacity:1}50%{opacity:.7}}
          @keyframes logoRingSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes logoRingSpinRev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
          @keyframes logoPulse{0%,100%{transform:scale(1);box-shadow:0 0 8px rgba(99,102,241,0.8),0 0 16px rgba(6,182,212,0.4)}50%{transform:scale(1.18);box-shadow:0 0 16px rgba(99,102,241,1),0 0 32px rgba(6,182,212,0.6)}}
          @keyframes avatarConicSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes nameGlow{0%,100%{text-shadow:0 0 0px transparent}50%{text-shadow:0 0 10px rgba(167,139,250,0.6),0 0 20px rgba(99,102,241,0.4)}}
          @keyframes gradientFlow{0%{background-position:0% 50%}100%{background-position:200% 50%}}
          .ultra-tab{transition:all 0.2s cubic-bezier(0.4,0,0.2,1);}
          .ultra-tab:hover{background:rgba(99,102,241,0.1)!important;color:#fff!important;transform:translateY(-1px);}
          .ultra-tab.active{background:linear-gradient(135deg,rgba(99,102,241,0.25),rgba(6,182,212,0.15))!important;color:#fff!important;border-color:rgba(99,102,241,0.4)!important;box-shadow:0 4px 20px rgba(99,102,241,0.2),inset 0 1px 0 rgba(255,255,255,0.1)!important;transform:translateY(-1px);}
          .no-scrollbar::-webkit-scrollbar{display:none;}
        `}</style>

        <div style={{width:'100%',padding:'10px 24px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          
          {/* Logo + Brand */}
          <div style={{display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
            <div style={{position:'relative',width:54,height:54,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {/* Outer spinning ring */}
              <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid transparent',borderTopColor:'#6366f1',borderRightColor:'#6366f1',animation:'logoRingSpin 3s linear infinite'}} />
              {/* Middle spinning ring reverse */}
              <div style={{position:'absolute',inset:6,borderRadius:'50%',border:'2px solid transparent',borderBottomColor:'#06b6d4',borderLeftColor:'#06b6d4',animation:'logoRingSpinRev 2s linear infinite'}} />
              {/* Inner ring */}
              <div style={{position:'absolute',inset:11,borderRadius:'50%',border:'1.5px solid transparent',borderTopColor:'#a78bfa',animation:'logoRingSpin 4s linear infinite'}} />
              {/* Logo image circle */}
              <div style={{position:'relative',width:32,height:32,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',animation:'logoPulse 2.5s ease-in-out infinite',zIndex:1}}>
                <img src="data:image/png;base64,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sah0SHfSIdNBetwgvI753+Xz/bIC7r755KTNuv4crVL0mmYw8cZZrN0uo6uSCRWMENdeMYhbf38CANfc8i47Smopq6hm9otXMSA21e/P/5jLh18VM7iPjZ5d09ntDrBoWQmdcu18+NKk+ofD74/w1XdbWLqikPPHDWTUMd0aXMOhsqPIjSvFSma6g8dfWMhLb2/DYfKQne1kR7EHXZe8/8JlDBmQi88frn8LNQdSSj6at56dRdVcN/E47PbE5Ceam1YpeoBdZbX8d8YPbNtRSbe8DH49fkADYb72znKyMp3k5aYydGA0dQ6Qv72Sq256m+qgAyHA0MOMPrYD/7h7HLlZeyoKa70hdu/20avHgSedHC7FpTVcf9cHbN0ZQmLQvYuDB287leNawKWo9YRYvGwHihCMO/nI3oeq1Yr+cCgurWHBoh0EQyGGDerUokkWfzDCmg1lWEwKQwbmYE7UPleNpKo6gBDsd67BkUa76Ntpcxx5o5B22jlM2kXfTpujXfTttDnaRd9Om6Nd9O20OdpF306bo1307bQ52kXfTpujXfTttDnaRd9Om6Nd9O20OdpF306b4/8BgwXbYuuG85EAAAAASUVORK5CYII=" alt="logo" style={{width:'85%',height:'85%',objectFit:'contain'}} />
              </div>
            </div>
            <div>
              <h1 style={{fontSize:'16px',fontWeight:900,color:'#fff',letterSpacing:'-0.02em',lineHeight:1.1,margin:0}}>مدیریت انبار</h1>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981',animation:'userPulse 1.5s infinite'}} />
                <span style={{
                  fontSize:'9px',fontWeight:900,letterSpacing:'0.25em',textTransform:'uppercase',
                  background:'linear-gradient(90deg,#4f46e5,#06b6d4,#a78bfa,#06b6d4)',
                  backgroundSize:'300% 100%',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                  animation:'gradientFlow 3s linear infinite',
                }}>ONLINE · P21 ULTRA V4</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{width:1,height:36,background:'rgba(255,255,255,0.08)',flexShrink:0}} />

          {/* Tabs */}
          <div className="no-scrollbar" style={{flex:1,display:'flex',alignItems:'center',gap:4,overflowX:'auto',padding:'4px 0'}}>
            {allTabs.filter(t => t.allowed).map((t,i) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`ultra-tab${tab === t.id ? ' active' : ''}`}
                style={{
                  display:'flex',alignItems:'center',gap:6,
                  padding:'8px 12px',borderRadius:12,
                  border:`1px solid ${tab === t.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                  background: tab === t.id ? undefined : 'transparent',
                  color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'10px',
                  whiteSpace:'nowrap',cursor:'pointer',
                  animation:`tabSlide 0.3s ease ${i*0.03}s both`,
                }}>
                <t.icon size={12}/>{t.label}
              </button>
            ))}
          </div>

          {/* User + actions */}
          <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
            <div style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.18)',borderRadius:14,padding:'7px 14px',display:'flex',alignItems:'center',gap:10,position:'relative',overflow:'hidden'}}>
              {/* shimmer sweep */}
              <div style={{position:'absolute',inset:0,background:'linear-gradient(110deg,transparent 30%,rgba(99,102,241,0.07) 50%,transparent 70%)',backgroundSize:'200% 100%',animation:'headerBorder 3s ease-in-out infinite',borderRadius:14,pointerEvents:'none'}} />
              {/* Avatar with spinning conic ring */}
              <div style={{position:'relative',width:36,height:36,flexShrink:0}}>
                <div style={{position:'absolute',inset:-2,borderRadius:'50%',background:'conic-gradient(from 0deg,#6366f1,#06b6d4,#a78bfa,#10b981,#6366f1)',animation:'avatarConicSpin 3s linear infinite'}} />
                <div style={{position:'absolute',inset:1,borderRadius:'50%',background:'#010409'}} />
                <div style={{position:'absolute',inset:3,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:900,color:'#fff'}}>
                  {currentUser.fullName.charAt(0)}
                </div>
              </div>
              <div>
                <div style={{fontSize:'12px',fontWeight:900,color:'#fff',lineHeight:1,animation:'nameGlow 2.5s ease-in-out infinite'}}>{currentUser.fullName}</div>
                <div style={{
                  fontSize:'9px',fontWeight:700,letterSpacing:'0.08em',marginTop:3,
                  background:'linear-gradient(90deg,#a78bfa,#06b6d4,#34d399,#a78bfa)',
                  backgroundSize:'300% 100%',
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                  animation:'gradientFlow 4s linear infinite',
                }}>
                  {currentUser.role === 'ADMIN' ? 'ادمین و سازنده پلتفرم' : 'اپراتور'}
                </div>
              </div>
            </div>
            <button onClick={() => setAiOpen(true)} style={{width:38,height:38,borderRadius:12,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)',color:'#818cf8',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.3)';(e.currentTarget as HTMLElement).style.color='#fff';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.1)';(e.currentTarget as HTMLElement).style.color='#818cf8';}}
            ><Zap size={16}/></button>
            <button onClick={handleLogout} style={{width:38,height:38,borderRadius:12,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.25)';(e.currentTarget as HTMLElement).style.color='#fff';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.08)';(e.currentTarget as HTMLElement).style.color='#f87171';}}
            ><LogOut size={16}/></button>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{width:"100%",padding:"0 24px",boxSizing:"border-box"}}>

        {tab === 'dashboard' && <DashboardView exits={[...exits, ...ppeRecords]} />}

        {tab === 'exit' && perms.canViewExit && (
          <GeneralExitForm
            products={products} generalHistory={exits} recipients={recipients} currentUser={currentUser}
            onSave={perms.canAddExit ? async (rec: any) => {
              const hasLoan = rec.items.some((it:any) => it.isLoan);
              // پیام خروج کالا — دائمی
              const res = await sendTelegramMessage(formatExitMessage(rec), false, false);
              const msgId = res?.result?.message_id;
              // اگه امانی داشت — پیام امانی جداگانه دائمی
              let loanMsgId: number | undefined;
              if (hasLoan) {
                const loanRes = await sendTelegramMessage(formatLoanMessage(rec), false, false);
                loanMsgId = loanRes?.result?.message_id;
              }
              update(prev => ({ ...prev, exits: [{ ...rec, telegramMsgId: msgId, loanTelegramMsgId: loanMsgId }, ...prev.exits] }));
              setTempSig(''); setTempPhoto(null);
            } : undefined}
            onRecordClick={setSelectedRecord} onEdit={perms.canEditExit ? requestEdit : undefined}
            onDelete={perms.canDeleteExit ? (id, type) => requestDelete(type, id) : undefined}
            onSignOpen={() => setSignOpen(true)} onCamOpen={() => setCamOpen(true)}
            signature={tempSig} photo={tempPhoto}
          />
        )}

        {tab === 'ppe' && perms.canViewPPE && (
          <SafetyIssuanceForm
            recipients={recipients} currentUser={currentUser} history={ppeRecords}
            onRecordClick={setSelectedRecord} onEdit={perms.canEditPPE ? requestEdit : undefined}
            onDelete={perms.canDeletePPE ? (id, type) => requestDelete(type, id) : undefined}
            onSave={perms.canAddPPE ? async (rec: any) => {
              const ppeRes = await sendTelegramMessage(formatPpeMessage(rec), false, false);
              const ppeMsgId = ppeRes?.result?.message_id;
              update(prev => ({ ...prev, ppeRecords: [{ ...rec, telegramMsgId: ppeMsgId }, ...prev.ppeRecords] }));
              setTempSig(''); setTempPhoto(null);
            } : undefined}
            onSignOpen={() => setSignOpen(true)} onCamOpen={() => setCamOpen(true)}
            signature={tempSig} photo={tempPhoto}
          />
        )}

        {tab === 'unregistered' && perms.canViewUnregistered && (
          <UnregisteredExitsView
            exits={exits} products={products}
            onAssignCode={perms.canAssignCode ? (recordId, itemIndex, newCode) => {
              const product = products.find(p => p.code === newCode);
              update(prev => ({
                ...prev,
                exits: prev.exits.map(rec => {
                  if (rec.id !== recordId) return rec;
                  const newItems = [...rec.items];
                  newItems[itemIndex] = {
                    ...newItems[itemIndex], productCode: newCode,
                    productDescription: product ? product.description : newItems[itemIndex].productDescription,
                    category: product ? product.category : newItems[itemIndex].category,
                  };
                  return { ...rec, items: newItems };
                }),
              }));
              toast.success('کد کالا با موفقیت تخصیص یافت');
            } : undefined}
          />
        )}

        {tab === 'warehouse' && perms.canViewWarehouse && (
          <WarehouseManager
            products={products}
            onAdd={perms.canAddProduct ? (p: any) => { update(prev => ({ ...prev, products: [...prev.products, p] })); sendTelegramMessage(formatProductActionMessage('ADD', p, currentUser.fullName), false, true); } : undefined}
            onUpdate={perms.canEditProduct ? (p: any) => secCheck(() => { update(prev => ({ ...prev, products: prev.products.map(x => x.code === p.code ? p : x) })); sendTelegramMessage(formatProductActionMessage('UPDATE', p, currentUser.fullName), false, true); }, `ویرایش کالای: ${p.description}`) : undefined}
            onDelete={perms.canDeleteProduct ? (id: any) => requestDelete('PRODUCT', id) : undefined}
            isAdmin={currentUser.role === UserRole.ADMIN}
          />
        )}

        {tab === 'personnel' && perms.canViewPersonnel && (
          <PersonnelManager
            recipients={recipients}
            onAdd={perms.canAddPersonnel ? (r: any) => { update(prev => ({ ...prev, recipients: [...prev.recipients, r] })); sendTelegramMessage(formatPersonnelActionMessage('ADD', r, currentUser.fullName), false, true); } : undefined}
            onUpdate={perms.canEditPersonnel ? (r: any) => secCheck(() => { update(prev => ({ ...prev, recipients: prev.recipients.map(x => x.fullName === r.fullName ? r : x) })); sendTelegramMessage(formatPersonnelActionMessage('UPDATE', r, currentUser.fullName), false, true); }, `ویرایش اطلاعات پرسنل: ${r.fullName}`) : undefined}
            onDelete={perms.canDeletePersonnel ? (id: any) => requestDelete('RECIPIENT', id) : undefined}
            isAdmin={currentUser.role === UserRole.ADMIN}
          />
        )}

        {tab === 'loans' && perms.canViewLoans && (
          <LoanManager
            exits={[...exits, ...ppeRecords]}
            onRecordClick={setSelectedRecord}
            onReturn={perms.canReturnLoan ? (rid: any, idx: any, condition: string) => {
              const isExit = exits.some(e => e.id === rid);
              const list   = isExit ? exits : ppeRecords;
              const rec    = list.find(r => r.id === rid);
              if (!rec) return;
              const updatedItems = rec.items.filter((_, i) => i !== idx);
              update(prev => ({
                ...prev,
                exits:      isExit ? (updatedItems.length === 0 ? prev.exits.filter(r => r.id !== rid) : prev.exits.map(r => r.id === rid ? { ...rec, items: updatedItems } : r)) : prev.exits,
                ppeRecords: !isExit ? (updatedItems.length === 0 ? prev.ppeRecords.filter(r => r.id !== rid) : prev.ppeRecords.map(r => r.id === rid ? { ...rec, items: updatedItems } : r)) : prev.ppeRecords,
              }));
              const loanOrigMsgId = (rec as any).loanTelegramMsgId || (rec as any).telegramMsgId;
              sendTelegramMessage(formatReturnLoanMessage(rec.recipientName, rec.items[idx].productDescription, rec.docNumber, currentUser.fullName, condition, loanOrigMsgId), false, false);
            } : undefined}
          />
        )}

        {tab === 'waybills' && perms.canViewWaybills && (
          <WaybillManager
            waybills={waybills} currentUser={currentUser}
            onSave={perms.canAddWaybill ? (wb) => update(prev => ({ ...prev, waybills: prev.waybills.some(w => w.id === wb.id) ? prev.waybills.map(w => w.id === wb.id ? wb : w) : [wb, ...prev.waybills] })) : undefined}
            onDelete={perms.canDeleteWaybill ? (id) => update(prev => ({ ...prev, waybills: prev.waybills.filter(w => w.id !== id) })) : undefined}
          />
        )}

        {tab === 'log' && perms.canViewLog && (
          <GlobalLogView
            exits={[...exits, ...ppeRecords]} isAdmin={currentUser.role === UserRole.ADMIN}
            onRowClick={setSelectedRecord} onEdit={setEditingRecord}
            onDelete={(id, type) => requestDelete(type, id)}
          />
        )}

        {tab === 'reports' && perms.canViewReports && (
          <ReportingView exits={[...exits, ...ppeRecords]} products={products} onRowClick={setSelectedRecord} />
        )}

        {tab === 'system' && (
          <SystemSettings
            currentUser={currentUser} users={users}
            onUpdateUser={(u: any) => {
              update(prev => ({ ...prev, users: prev.users.map(x => x.id === u.id ? u : x) }));
              if (u.id === currentUser.id) setCurrentUser(u);
              sendTelegramMessage(formatUserActionMessage('UPDATE', u, currentUser.fullName), false, true);
            }}
            onAddUser={(u: any) => {
              update(prev => ({ ...prev, users: [...prev.users, u] }));
              sendTelegramMessage(formatUserActionMessage('ADD', u, currentUser.fullName), false, true);
            }}
            onDeleteUser={(id: any) => secCheck(() => {
              const u = users.find(x => x.id === id);
              update(prev => ({ ...prev, users: prev.users.filter(x => x.id !== id) }));
              if (u) sendTelegramMessage(formatUserActionMessage('DELETE', u, currentUser.fullName), false, true);
            }, `حذف دسترسی کاربر: ${users.find(x => x.id === id)?.fullName}`)}
            db={{ products, exits, recipients, ppeRecords, users, waybills }}
            onRestore={(d: any) => {
              const restored: AppData = {
                products:   d.products   || [],
                exits:      d.exits      || [],
                recipients: d.recipients || [],
                ppeRecords: d.ppeRecords || d.ppe || [],
                waybills:   d.waybills   || [],
                users:      d.users      || users,
              };
              _dirty += 1;
              setData(restored);
              _doSave(restored);
              sendTelegramMessage(formatRestoreMessage(currentUser.fullName), false, true);
            }}
            isAdmin={currentUser.role === UserRole.ADMIN}
          />
        )}
      </main>

      {/* ── OVERLAYS ── */}
      {selectedRecord && <RecordOverlay record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      {editingRecord && (
        <EditOverlay
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={(rec: any) => {
            update(prev => ({
              ...prev,
              exits:      rec.type === 'EXIT' ? prev.exits.map(r => r.id === rec.id ? rec : r) : prev.exits,
              ppeRecords: rec.type !== 'EXIT' ? prev.ppeRecords.map(r => r.id === rec.id ? rec : r) : prev.ppeRecords,
            }));
            const editOrigMsgId = (rec as any).telegramMsgId;
            sendTelegramMessage(formatEditRecordMessage(rec, currentUser.fullName, editOrigMsgId), false, false);
            setEditingRecord(null);
          }}
        />
      )}

      {secCtx && (
        <ModificationAuthModal
          onClose={() => setSecCtx(null)}
          onSuccess={() => { secCtx.action(); setSecCtx(null); }}
          onFail={() => { setSecCtx(null); handleLogout(); }}
          correctPass={currentUser.modPassword || ''}
          description={secCtx.desc}
        />
      )}

      {aiOpen   && <AIAssistantOverlay onClose={() => setAiOpen(false)} products={products} exits={[...exits, ...ppeRecords]} recipients={recipients} />}
      <SignatureModal isOpen={signOpen} onClose={(sig: string | null) => { if (sig) setTempSig(sig);    setSignOpen(false); }} name="پرسنل" />
      <CameraModal   isOpen={camOpen}  onClose={(p:   string | null) => { if (p)   setTempPhoto(p);    setCamOpen(false);  }} />
    <ToastContainer />
    </div>
  );
}
