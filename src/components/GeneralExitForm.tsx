/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from './Toast';
import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, Plus, X, PenTool, Camera, Trophy, History, Edit3, Trash2, Check, ChevronDown, ChevronUp, FileText, Clock, User as UserIcon, Package } from 'lucide-react';
import { Product, Recipient, ExitRecord, User } from '../types';

interface GeneralExitFormProps {
  products: Product[];
  generalHistory: ExitRecord[];
  recipients: Recipient[];
  currentUser: User;
  onSave: (record: any) => void;
  onRecordClick: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
  onDelete: (id: string, type: string) => void;
  onSignOpen: () => void;
  onCamOpen: () => void;
  signature: string;
  photo: string | null;
}

export const GeneralExitForm: React.FC<GeneralExitFormProps> = ({ 
  products, generalHistory, recipients, currentUser, onSave, onRecordClick,
  onEdit, onDelete, onSignOpen, onCamOpen, signature, photo
}) => {
  const [basket, setBasket] = useState<any[]>([]);
  const [recipient, setRecipient] = useState('');
  const [recipientUnit, setRecipientUnit] = useState('');
  const [docNum, setDocNum] = useState(`EXIT-${Date.now().toString().slice(-4)}`);
  const [manualDate, setManualDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [tempCode, setTempCode] = useState('');
  const [tempQty, setTempQty] = useState(1);
  const [isLoan, setIsLoan] = useState(false);
  const [noCode, setNoCode] = useState(false);
  const [manualDescription, setManualDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRecipientDrop, setShowRecipientDrop] = useState(false);
  const [showProductDrop, setShowProductDrop] = useState(false);

  useEffect(() => {
    const p = recipients.find((r) => r.fullName === recipient);
    if (p) setRecipientUnit(p.orgUnit);
    else setRecipientUnit('');
  }, [recipient, recipients]);

  const top10 = useMemo(() => {
    const counts: Record<string, number> = {};
    generalHistory
      .filter((h) => h.recipientName === recipient)
      .forEach((h) => {
        h.items.forEach((it) => counts[it.productDescription] = (counts[it.productDescription] || 0) + it.quantity);
      });
    return Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 10);
  }, [generalHistory, recipient]);

  const personHistory = useMemo(() => generalHistory.filter(h => h.recipientName === recipient), [generalHistory, recipient]);

  return (
    <div className="animate-enter no-print" style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif'}}>
      <style>{`
        @keyframes gfEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .gf-card{background:rgba(10,12,24,0.7);backdropFilter:blur(20px);border:1px solid rgba(99,102,241,0.15);borderRadius:24px;padding:28px;marginBottom:20px;animation:gfEnter 0.4s ease;}
        .gf-input{width:100%;boxSizing:border-box;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);borderRadius:12px;padding:12px 16px;color:#fff;fontFamily:inherit;fontSize:13px;fontWeight:700;outline:none;transition:all 0.2s;}
        .gf-input:focus{borderColor:rgba(99,102,241,0.5);background:rgba(99,102,241,0.06);boxShadow:0 0 16px rgba(99,102,241,0.1);}
        .gf-label{display:block;fontSize:9px;fontWeight:900;color:rgba(255,255,255,0.3);letterSpacing:0.25em;textTransform:uppercase;marginBottom:6px;}
        .gf-btn-primary{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;border:1px solid rgba(255,255,255,0.15);borderRadius:12px;padding:12px 20px;fontFamily:inherit;fontWeight:900;fontSize:12px;letterSpacing:0.1em;cursor:pointer;transition:all 0.2s;display:flex;alignItems:center;gap:6px;}
        .gf-btn-primary:hover{filter:brightness(1.15);transform:translateY(-1px);}
        .gf-btn-danger{background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.25);borderRadius:10px;padding:8px;cursor:pointer;transition:all 0.2s;}
        .gf-btn-danger:hover{background:rgba(239,68,68,0.25);color:#fff;}
        .basket-row{display:flex;alignItems:center;justifyContent:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);borderRadius:12px;border:1px solid rgba(255,255,255,0.06);marginBottom:6px;}
      `}</style>
      {/* Section header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(6,182,212,0.05))',border:'1px solid rgba(99,102,241,0.2)',borderRadius:28,padding:'24px 28px',marginBottom:24,overflow:'hidden',display:'flex',alignItems:'center',gap:16}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)'}} />
        <div style={{width:48,height:48,borderRadius:16,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',flexShrink:0,boxShadow:'0 0 20px rgba(99,102,241,0.2)'}}>
          <PackagePlus size={24}/>
        </div>
        <div>
          <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>صدور حواله خروج کالا</h2>
          <p style={{fontSize:'10px',color:'rgba(255,255,255,0.3)',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',margin:'4px 0 0'}}>GENERAL EXIT FORM · P21</p>
        </div>
      </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8" style={{background:'rgba(10,12,24,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(99,102,241,0.12)',borderRadius:24,padding:28}}>
        <div style={{height:2,background:'linear-gradient(90deg,#6366f1,transparent)',marginBottom:24,borderRadius:1}} />
        <div style={{display:'none'}}> {/* hidden placeholder for correct JSX */}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1 relative">
            <label className="text-[10px] opacity-40 font-black uppercase">تحویل‌گیرنده</label>
            <div className="relative">
              <input 
                placeholder="جستجوی پرسنل..." 
                value={recipient} 
                onChange={e=>{setRecipient(e.target.value);setShowRecipientDrop(true);}} 
                onFocus={()=>setShowRecipientDrop(true)}
                onBlur={()=>setTimeout(()=>setShowRecipientDrop(false),200)}
                className="w-full input-glass p-3 font-black shadow-inner pl-10" 
              />
              {recipient && (<button onClick={() => setRecipient('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-red-500 transition-all"><X size={16} /></button>)}
              {/* Dropdown زیبا */}
              {showRecipientDrop && (
                <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,left:0,zIndex:999,background:'rgba(10,12,28,0.97)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:16,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.7)',backdropFilter:'blur(20px)',maxHeight:280,overflowY:'auto'}}>
                  <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:'9px',color:'rgba(255,255,255,0.3)',fontWeight:900,letterSpacing:'0.2em',textTransform:'uppercase'}}>انتخاب پرسنل</div>
                  {recipients.filter(r=>r.fullName.toLowerCase().includes(recipient.toLowerCase())).map((r,i)=>(
                    <div key={r.fullName} onMouseDown={()=>{setRecipient(r.fullName);setShowRecipientDrop(false);}}
                      style={{padding:'12px 16px',cursor:'pointer',transition:'all 0.15s',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:10,background: i%2===0?'rgba(99,102,241,0.02)':'transparent'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.12)')}
                      onMouseLeave={e=>(e.currentTarget.style.background= i%2===0?'rgba(99,102,241,0.02)':'transparent')}
                    >
                      <div style={{width:32,height:32,borderRadius:10,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13,fontWeight:900,color:'#a5b4fc'}}>{r.fullName.charAt(0)}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{r.fullName}</div>
                        {r.orgUnit&&<div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{r.orgUnit}</div>}
                      </div>
                    </div>
                  ))}
                  {recipients.filter(r=>r.fullName.toLowerCase().includes(recipient.toLowerCase())).length===0&&(
                    <div style={{padding:'20px',textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:11,fontWeight:700}}>نتیجه‌ای یافت نشد</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">واحد عملیاتی</label>
            <input value={recipientUnit} readOnly className="w-full input-glass p-3 font-black opacity-60 shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">شماره سند</label>
            <input value={docNum} onChange={e=>setDocNum(e.target.value)} className="w-full input-glass p-3 font-black shadow-inner" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] opacity-40 font-black uppercase">تاریخ خروج</label>
            <input value={manualDate} onChange={e=>{
              // تبدیل خودکار اعداد انگلیسی به فارسی
              const toFa = (s: string) => s.replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
              setManualDate(toFa(e.target.value));
            }} className="w-full input-glass p-3 font-black text-center shadow-inner" placeholder="۱۴۰۴/۰۱/۰۱" />
          </div>
          <div className="flex items-end gap-3">
            <button onClick={() => setIsLoan(!isLoan)} className={`flex-1 py-3 rounded-xl font-black text-[11px] border-2 transition-all shadow-lg uppercase tracking-widest ${isLoan ? 'neon-active-orange' : 'neon-active-emerald'}`}>
              {isLoan ? 'امانی (Loan)' : 'قطعی (Sale)'}
            </button>
          </div>
        </div>
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 shadow-inner">
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${noCode ? 'bg-orange-500 border-orange-500' : 'border-white/20 group-hover:border-orange-500/50'}`}>
                <input type="checkbox" checked={noCode} onChange={e => setNoCode(e.target.checked)} className="hidden" />
                {noCode && <Check size={14} className="text-white" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">بدون کد (ثبت دستی)</span>
            </label>
          </div>
          <div className="flex gap-2">
            {noCode ? (
              <input 
                placeholder="شرح کالای بدون کد..." 
                value={manualDescription} 
                onChange={e => setManualDescription(e.target.value)} 
                className="flex-1 input-glass p-3 font-black shadow-inner border-orange-500/30" 
              />
            ) : (
              <div style={{position:'relative',flex:1}}>
                <input 
                  placeholder="شرح کالا یا کد..." 
                  value={tempCode} 
                  onChange={e=>{setTempCode(e.target.value);setShowProductDrop(true);}} 
                  onFocus={()=>setShowProductDrop(true)}
                  onBlur={()=>setTimeout(()=>setShowProductDrop(false),200)}
                  className="w-full input-glass p-3 font-black shadow-inner" 
                />
                {showProductDrop && (
                  <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,left:0,zIndex:999,background:'rgba(10,12,28,0.97)',border:'1px solid rgba(6,182,212,0.3)',borderRadius:16,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.7)',backdropFilter:'blur(20px)',maxHeight:260,overflowY:'auto'}}>
                    <div style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:'9px',color:'rgba(255,255,255,0.3)',fontWeight:900,letterSpacing:'0.2em',textTransform:'uppercase'}}>انتخاب کالا</div>
                    {products.filter(p=>p.description.toLowerCase().includes(tempCode.toLowerCase())||p.code.toLowerCase().includes(tempCode.toLowerCase())).slice(0,20).map((p,i)=>(
                      <div key={p.code} onMouseDown={()=>{setTempCode(p.description);setShowProductDrop(false);}}
                        style={{padding:'10px 16px',cursor:'pointer',transition:'all 0.15s',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:10,background:i%2===0?'rgba(6,182,212,0.02)':'transparent'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(6,182,212,0.1)')}
                        onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'rgba(6,182,212,0.02)':'transparent')}
                      >
                        <div style={{background:'rgba(6,182,212,0.12)',border:'1px solid rgba(6,182,212,0.2)',borderRadius:8,padding:'2px 8px',fontSize:10,fontWeight:900,color:'#67e8f9',flexShrink:0}}>{p.code}</div>
                        <span style={{fontSize:12,color:'#fff',fontWeight:600}}>{p.description}</span>
                        {p.category&&<span style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginRight:'auto'}}>{p.category}</span>}
                      </div>
                    ))}
                    {products.filter(p=>p.description.toLowerCase().includes(tempCode.toLowerCase())||p.code.toLowerCase().includes(tempCode.toLowerCase())).length===0&&(
                      <div style={{padding:'20px',textAlign:'center',color:'rgba(255,255,255,0.2)',fontSize:11,fontWeight:700}}>کالایی یافت نشد</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <input type="number" step="0.5" placeholder="تعداد" value={tempQty} onChange={e=>setTempQty(parseFloat(e.target.value))} className="w-20 input-glass p-3 text-center font-black text-lg text-cyan-400 shadow-inner" />
            <button onClick={()=>{ 
              if (noCode) {
                if (!manualDescription.trim()) { toast.warning('لطفاً شرح کالا را وارد کنید'); return; }
                setBasket([{productCode: 'بدون کد', productDescription: manualDescription, category: 'تعریف نشده', quantity: tempQty, unit: 'عدد', isLoan, id: Date.now()}, ...basket]);
                setManualDescription('');
              } else {
                const p = products.find((x)=>x.description===tempCode || x.code===tempCode); 
                if(p){ 
                  setBasket([{productCode: p.code, productDescription:p.description, category: p.category, quantity:tempQty, unit:p.unit, isLoan, id:Date.now()}, ...basket]); 
                } else if (tempCode.trim()) {
                  setBasket([{productCode: 'NEW', productDescription: tempCode, category: 'تعریف نشده', quantity: tempQty, unit: 'عدد', isLoan, id: Date.now()}, ...basket]);
                }
                setTempCode(''); 
              }
              setTempQty(1); 
            }} className={`p-3 rounded-xl text-white shadow-xl transition-all active:scale-90 ${noCode ? 'bg-orange-600 hover:bg-orange-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
              <Plus size={24}/>
            </button>
          </div>
        </div>
        <div className="bg-black/50 rounded-2xl overflow-hidden min-h-[80px] text-[11px] font-black border border-white/5 shadow-inner">
          <table className="w-full text-right">
            <tbody>
              {basket.map((it) => (
                <tr key={it.id} className="border-b border-white/5 hover:bg-white/10 transition-all">
                  <td className="p-3">{it.productDescription}</td>
                  <td className="p-3 text-center text-cyan-400">{it.quantity} {it.unit}</td>
                  <td className="p-3 text-center">
                    <button onClick={()=>setBasket(basket.filter(x=>x.id!==it.id))} className="text-red-500 hover:scale-125 transition-all">
                      <X size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] opacity-40 font-black uppercase">توضیحات حواله</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="دلیل خروج، مرکز هزینه یا جزییات فنی..." className="w-full input-glass p-3 h-20 font-medium text-[11px] leading-relaxed shadow-inner" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={onSignOpen} className={`py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg ${signature ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}>
            <PenTool size={15}/> {signature ? 'امضاء ثبت شد' : 'ثبت امضای دیجیتال'}
          </button>
          <button onClick={onCamOpen} className={`py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg ${photo ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-white/20 text-white/40 hover:bg-white/5'}`}>
            <Camera size={15}/> {photo ? 'تصویر ثبت شد' : 'تصویربرداری ضمیمه'}
          </button>
        </div>
        <button onClick={()=>{ 
          if(!recipient || !basket.length) { toast.warning('تحویل‌گیرنده و حداقل یک کالا را وارد کنید'); return; } 
          onSave({ id: Date.now().toString(), docNumber: docNum, items: basket, recipientName: recipient, orgUnit: recipientUnit, delivererName: currentUser.fullName, date: manualDate, timestamp: Date.now(), type:'EXIT', signature, photo, notes }); 
          setBasket([]); 
          setNotes(''); 
          setNoCode(false);
          setManualDescription('');
          toast.success('سند با موفقیت ثبت و آرشیو شد'); 
        }} className="w-full bg-indigo-600 py-3.5 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95 uppercase tracking-widest border-t border-white/20 hover:bg-indigo-500">
          تایید و بایگانی نهایی حواله خروج
        </button>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="diamond-neon p-5 rounded-2xl bg-indigo-950/20 shadow-lg border-indigo-500/10">
          <h4 className="text-[10px] font-black text-cyan-400 mb-4 uppercase flex items-center gap-2 tracking-widest"><Trophy size={14}/> اقلام پرمصرف فرد</h4>
          <div className="flex flex-wrap gap-1.5">{top10.map(([n,c])=>(<div key={n} className="bg-white/5 px-2 py-1 rounded-lg text-[10px] font-black border border-white/5 hover:border-cyan-500/30 transition-all">{n} | <span className="text-cyan-400">{c}</span></div>))}</div>
        </div>

        {/* ── کادر سوابق جدید ── */}
        <div className="diamond-neon p-5 rounded-2xl shadow-lg border-indigo-500/10" dir="rtl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 tracking-widest">
              <History size={14}/> سوابق خروجی
            </h4>
            {personHistory.length > 0 && (
              <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-2 py-1 rounded-full border border-indigo-500/30">
                {personHistory.length} سند
              </span>
            )}
          </div>

          {personHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
              <FileText size={40}/>
              <span className="text-[10px] font-black uppercase tracking-widest">تراکنشی یافت نشد</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pl-1">
              {personHistory.map((h, idx) => {
                const isExpanded = expandedId === h.id;
                const totalItems = h.items.reduce((s: number, it: any) => s + it.quantity, 0);
                const isLoanDoc = h.items.some((it: any) => it.isLoan);
                return (
                  <div
                    key={h.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-md group
                      ${isExpanded
                        ? 'border-indigo-500/60 bg-indigo-950/60 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                        : 'border-white/8 bg-black/30 hover:border-indigo-500/30 hover:bg-indigo-950/30'
                      }`}
                  >
                    {/* ── هدر کارت ── */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : h.id)}
                    >
                      {/* شماره ردیف */}
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all
                        ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40'}`}>
                        {idx + 1}
                      </div>
                      {/* اطلاعات اصلی */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-indigo-300 font-mono text-[11px] font-black"># {h.docNumber}</span>
                          {isLoanDoc && (
                            <span className="bg-orange-500/20 text-orange-400 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-orange-500/30">امانی</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[9px] text-white/40 flex items-center gap-1">
                            <Clock size={9}/> {h.date}
                          </span>
                          <span className="text-[9px] text-cyan-400/60 flex items-center gap-1">
                            <Package size={9}/> {h.items.length} قلم
                          </span>
                        </div>
                      </div>
                      {/* دکمه‌های عملیات */}
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(h); }}
                            className="text-orange-400 p-1.5 hover:bg-orange-400/10 rounded-lg transition-all"
                          >
                            <Edit3 size={12}/>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(h.id, h.type); }}
                            className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={12}/>
                          </button>
                        </div>
                        <div className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={14}/>
                        </div>
                      </div>
                    </div>

                    {/* ── جزئیات باز شونده ── */}
                    {isExpanded && (
                      <div className="border-t border-white/8 mx-3 pt-3 pb-3 animate-enter">
                        {/* اقلام */}
                        <div className="space-y-2 mb-3">
                          {h.items.map((it: any, idx2: number) => (
                            <div
                              key={idx2}
                              className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                <span className="text-[11px] font-black text-white/80 truncate">{it.productDescription}</span>
                              </div>
                              <span className="text-cyan-400 font-black text-[11px] flex-shrink-0 mr-2">
                                {it.quantity} {it.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* اطلاعات تکمیلی */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white/3 rounded-xl p-2 border border-white/5">
                            <span className="text-[8px] text-white/30 font-black uppercase block mb-1">ثبت کننده</span>
                            <span className="text-[10px] font-black text-white/70 flex items-center gap-1">
                              <UserIcon size={10}/> {h.delivererName}
                            </span>
                          </div>
                          <div className="bg-white/3 rounded-xl p-2 border border-white/5">
                            <span className="text-[8px] text-white/30 font-black uppercase block mb-1">واحد</span>
                            <span className="text-[10px] font-black text-white/70">{h.orgUnit || '—'}</span>
                          </div>
                        </div>

                        {h.notes && (
                          <div className="bg-indigo-900/20 rounded-xl p-2 border border-indigo-500/10 mb-3">
                            <span className="text-[8px] text-indigo-400/60 font-black uppercase block mb-1">توضیحات</span>
                            <span className="text-[10px] text-white/60">{h.notes}</span>
                          </div>
                        )}

                        {/* دکمه مشاهده کامل */}
                        <button
                          onClick={() => { onRecordClick(h); }}
                          className="w-full py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/40 transition-all flex items-center justify-center gap-2"
                        >
                          <FileText size={12}/> مشاهده سند کامل
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
