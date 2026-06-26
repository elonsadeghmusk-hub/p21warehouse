/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Edit3, Trash2, Eye, FileText } from 'lucide-react';
import { ExitRecord } from '../types';

interface GlobalLogViewProps {
  exits: ExitRecord[];
  onRowClick: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
  onDelete: (id: string, type: string) => void;
  isAdmin: boolean;
}

export const GlobalLogView: React.FC<GlobalLogViewProps> = ({ exits, onRowClick, onEdit, onDelete, isAdmin }) => {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => exits.filter(r => {
    const query = q.toLowerCase();
    return r.docNumber.toLowerCase().includes(query)
      || r.recipientName.toLowerCase().includes(query)
      || r.items.some(it => it.productDescription.toLowerCase().includes(query) || it.quantity.toString().includes(query));
  }).sort((a,b) => b.timestamp - a.timestamp), [exits, q]);

  return (
    <div style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif',animation:'glEnter .4s ease'}}>
      <style>{`
        @keyframes glEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .gl-row{transition:background .15s;cursor:pointer;}
        .gl-row:hover{background:rgba(99,102,241,.07)!important;}
        .gl-row:hover .gl-actions{opacity:1!important;}
        .gl-actions{opacity:0;transition:opacity .2s;}
      `}</style>

      {/* Header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(6,182,212,.05))',border:'1px solid rgba(99,102,241,.22)',borderRadius:28,padding:'24px 28px',marginBottom:24,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)'}} />
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',boxShadow:'0 0 20px rgba(99,102,241,.2)'}}>
            <BookOpen size={26}/>
          </div>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>دفتر کل دیجیتال</h2>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',margin:'4px 0 0'}}>{filtered.length} رکورد · GLOBAL LEDGER</p>
          </div>
        </div>
        {/* Search */}
        <div style={{position:'relative',width:260}}>
          <Search size={14} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'rgba(99,102,241,.7)',pointerEvents:'none'}} />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جستجو در کل دفتر..."
            style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.05)',border:'1px solid rgba(99,102,241,.25)',borderRadius:12,padding:'10px 42px 10px 14px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontSize:'12px',fontWeight:700,outline:'none',transition:'all .2s'}}
            onFocus={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,.55)';e.currentTarget.style.background='rgba(99,102,241,.07)';}}
            onBlur={e=>{e.currentTarget.style.borderColor='rgba(99,102,241,.25)';e.currentTarget.style.background='rgba(255,255,255,.05)';}}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{background:'rgba(5,8,18,.85)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.4)'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',textAlign:'right'}}>
            <thead>
              <tr style={{background:'rgba(99,102,241,.07)'}}>
                {['شماره سند','تحویل‌گیرنده','تحویل‌دهنده','کالاها','تاریخ','نوع','عملیات'].map(h=>(
                  <th key={h} style={{padding:'14px 18px',fontSize:'9px',fontWeight:900,color:'rgba(99,102,241,.85)',textTransform:'uppercase',letterSpacing:'.22em',borderBottom:'1px solid rgba(255,255,255,.06)',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(rec => (
                <tr key={rec.id} className="gl-row" style={{borderBottom:'1px solid rgba(255,255,255,.04)'}} onClick={()=>onRowClick(rec)}>
                  <td style={{padding:'13px 18px'}}>
                    <span style={{fontFamily:'monospace',fontSize:'12px',fontWeight:700,color:'#a5b4fc',background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:8,padding:'3px 10px'}}>#{rec.docNumber}</span>
                  </td>
                  <td style={{padding:'13px 18px',fontSize:'13px',fontWeight:700,color:'#fff'}}>{rec.recipientName}</td>
                  <td style={{padding:'13px 18px',fontSize:'11px',color:'rgba(255,255,255,.45)'}}>{rec.delivererName}</td>
                  <td style={{padding:'13px 18px'}}>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {rec.items.slice(0,2).map((it,i)=>(
                        <span key={i} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.7)',padding:'3px 8px',borderRadius:8,fontSize:'10px',fontWeight:700}}>{it.productDescription} <span style={{color:'#67e8f9'}}>({it.quantity})</span></span>
                      ))}
                      {rec.items.length>2 && <span style={{background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.25)',color:'#c4b5fd',padding:'3px 8px',borderRadius:8,fontSize:'9px',fontWeight:900}}>+{rec.items.length-2}</span>}
                    </div>
                  </td>
                  <td style={{padding:'13px 18px',fontSize:'11px',color:'rgba(255,255,255,.35)',whiteSpace:'nowrap'}}>
                    {rec.timestamp ? new Date(rec.timestamp).toLocaleDateString('fa-IR') : rec.date}
                  </td>
                  <td style={{padding:'13px 18px'}}>
                    <span style={{background:rec.type==='EXIT'?'rgba(6,182,212,.1)':'rgba(16,185,129,.1)',border:rec.type==='EXIT'?'1px solid rgba(6,182,212,.3)':'1px solid rgba(16,185,129,.3)',color:rec.type==='EXIT'?'#67e8f9':'#6ee7b7',padding:'4px 12px',borderRadius:100,fontSize:'9px',fontWeight:900,whiteSpace:'nowrap'}}>
                      {rec.type==='EXIT'?'📦 خروج':'🦺 ایمنی'}
                    </span>
                  </td>
                  <td style={{padding:'13px 18px'}}>
                    <div className="gl-actions" style={{display:'flex',gap:6,alignItems:'center'}}>
                      <button onClick={e=>{e.stopPropagation();onRowClick(rec);}} title="مشاهده"
                        style={{width:30,height:30,borderRadius:8,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.25)',color:'#818cf8',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,.3)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,.1)'}
                      ><Eye size={13}/></button>
                      {isAdmin && <>
                        <button onClick={e=>{e.stopPropagation();onEdit(rec);}} title="ویرایش"
                          style={{width:30,height:30,borderRadius:8,background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.25)',color:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.25)'}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.08)'}
                        ><Edit3 size={13}/></button>
                        <button onClick={e=>{e.stopPropagation();onDelete(rec.id,rec.type);}} title="حذف"
                          style={{width:30,height:30,borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.25)'}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.08)'}
                        ><Trash2 size={13}/></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && (
                <tr><td colSpan={7} style={{padding:'60px',textAlign:'center',opacity:.2}}>
                  <FileText size={40} style={{margin:'0 auto 12px',display:'block'}}/>
                  <p style={{fontSize:'11px',fontWeight:900,letterSpacing:'.4em',textTransform:'uppercase'}}>رکوردی یافت نشد</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length>0 && (
          <div style={{padding:'12px 18px',borderTop:'1px solid rgba(255,255,255,.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'10px',color:'rgba(255,255,255,.25)',fontWeight:700}}>نمایش {filtered.length} از {exits.length} رکورد</span>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 8px #10b981'}} />
          </div>
        )}
      </div>
    </div>
  );
};
