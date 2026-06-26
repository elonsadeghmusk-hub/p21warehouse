/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database, Download, RefreshCcw, UserCog, UserPlus, UserMinus, ShieldCheck,
  Eye, Edit3, Trash2, Plus, Shield, Zap, Lock, Unlock, ChevronDown,
  PackagePlus, HardHat, Box, Users, RotateCcw, Truck, BookOpen, BarChart3, AlertCircle,
  CheckCircle2, XCircle, Settings2, Crown, UserCircle2, Key
} from 'lucide-react';
import { User, UserRole, UserPermissions, DEFAULT_ADMIN_PERMISSIONS, DEFAULT_OPERATOR_PERMISSIONS, EMPTY_PERMISSIONS } from '../types';
import { sendTelegramBackup } from '../services/telegramService';

interface SystemSettingsProps {
  currentUser: User;
  users: User[];
  onUpdateUser: (user: User) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  db: any;
  onRestore: (data: any) => void;
  isAdmin: boolean;
}

// گروه‌بندی دسترسی‌ها برای نمایش
const PERMISSION_GROUPS = [
  {
    id: 'exit', label: 'خروج کالا', icon: PackagePlus, color: 'indigo',
    perms: [
      { key: 'canViewExit',   label: 'مشاهده', icon: Eye },
      { key: 'canAddExit',    label: 'ثبت',    icon: Plus },
      { key: 'canEditExit',   label: 'ویرایش', icon: Edit3 },
      { key: 'canDeleteExit', label: 'حذف',    icon: Trash2 },
    ]
  },
  {
    id: 'ppe', label: 'ایمنی HSE', icon: HardHat, color: 'emerald',
    perms: [
      { key: 'canViewPPE',   label: 'مشاهده', icon: Eye },
      { key: 'canAddPPE',    label: 'ثبت',    icon: Plus },
      { key: 'canEditPPE',   label: 'ویرایش', icon: Edit3 },
      { key: 'canDeletePPE', label: 'حذف',    icon: Trash2 },
    ]
  },
  {
    id: 'warehouse', label: 'انبار کالا', icon: Box, color: 'cyan',
    perms: [
      { key: 'canViewWarehouse',  label: 'مشاهده', icon: Eye },
      { key: 'canAddProduct',     label: 'افزودن', icon: Plus },
      { key: 'canEditProduct',    label: 'ویرایش', icon: Edit3 },
      { key: 'canDeleteProduct',  label: 'حذف',    icon: Trash2 },
    ]
  },
  {
    id: 'personnel', label: 'پرسنل', icon: Users, color: 'violet',
    perms: [
      { key: 'canViewPersonnel',   label: 'مشاهده', icon: Eye },
      { key: 'canAddPersonnel',    label: 'افزودن', icon: Plus },
      { key: 'canEditPersonnel',   label: 'ویرایش', icon: Edit3 },
      { key: 'canDeletePersonnel', label: 'حذف',    icon: Trash2 },
    ]
  },
  {
    id: 'waybills', label: 'بارنامه‌ها', icon: Truck, color: 'orange',
    perms: [
      { key: 'canViewWaybills',  label: 'مشاهده', icon: Eye },
      { key: 'canAddWaybill',    label: 'افزودن', icon: Plus },
      { key: 'canEditWaybill',   label: 'ویرایش', icon: Edit3 },
      { key: 'canDeleteWaybill', label: 'حذف',    icon: Trash2 },
    ]
  },
  {
    id: 'loans', label: 'امانات', icon: RotateCcw, color: 'yellow',
    perms: [
      { key: 'canViewLoans',  label: 'مشاهده', icon: Eye },
      { key: 'canReturnLoan', label: 'برگشت',  icon: RotateCcw },
    ]
  },
  {
    id: 'unregistered', label: 'خروج ثبت‌نشده', icon: AlertCircle, color: 'red',
    perms: [
      { key: 'canViewUnregistered', label: 'مشاهده',   icon: Eye },
      { key: 'canAssignCode',       label: 'تخصیص کد', icon: Plus },
    ]
  },
  {
    id: 'reports', label: 'گزارشات', icon: BarChart3, color: 'sky',
    perms: [
      { key: 'canViewReports', label: 'گزارشات',  icon: BarChart3 },
      { key: 'canViewLog',     label: 'دفتر کل',  icon: BookOpen },
      { key: 'canExportData',  label: 'صدور داده', icon: Download },
    ]
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string; btnOn: string; btnOff: string }> = {
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-300',  glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]',  btnOn: 'bg-indigo-600 border-indigo-500',   btnOff: 'bg-white/5 border-white/10' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]', btnOn: 'bg-emerald-600 border-emerald-500', btnOff: 'bg-white/5 border-white/10' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    text: 'text-cyan-300',    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',   btnOn: 'bg-cyan-600 border-cyan-500',       btnOff: 'bg-white/5 border-white/10' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-300',  glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',  btnOn: 'bg-violet-600 border-violet-500',   btnOff: 'bg-white/5 border-white/10' },
  orange:  { bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-300',  glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',  btnOn: 'bg-orange-600 border-orange-500',   btnOff: 'bg-white/5 border-white/10' },
  yellow:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-300',  glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',   btnOn: 'bg-yellow-600 border-yellow-500',   btnOff: 'bg-white/5 border-white/10' },
  red:     { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-300',     glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',   btnOn: 'bg-red-600 border-red-500',         btnOff: 'bg-white/5 border-white/10' },
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     text: 'text-sky-300',     glow: 'shadow-[0_0_15px_rgba(14,165,233,0.2)]',  btnOn: 'bg-sky-600 border-sky-500',         btnOff: 'bg-white/5 border-white/10' },
};

