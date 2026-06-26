/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { toast } from './Toast';
import React, { useState, useMemo } from 'react';
import { BarChart2, Download, Search, Filter, Calendar, Tag, TrendingUp, Package, Users, RefreshCw, Eye, FileText, Zap } from 'lucide-react';
import { ExitRecord, Product } from '../types';
import * as XLSX from 'xlsx';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface ReportingViewProps { exits:ExitRecord[]; products:Product[]; onRowClick:(r:ExitRecord)=>void; }

const toEn = (s:string)=>s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());

const Bar:React.FC<{value:number;max:number;color:string}> = ({value,max,color})=>(
  <div style={{height:5,background:'rgba(255,255,255,.06)',borderRadius:3,overflow:'hidden',flex:1}}>
    <div style={{height:'100%',width:`${max>0?(value/max)*100:0}%`,background:color,borderRadius:3,boxShadow:`0 0 6px ${color}80`,transition:'width 1s ease'}} />
  </div>
);

const Stat:React.FC<{icon:React.ReactNode;label:string;value:number|string;color:string}> = ({icon,label,value,color})=>(
  <div style={{background:`${color}0d`,border:`1px solid ${color}28`,borderRadius:20,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${color},transparent)`}} />
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
      <div style={{width:34,height:34,borderRadius:10,background:`${color}18`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{icon}</div>
      <span style={{fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.3)',letterSpacing:'.2em',textTransform:'uppercase'}}>{label}</span>
    </div>
    <div style={{fontSize:'30px',fontWeight:900,color,lineHeight:1,textShadow:`0 0 20px ${color}60`}}>{value}</div>
  </div>
);

export const ReportingView: React.FC<ReportingViewProps> = ({ exits, products, onRowClick }) => {
  const [startDate, setStartDate] = useState<Date|null>(null);
  const [endDate,   setEndDate]   = useState<Date|null>(null);
  const [cat,  setCat]   = useState('');
  const [type, setType]  = useState('');
  const [q,    setQ]     = useState('');
  const [recip,setRecip] = useState('');
  const [view, setView]  = useState<'table'|'analytics'>('table');

  const categories = useMemo(()=>{ const s=new Set<string>(); products.forEach(p=>{if(p.category)s.add(p.category);}); exits.forEach(e=>{e.items.forEach(it=>{if(it.category)s.add(it.category);});}); return Array.from(s).sort(); },[products,exits]);
  const recipients  = useMemo(()=>Array.from(new Set(exits.map(e=>e.recipientName))).sort(),[exits]);

  const filtered = useMemo(()=>{
    return exits.sort((a,b)=>b.timestamp-a.timestamp).filter(e=>{
      const sl=toEn(q.toLowerCase());
      const mQ=!q||toEn(e.recipientName.toLowerCase()).includes(sl)||toEn(e.docNumber.toLowerCase()).includes(sl)||e.items.some(it=>toEn(it.productDescription.toLowerCase()).includes(sl));
      const mC=!cat||e.items.some(it=>it.category===cat);
      const mT=!type||e.type===type;
      const mR=!recip||e.recipientName===recip;
      
      // تاریخ رکورد — اگه timestamp داره از اون استفاده کن، وگرنه تاریخ فارسی رو parse کن
      let rd: Date;
      if (e.timestamp && e.timestamp > 0) {
        rd = new Date(e.timestamp);
      } else {
        // تبدیل تاریخ فارسی به میلادی (تقریبی)
        const parts = toEn(e.date || '').split('/');
        if (parts.length === 3) {
          const jy = parseInt(parts[0]), jm = parseInt(parts[1]), jd = parseInt(parts[2]);
          // تبدیل جلالی به میلادی ساده
          const gy = jy + 621;
          rd = new Date(gy, jm - 1, jd);
        } else {
          rd = new Date();
        }
      }

      let mD = true;
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (rd < s) mD = false;
      }
      if (endDate && mD) {
        const en = new Date(endDate);
        en.setHours(23, 59, 59, 999);
        if (rd > en) mD = false;
      }

      return mQ&&mC&&mT&&mR&&mD;
    });
  },[exits,q,cat,type,recip,startDate,endDate]);

  const analytics = useMemo(()=>{
    const pm:Record<string,number>={}, km:Record<string,number>={}, cm:Record<string,number>={}; let tot=0;
    filtered.forEach(e=>{ pm[e.recipientName]=(pm[e.recipientName]||0)+e.items.length; e.items.forEach(it=>{km[it.productDescription]=(km[it.productDescription]||0)+it.quantity; if(it.category)cm[it.category]=(cm[it.category]||0)+it.quantity; tot+=it.quantity;}); });
    return { total:tot, persons:Object.entries(pm).sort((a,b)=>b[1]-a[1]).slice(0,8), products:Object.entries(km).sort((a,b)=>b[1]-a[1]).slice(0,8), cats:Object.entries(cm).sort((a,b)=>b[1]-a[1]).slice(0,6) };
  },[filtered]);

  const clear = ()=>{ setQ('');setCat('');setType('');setRecip('');setStartDate(null);setEndDate(null); };

  const exportXLSX = () => {
    if(!filtered.length){ toast.warning('داده‌ای برای خروجی وجود ندارد'); return; }
    const rows:any[]=[];
    filtered.forEach(e=>e.items.forEach(it=>rows.push({
      'شماره سند':e.docNumber,
      'تاریخ':e.timestamp?new Date(e.timestamp).toLocaleDateString('fa-IR'):e.date,
      'تحویل‌گیرنده':e.recipientName, 'واحد سازمانی':e.orgUnit, 'تحویل‌دهنده':e.delivererName,
      'کد کالا':it.productCode||'—', 'شرح کالا':it.productDescription, 'دسته‌بندی':it.category||'—',
      'تعداد':it.quantity, 'واحد':it.unit, 'مشخصات فنی':it.technicalSpecs||'—',
      'نوع خروج':it.isLoan?'امانی':'قطعی', 'نوع سند':e.type==='EXIT'?'خروج کالا':'تجهیزات ایمنی', 'توضیحات':e.notes||'—',
    })));
    const summary=[
      ['🏭 گزارش انبار · P21 ULTRA',''],
      ['تاریخ گزارش',new Date().toLocaleDateString('fa-IR')],
      ['تعداد اسناد',filtered.length],
      ['مجموع اقلام',analytics.total],
      [''],['برترین دریافت‌کنندگان','تعداد اقلام'],
      ...analytics.persons.map(([n,c])=>[n,c]),
      [''],['پرمصرف‌ترین کالاها','مقدار'],
      ...analytics.products.slice(0,5).map(([n,c])=>[n,c]),
    ];
    const wb=XLSX.utils.book_new();
    const ws1=XLSX.utils.json_to_sheet(rows);
    ws1['!cols']=[{wch:14},{wch:14},{wch:18},{wch:16},{wch:16},{wch:12},{wch:35},{wch:14},{wch:8},{wch:8},{wch:22},{wch:10},{wch:14},{wch:25}];
    const ws2=XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb,ws1,'📋 تراکنش‌ها');
    XLSX.utils.book_append_sheet(wb,ws2,'📊 خلاصه تحلیلی');
    XLSX.writeFile(wb,`گزارش-انبار-${new Date().toLocaleDateString('fa-IR').replace(/\//g,'-')}.xlsx`);
  };

  const COLORS=['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316'];
  const IS: React.CSSProperties = {width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'10px 14px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontSize:'12px',fontWeight:700,outline:'none',transition:'all .2s'};
  const fo = (e:any)=>{e.currentTarget.style.borderColor='rgba(99,102,241,.5)';e.currentTarget.style.background='rgba(99,102,241,.06)';};
  const bl = (e:any)=>{e.currentTarget.style.borderColor='rgba(255,255,255,.1)';e.currentTarget.style.background='rgba(255,255,255,.04)';};

  return (
    <div style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif',animation:'rvE .4s ease'}}>
      <style>{`
        @keyframes rvE{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .rv-row:hover{background:rgba(99,102,241,.07)!important;}
        .rv-row{cursor:pointer;transition:background .15s;}
        .rv-tab{padding:9px 18px;border-radius:12px;font-family:Vazirmatn,sans-serif;font-weight:900;font-size:11px;cursor:pointer;transition:all .2s;border:1px solid transparent;display:flex;align-items:center;gap:6px;}
        .rv-tab.on{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(6,182,212,.1));border-color:rgba(99,102,241,.35);color:#fff;}
        .rv-tab:not(.on){color:rgba(255,255,255,.35);}
        .rv-tab:not(.on):hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);}
        .rmdp-input{background:rgba(255,255,255,.04)!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:12px!important;padding:10px 14px!important;color:#fff!important;font-family:Vazirmatn,sans-serif!important;font-size:12px!important;font-weight:700!important;outline:none!important;width:100%!important;box-sizing:border-box!important;}
      `}</style>

      {/* Page header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(16,185,129,.1),rgba(6,182,212,.05))',border:'1px solid rgba(16,185,129,.22)',borderRadius:28,padding:'22px 28px',marginBottom:22,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#10b981,#06b6d4,transparent)'}} />
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#10b981',boxShadow:'0 0 20px rgba(16,185,129,.2)'}}><BarChart2 size={26}/></div>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>مرکز گزارش‌گیری و تحلیل</h2>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',margin:'4px 0 0'}}>{filtered.length} سند · {analytics.total} قلم کالا</p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className={`rv-tab${view==='table'?' on':''}`} onClick={()=>setView('table')}><FileText size={13}/>جدول</button>
          <button className={`rv-tab${view==='analytics'?' on':''}`} onClick={()=>setView('analytics')}><TrendingUp size={13}/>تحلیل</button>
          <button onClick={clear} style={{padding:'9px 14px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.4)',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:5}}><RefreshCw size={12}/>پاکسازی</button>
          <button onClick={exportXLSX} style={{padding:'9px 18px',borderRadius:12,background:'linear-gradient(135deg,#10b981,#059669)',border:'1px solid rgba(255,255,255,.15)',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'11px',cursor:'pointer',boxShadow:'0 4px 16px rgba(16,185,129,.3)',display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.filter='brightness(1.15)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.filter=''}
          ><Download size={14}/>خروجی Excel</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
        <Stat icon={<FileText size={16}/>} label="اسناد" value={filtered.length} color="#6366f1"/>
        <Stat icon={<Package size={16}/>} label="کل اقلام" value={analytics.total} color="#06b6d4"/>
        <Stat icon={<Users size={16}/>} label="دریافت‌کنندگان" value={analytics.persons.length} color="#10b981"/>
        <Stat icon={<Tag size={16}/>} label="دسته‌بندی‌ها" value={analytics.cats.length} color="#f59e0b"/>
      </div>

      {/* Filters */}
      <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:18,marginBottom:18}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:10}}>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>جستجو</label>
            <div style={{position:'relative'}}>
              <Search size={13} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'rgba(99,102,241,.6)',pointerEvents:'none'}} />
              <input style={{...IS,paddingRight:36}} value={q} onChange={e=>setQ(e.target.value)} placeholder="نام، سند، کالا..." onFocus={fo} onBlur={bl} />
            </div>
          </div>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>تحویل‌گیرنده</label>
            <select style={{...IS,background:'rgba(10,12,24,.9)'}} value={recip} onChange={e=>setRecip(e.target.value)} onFocus={fo} onBlur={bl}>
              <option value="">همه پرسنل</option>
              {recipients.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>دسته‌بندی</label>
            <select style={{...IS,background:'rgba(10,12,24,.9)'}} value={cat} onChange={e=>setCat(e.target.value)} onFocus={fo} onBlur={bl}>
              <option value="">همه دسته‌ها</option>
              {categories.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>نوع سند</label>
            <select style={{...IS,background:'rgba(10,12,24,.9)'}} value={type} onChange={e=>setType(e.target.value)} onFocus={fo} onBlur={bl}>
              <option value="">همه</option>
              <option value="EXIT">خروج کالا</option>
              <option value="PPE">تجهیزات ایمنی</option>
            </select>
          </div>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>از تاریخ</label>
            <DatePicker value={startDate} onChange={(d:DateObject)=>setStartDate(d?d.toDate():null)} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" portal inputClass="rmdp-input" containerStyle={{width:'100%'}} />
          </div>
          <div>
            <label style={{display:'block',fontSize:'9px',fontWeight:900,color:'rgba(255,255,255,.25)',letterSpacing:'.22em',textTransform:'uppercase',marginBottom:5}}>تا تاریخ</label>
            <DatePicker value={endDate} onChange={(d:DateObject)=>setEndDate(d?d.toDate():null)} calendar={persian} locale={persian_fa} calendarPosition="bottom-right" portal inputClass="rmdp-input" containerStyle={{width:'100%'}} />
          </div>
        </div>
      </div>

      {/* Analytics view */}
      {view==='analytics' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18,marginBottom:20}}>
          {/* Persons */}
          <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:22,padding:22}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{width:32,height:32,borderRadius:10,background:'rgba(245,158,11,.12)',border:'1px solid rgba(245,158,11,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Users size={14} color="#f59e0b"/></div>
              <span style={{fontSize:'10px',fontWeight:900,color:'rgba(255,255,255,.4)',letterSpacing:'.2em',textTransform:'uppercase'}}>برترین دریافت‌کنندگان</span>
            </div>
            {analytics.persons.map(([name,count],i)=>(
              <div key={name} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <div style={{display:'flex',alignItems:'center',gap:7}}>
                    <span style={{fontSize:'9px',fontWeight:900,color:COLORS[i],width:18}}>#{i+1}</span>
                    <span style={{fontSize:'12px',fontWeight:700,color:'#fff'}}>{name}</span>
                  </div>
                  <span style={{fontSize:'11px',fontWeight:900,color:COLORS[i]}}>{count}</span>
                </div>
                <Bar value={count} max={analytics.persons[0]?.[1]||1} color={COLORS[i]}/>
              </div>
            ))}
            {!analytics.persons.length && <p style={{textAlign:'center',opacity:.15,fontSize:'10px',fontWeight:900,letterSpacing:'.3em',padding:'20px 0'}}>داده موجود نیست</p>}
          </div>
          {/* Products */}
          <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:22,padding:22}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{width:32,height:32,borderRadius:10,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Package size={14} color="#6366f1"/></div>
              <span style={{fontSize:'10px',fontWeight:900,color:'rgba(255,255,255,.4)',letterSpacing:'.2em',textTransform:'uppercase'}}>پرمصرف‌ترین کالاها</span>
            </div>
            {analytics.products.map(([name,count],i)=>(
              <div key={name} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:'11px',fontWeight:700,color:'rgba(255,255,255,.75)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',paddingLeft:8}}>{name}</span>
                  <span style={{fontSize:'11px',fontWeight:900,color:COLORS[i],flexShrink:0}}>{count}</span>
                </div>
                <Bar value={count} max={analytics.products[0]?.[1]||1} color={COLORS[i]}/>
              </div>
            ))}
            {!analytics.products.length && <p style={{textAlign:'center',opacity:.15,fontSize:'10px',fontWeight:900,letterSpacing:'.3em',padding:'20px 0'}}>داده موجود نیست</p>}
          </div>
          {/* Categories */}
          {analytics.cats.length>0 && (
            <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:22,padding:22}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <div style={{width:32,height:32,borderRadius:10,background:'rgba(6,182,212,.12)',border:'1px solid rgba(6,182,212,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Tag size={14} color="#06b6d4"/></div>
                <span style={{fontSize:'10px',fontWeight:900,color:'rgba(255,255,255,.4)',letterSpacing:'.2em',textTransform:'uppercase'}}>دسته‌بندی‌ها</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                {analytics.cats.map(([c,n],i)=>(
                  <div key={c} style={{background:`${COLORS[i]}10`,border:`1px solid ${COLORS[i]}28`,borderRadius:14,padding:'12px 16px',flex:'1 1 120px',minWidth:110}}>
                    <div style={{fontSize:'11px',fontWeight:900,color:COLORS[i],marginBottom:6}}>{c}</div>
                    <div style={{fontSize:'24px',fontWeight:900,color:'#fff'}}>{n}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{background:'rgba(5,8,18,.88)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.35)'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',textAlign:'right'}}>
            <thead>
              <tr style={{background:'rgba(99,102,241,.06)'}}>
                {['شماره سند','تاریخ','تحویل‌گیرنده','واحد','کد کالا','اقلام','دسته','نوع',''].map((h,i)=>(
                  <th key={i} style={{padding:'13px 16px',fontSize:'9px',fontWeight:900,color:'rgba(99,102,241,.85)',textTransform:'uppercase',letterSpacing:'.2em',borderBottom:'1px solid rgba(255,255,255,.06)',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.id} className="rv-row" style={{borderBottom:'1px solid rgba(255,255,255,.04)'}} onClick={()=>onRowClick(e)}>
                  <td style={{padding:'12px 16px'}}><span style={{fontFamily:'monospace',fontSize:'11px',fontWeight:700,color:'#a5b4fc',background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:7,padding:'2px 8px'}}>#{e.docNumber}</span></td>
                  <td style={{padding:'12px 16px',fontSize:'11px',color:'rgba(255,255,255,.35)',whiteSpace:'nowrap'}}>{e.timestamp?new Date(e.timestamp).toLocaleDateString('fa-IR'):e.date}</td>
                  <td style={{padding:'12px 16px',fontSize:'13px',fontWeight:700,color:'#fff'}}>{e.recipientName}</td>
                  <td style={{padding:'12px 16px',fontSize:'10px',color:'rgba(255,255,255,.35)'}}>{e.orgUnit||'—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                      {e.items.slice(0,2).map((it,i)=>(
                        <span key={i} style={{background:(!it.productCode||it.productCode==='بدون کد'||it.productCode==='NEW')?'rgba(245,158,11,.1)':'rgba(255,255,255,.04)',border:(!it.productCode||it.productCode==='بدون کد'||it.productCode==='NEW')?'1px solid rgba(245,158,11,.3)':'1px solid rgba(255,255,255,.07)',color:(!it.productCode||it.productCode==='بدون کد'||it.productCode==='NEW')?'#fbbf24':'rgba(255,255,255,.45)',padding:'2px 7px',borderRadius:7,fontSize:'9px',fontFamily:'monospace',fontWeight:700}}>{it.productCode||'N/A'}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{padding:'12px 16px',maxWidth:200}}>
                    <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                      {e.items.slice(0,2).map((it,i)=>(
                        <span key={i} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',color:'rgba(255,255,255,.65)',padding:'2px 7px',borderRadius:7,fontSize:'10px',fontWeight:700,whiteSpace:'nowrap'}}>{it.productDescription} <span style={{color:'#67e8f9'}}>({it.quantity})</span></span>
                      ))}
                      {e.items.length>2 && <span style={{background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.25)',color:'#c4b5fd',padding:'2px 7px',borderRadius:7,fontSize:'9px',fontWeight:900}}>+{e.items.length-2}</span>}
                    </div>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    {Array.from(new Set(e.items.map(it=>it.category).filter(Boolean))).slice(0,1).map((c,i)=>(
                      <span key={i} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',color:'#c4b5fd',padding:'3px 10px',borderRadius:100,fontSize:'9px',fontWeight:900}}>{c}</span>
                    ))}
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{background:e.type==='EXIT'?'rgba(6,182,212,.1)':'rgba(16,185,129,.1)',border:e.type==='EXIT'?'1px solid rgba(6,182,212,.3)':'1px solid rgba(16,185,129,.3)',color:e.type==='EXIT'?'#67e8f9':'#6ee7b7',padding:'3px 10px',borderRadius:100,fontSize:'9px',fontWeight:900,whiteSpace:'nowrap'}}>{e.type==='EXIT'?'📦 خروج':'🦺 ایمنی'}</span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <button onClick={ev=>{ev.stopPropagation();onRowClick(e);}} style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:'5px 10px',color:'#818cf8',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontSize:'10px',fontWeight:900,fontFamily:'Vazirmatn,sans-serif',transition:'all .2s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,.25)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,.1)'}
                    ><Eye size={11}/>مشاهده</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={9} style={{padding:'60px',textAlign:'center',opacity:.15}}>
                  <Search size={36} style={{margin:'0 auto 12px',display:'block'}}/>
                  <p style={{fontSize:'11px',fontWeight:900,letterSpacing:'.4em',textTransform:'uppercase'}}>سندی با این فیلتر یافت نشد</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length>0 && (
          <div style={{padding:'12px 18px',borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',fontWeight:700}}>{filtered.length} سند از {exits.length} سند کل</span>
            <button onClick={exportXLSX} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:10,background:'linear-gradient(135deg,#10b981,#059669)',border:'none',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'10px',cursor:'pointer',boxShadow:'0 3px 10px rgba(16,185,129,.25)'}}>
              <Download size={12}/>دانلود Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