function getEffectivePermissions(user: User): UserPermissions {
  if (user.permissions) return user.permissions;
  return user.role === UserRole.ADMIN ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_OPERATOR_PERMISSIONS;
}

function countActivePerms(perms: UserPermissions): number {
  return Object.values(perms).filter(Boolean).length;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  currentUser, users, onUpdateUser, onAddUser, onDeleteUser, db, onRestore, isAdmin
}) => {
  const [uName, setUName]   = useState('');
  const [uPass, setUPass]   = useState('');
  const [uFull, setUFull]   = useState('');
  const [uRole, setURole]   = useState(UserRole.OPERATOR);
  const [uMod,  setUMod]    = useState('');
  const [myNewPass, setMyNewPass] = useState('');
  const [myNewMod,  setMyNewMod]  = useState('');

  // کدام کاربر در حال ویرایش دسترسی است
  const [editingPermsFor, setEditingPermsFor] = useState<string | null>(null);
  // دسترسی‌های در حال ویرایش (local state)
  const [draftPerms, setDraftPerms] = useState<UserPermissions>(EMPTY_PERMISSIONS);

  const openPermEditor = (user: User) => {
    setDraftPerms({ ...getEffectivePermissions(user) });
    setEditingPermsFor(user.id);
  };

  const togglePerm = (key: keyof UserPermissions) => {
    setDraftPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (preset: 'full' | 'readonly' | 'none') => {
    if (preset === 'full')     setDraftPerms({ ...DEFAULT_ADMIN_PERMISSIONS });
    if (preset === 'readonly') setDraftPerms({
      canViewExit: true, canAddExit: false, canEditExit: false, canDeleteExit: false,
      canViewPPE: true, canAddPPE: false, canEditPPE: false, canDeletePPE: false,
      canViewWarehouse: true, canAddProduct: false, canEditProduct: false, canDeleteProduct: false,
      canViewPersonnel: true, canAddPersonnel: false, canEditPersonnel: false, canDeletePersonnel: false,
      canViewWaybills: true, canAddWaybill: false, canEditWaybill: false, canDeleteWaybill: false,
      canViewLoans: true, canReturnLoan: false,
      canViewUnregistered: true, canAssignCode: false,
      canViewReports: true, canViewLog: true, canExportData: false,
    });
    if (preset === 'none') setDraftPerms({ ...EMPTY_PERMISSIONS });
  };

  const savePerms = () => {
    const user = users.find(u => u.id === editingPermsFor);
    if (!user) return;
    onUpdateUser({ ...user, permissions: { ...draftPerms } });
    setEditingPermsFor(null);
  };

  const LS_KEY = 'p21_gemini_key';
  const [anthropicKey, setAnthropicKey] = React.useState(() => localStorage.getItem(LS_KEY) || '');
  const [keyStatus, setKeyStatus] = React.useState<'idle'|'saving'|'saved'|'error'>('idle');

  // همچنین از سرور هم بخون (اگه key تازه‌تری داشت)
  React.useEffect(() => {
    fetch('/api/settings/anthropic-key')
      .then(r=>r.json())
      .then(d=>{ 
        if(d.key && !localStorage.getItem(LS_KEY)) {
          setAnthropicKey(d.key);
          localStorage.setItem(LS_KEY, d.key);
        }
      })
      .catch(()=>{});
  }, []);

  const saveAnthropicKey = async () => {
    if (!anthropicKey.trim()) return;
    setKeyStatus('saving');
    // اول در localStorage ذخیره کن — فوری و قابل اطمینان
    localStorage.setItem(LS_KEY, anthropicKey.trim());
    // بعد هم در سرور
    try {
      await fetch('/api/settings/anthropic-key', { 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body: JSON.stringify({ key: anthropicKey.trim() }) 
      });
    } catch { /* نادیده — localStorage کافیه */ }
    setKeyStatus('saved'); 
    setTimeout(()=>setKeyStatus('idle'), 2500);
  };

  const handleFullBackup = async () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `P21_Backup_${Date.now()}.json`;
    a.click();
    sendTelegramBackup(db);
    alert('بک‌آپ صادر و به تلگرام ارسال شد.');
  };

  const activeCount = countActivePerms(draftPerms);
  const totalPerms = Object.keys(EMPTY_PERMISSIONS).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-enter no-print pb-10">
      <style>{`
        @keyframes sysGlow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.1)}50%{box-shadow:0 0 40px rgba(99,102,241,0.25)}}
        @keyframes sysScan{0%{left:-100%}100%{left:100%}}
        @keyframes sysFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .sys-card{position:relative;background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(6,182,212,0.03));border:1px solid rgba(99,102,241,0.15);border-radius:28px;padding:32px;overflow:hidden;animation:sysGlow 4s ease-in-out infinite;}
        .sys-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent);}
        .sys-card::after{content:'';position:absolute;bottom:0;left:-100%;width:40%;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent);animation:sysScan 4s linear infinite;}
        .sys-btn{background:linear-gradient(135deg,#4f46e5,#6366f1);border:1px solid rgba(255,255,255,0.1);border-radius:16px;color:#fff;font-family:inherit;font-weight:900;font-size:12px;letter-spacing:0.1em;padding:14px 20px;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;gap:10px;justify-content:center;text-transform:uppercase;}
        .sys-btn:hover{filter:brightness(1.2);transform:translateY(-2px);box-shadow:0 8px 30px rgba(99,102,241,0.4);}
        .sys-btn-cyan{background:linear-gradient(135deg,#0891b2,#06b6d4);}
        .sys-btn-cyan:hover{box-shadow:0 8px 30px rgba(6,182,212,0.4);}
        .sys-btn-red{background:linear-gradient(135deg,#dc2626,#ef4444);}
        .sys-btn-red:hover{box-shadow:0 8px 30px rgba(239,68,68,0.4);}
        .sys-icon-box{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);margin:0 auto 20px;animation:sysFloat 3s ease-in-out infinite;}
      `}</style>

      {/* ── ستون چپ ── */}
      <div className="lg:col-span-8 space-y-6">

        {/* کلید API هوش مصنوعی — فقط ادمین */}
        {isAdmin && <div className="sys-card">
          <div className="sys-icon-box" style={{background:'rgba(6,182,212,0.12)',border:'1px solid rgba(6,182,212,0.25)'}}><Zap size={28} color="#67e8f9" /></div>
          <h3 className="text-xl font-black uppercase tracking-widest mb-2" style={{color:'#67e8f9'}}>کلید API هوش مصنوعی</h3>
          <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-6">برای استخراج اطلاعات بارنامه — Anthropic Claude</p>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <input
              type="password"
              value={anthropicKey}
              onChange={e=>setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{flex:1,background:'rgba(6,182,212,0.06)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:12,padding:'12px 16px',color:'#fff',fontFamily:'monospace',fontSize:13,outline:'none',direction:'ltr'}}
            />
            <button onClick={saveAnthropicKey} className="sys-btn sys-btn-cyan" style={{minWidth:100,padding:'12px 16px'}}>
              {keyStatus==='saving' ? '...' : keyStatus==='saved' ? '✓ ذخیره شد' : keyStatus==='error' ? '✗ خطا' : '💾 ذخیره'}
            </button>
          </div>
          {anthropicKey && <p className="text-[10px] mt-3" style={{color:'rgba(103,232,249,0.5)'}}>✓ کلید تنظیم شده — استخراج بارنامه فعال است</p>}
          {!anthropicKey && <p className="text-[10px] mt-3" style={{color:'rgba(255,100,100,0.6)'}}>⚠ کلید وارد نشده — استخراج بارنامه غیرفعال است</p>}
        </div>}

        {/* پشتیبان‌گیری */}
        <div className="sys-card text-center">
          <div className="sys-icon-box"><Database size={28} color="#818cf8" /></div>
          <h3 className="text-xl font-black ultra-glow-text uppercase tracking-widest mb-2">پشتیبان‌گیری و بازیابی</h3>
          <p className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-8">کنترل کامل پشتیبان‌گیری و بازیابی داده‌های عملیاتی</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleFullBackup} className="sys-btn">
              <Download size={22}/> صدور بک‌آپ کامل
            </button>
            <label className="sys-btn sys-btn-cyan cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => onRestore(JSON.parse(ev.target?.result as string));
                  reader.readAsText(file);
                  alert('بازیابی اطلاعات با موفقیت انجام شد.');
                }
              }} />
              <RefreshCcw size={22}/> بازیابی دیتابیس
            </label>
          </div>
        </div>

        {/* مدیریت کاربران - فقط ادمین */}
        {isAdmin ? (
          <div className="diamond-neon p-8 rounded-[3rem] bg-black/60 border border-indigo-500/10 space-y-8 shadow-2xl">
            <h3 className="text-xl font-black text-indigo-300 flex items-center gap-4 uppercase tracking-tighter border-b border-white/5 pb-4">
              <UserCog size={28}/> مدیریت کاربران و دسترسی‌ها
            </h3>

            {/* فرم افزودن کاربر */}
            <div className="bg-white/3 rounded-2xl p-6 border border-white/5 space-y-4">
              <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <UserPlus size={14}/> افزودن کاربر جدید
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 font-black uppercase">نام کاربری (ID)</label>
                  <input placeholder="username..." value={uName} onChange={e=>setUName(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 font-black uppercase">نام نمایشی</label>
                  <input placeholder="Full Name..." value={uFull} onChange={e=>setUFull(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 font-black uppercase">رمز عبور ورود</label>
                  <input type="password" placeholder="Entry Password..." value={uPass} onChange={e=>setUPass(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 font-black uppercase">رمز عبور امنیتی (Mod)</label>
                  <input type="password" placeholder="Mod Password..." value={uMod} onChange={e=>setUMod(e.target.value)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-40 font-black uppercase">نقش پایه</label>
                  <select value={uRole} onChange={e=>setURole(e.target.value as UserRole)} className="w-full input-glass p-4 rounded-2xl shadow-inner font-black">
                    <option value={UserRole.ADMIN}>مدیر ارشد (Admin)</option>
                    <option value={UserRole.OPERATOR}>کاربر (Operator)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => {
                    if (!uName || !uPass) return;
                    const basePerms = uRole === UserRole.ADMIN ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_OPERATOR_PERMISSIONS;
                    onAddUser({ id: Date.now().toString(), username: uName, password: uPass, fullName: uFull, role: uRole, modPassword: uMod, permissions: basePerms });
                    setUName(''); setUPass(''); setUFull(''); setUMod('');
                  }} className="w-full bg-indigo-600 rounded-2xl font-black text-sm h-[58px] flex items-center justify-center gap-3 transition-all hover:bg-indigo-500 shadow-xl active:scale-95 uppercase tracking-widest">
                    <UserPlus size={20}/> افزودن کاربر
                  </button>
                </div>
              </div>
            </div>

            {/* لیست کاربران */}
            <div className="space-y-4">
              {users.map((u) => {
                const perms = getEffectivePermissions(u);
                const active = countActivePerms(perms);
                const isEditingThis = editingPermsFor === u.id;
                const isCurrentUser = u.id === currentUser.id;
                const isRootAdmin = u.id === '1';

                return (
                  <div key={u.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg
                    ${isEditingThis ? 'border-indigo-500/60 bg-indigo-950/40 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-white/8 bg-white/3 hover:border-indigo-500/20'}`}>

                    {/* هدر کارت کاربر */}
                    <div className="flex items-center gap-4 p-5">
                      {/* آواتار */}
                      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner flex-shrink-0
                        ${u.role === UserRole.ADMIN ? 'bg-indigo-500/20 ring-2 ring-indigo-500/30' : 'bg-white/5 ring-1 ring-white/10'}`}>
                        {u.fullName.charAt(0)}
                        {u.role === UserRole.ADMIN && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown size={11} className="text-black"/>
                          </div>
                        )}
                        {isCurrentUser && (
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></div>
                        )}
                      </div>

                      {/* اطلاعات */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-base">{u.fullName}</span>
                          {isCurrentUser && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">شما</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] text-white/30 font-mono">@{u.username}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border
                            ${u.role === UserRole.ADMIN ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'}`}>
                            {u.role === UserRole.ADMIN ? 'Admin' : 'Operator'}
                          </span>
                        </div>
                        {/* نوار دسترسی */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${(active / totalPerms) * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-white/30 font-black">{active}/{totalPerms}</span>
                        </div>
                      </div>

                      {/* دکمه‌ها */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => isEditingThis ? setEditingPermsFor(null) : openPermEditor(u)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all
                            ${isEditingThis ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'}`}
                        >
                          <Shield size={13}/> دسترسی
                          <ChevronDown size={12} className={`transition-transform duration-300 ${isEditingThis ? 'rotate-180' : ''}`}/>
                        </button>
                        {!isRootAdmin && (
                          <button onClick={() => onDeleteUser(u.id)} className="text-red-500 p-2.5 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                            <UserMinus size={18}/>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* پانل ویرایش دسترسی */}
                    {isEditingThis && (
                      <div className="border-t border-white/5 p-5 space-y-5 animate-enter">

                        {/* پیش‌تنظیم‌ها */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">پیش‌تنظیم:</span>
                          <button onClick={() => applyPreset('full')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black hover:bg-emerald-600/40 transition-all">
                            <Unlock size={11}/> دسترسی کامل
                          </button>
                          <button onClick={() => applyPreset('readonly')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-black hover:bg-cyan-600/40 transition-all">
                            <Eye size={11}/> فقط مشاهده
                          </button>
                          <button onClick={() => applyPreset('none')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black hover:bg-red-600/40 transition-all">
                            <Lock size={11}/> بدون دسترسی
                          </button>
                        </div>

                        {/* گروه‌های دسترسی */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {PERMISSION_GROUPS.map(group => {
                            const c = COLOR_MAP[group.color];
                            const groupActive = group.perms.filter(p => draftPerms[p.key as keyof UserPermissions]).length;
                            return (
                              <div key={group.id} className={`rounded-2xl border p-4 ${c.bg} ${c.border} ${c.glow}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${c.text}`}>
                                    <group.icon size={14}/>
                                    {group.label}
                                  </div>
                                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                                    {groupActive}/{group.perms.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {group.perms.map(perm => {
                                    const isOn = draftPerms[perm.key as keyof UserPermissions];
                                    return (
                                      <button
                                        key={perm.key}
                                        onClick={() => togglePerm(perm.key as keyof UserPermissions)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all
                                          ${isOn ? `${c.btnOn} text-white shadow-md` : `${c.btnOff} text-white/30 hover:text-white/60`}`}
                                      >
                                        {isOn ? <CheckCircle2 size={11}/> : <XCircle size={11}/>}
                                        {perm.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* نوار پیشرفت و دکمه ذخیره */}
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-[9px] text-white/30 font-black mb-1.5">
                              <span>سطح دسترسی</span>
                              <span>{activeCount} از {totalPerms} مجوز فعال</span>
                            </div>
                            <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${(activeCount / totalPerms) * 100}%` }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={savePerms}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl border-t border-white/10 active:scale-95"
                          >
                            <Settings2 size={14}/> ذخیره دسترسی‌ها
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="diamond-neon p-8 rounded-[3rem] bg-black/60 border border-indigo-500/10 shadow-2xl flex flex-col items-center justify-center text-center py-16">
            <ShieldCheck size={48} className="text-indigo-400 mb-4 opacity-20"/>
            <p className="text-[10px] opacity-30 font-black uppercase tracking-widest">دسترسی محدود — فقط ادمین</p>
          </div>
        )}
      </div>

      {/* ── ستون راست ── */}
      <div className="lg:col-span-4 space-y-6">

        {/* کارت کاربر جاری */}
        <div className="diamond-neon p-6 rounded-3xl border-indigo-500/10 shadow-xl">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <UserCircle2 size={14}/> پروفایل من
          </h4>
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner
              ${currentUser.role === UserRole.ADMIN ? 'bg-indigo-500/20 ring-2 ring-indigo-500/40' : 'bg-white/5 ring-1 ring-white/10'}`}>
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="font-black text-lg">{currentUser.fullName}</div>
              <div className="text-[10px] text-white/30 font-mono">@{currentUser.username}</div>
              <div className={`text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded-full inline-block
                ${currentUser.role === UserRole.ADMIN ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                {currentUser.role === UserRole.ADMIN ? '👑 Administrator' : '⚡ Operator'}
              </div>
            </div>
          </div>

          {/* دسترسی‌های من */}
          <div className="space-y-2">
            <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">دسترسی‌های فعال من</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PERMISSION_GROUPS.map(group => {
                const c = COLOR_MAP[group.color];
                const myPerms = getEffectivePermissions(currentUser);
                const hasAny = group.perms.some(p => myPerms[p.key as keyof UserPermissions]);
                return (
                  <div key={group.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-[9px] font-black transition-all
                    ${hasAny ? `${c.bg} ${c.border} ${c.text}` : 'bg-white/2 border-white/5 text-white/15'}`}>
                    <group.icon size={11}/>
                    {group.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* تغییر رمزها */}
        <div className="diamond-neon p-6 rounded-3xl border-indigo-500/10 shadow-xl space-y-4">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
            <Key size={14}/> تغییر رمز عبور
          </h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] opacity-40 font-black uppercase">رمز ورود جدید</label>
              <input type="password" placeholder="New Login Password..." value={myNewPass} onChange={e=>setMyNewPass(e.target.value)} className="w-full input-glass p-3 rounded-xl shadow-inner font-mono text-[12px]" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] opacity-40 font-black uppercase">رمز امنیتی (Mod) جدید</label>
              <input type="password" placeholder="New Mod Password..." value={myNewMod} onChange={e=>setMyNewMod(e.target.value)} className="w-full input-glass p-3 rounded-xl shadow-inner font-mono text-[12px]" />
            </div>
            <button onClick={() => {
              const updated = { ...currentUser };
              if (myNewPass) updated.password = myNewPass;
              if (myNewMod) updated.modPassword = myNewMod;
              onUpdateUser(updated);
              setMyNewPass(''); setMyNewMod('');
              alert('رمزها با موفقیت بروز شدند.');
            }} className="w-full py-3 rounded-xl bg-indigo-600 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl border-t border-white/10 active:scale-95">
              ذخیره تغییرات
            </button>
          </div>
        </div>

        {/* اطلاعات سیستم */}
        <div className="diamond-neon p-6 rounded-3xl border-indigo-500/10 shadow-xl">
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
            <Zap size={14}/> آمار سیستم
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'کاربران', value: users.length, color: 'text-indigo-400' },
              { label: 'خروج کالا', value: db.exits?.length || 0, color: 'text-cyan-400' },
              { label: 'پرونده HSE', value: db.ppeRecords?.length || 0, color: 'text-emerald-400' },
              { label: 'کالاها', value: db.products?.length || 0, color: 'text-orange-400' },
              { label: 'پرسنل', value: db.recipients?.length || 0, color: 'text-violet-400' },
              { label: 'بارنامه', value: db.waybills?.length || 0, color: 'text-yellow-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
