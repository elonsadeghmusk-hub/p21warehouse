/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { RotateCcw, CheckCircle, AlertTriangle, Package, Clock, User } from 'lucide-react';
import { ExitRecord } from '../types';

interface LoanManagerProps { exits:ExitRecord[]; onRecordClick:(r:ExitRecord)=>void; onReturn:(id:string,idx:number,cond:string,rating:number)=>void; }

export const LoanManager: React.FC<LoanManagerProps> = ({ exits, onRecordClick, onReturn }) => {
  const loans = useMemo(()=>
    exits.flatMap(e=>
      e.items.map((it,idx)=>({...it,recordId:e.id,recipientName:e.recipientName,date:e.date,timestamp:e.timestamp,itemIdx:idx,docNumber:e.docNumber,record:e}))
    ).filter(it=>it.isLoan&&!it.isReturned)
    .sort((a,b)=>b.timestamp-a.timestamp)
  ,[exits]);

  const daysSince = (timestamp:number) => {
    const diff = Date.now()-timestamp;
    return Math.floor(diff/(1000*60*60*24));
  };

  return (
    <div style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif',animation:'lmEnter .4s ease'}}>
      <style>{`
        @keyframes lmEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .lm-card:hover{border-color:rgba(245,158,11,.35)!important;box-shadow:0 12px 32px rgba(0,0,0,.4)!important;transform:translateY(-3px);}
        .lm-card{transition:all .25s cubic-bezier(.4,0,.2,1);}
        @keyframes lmWarning{0%,100%{box-shadow:0 0 0 rgba(245,158,11,0)}50%{box-shadow:0 0 20px rgba(245,158,11,.2)}}
      `}</style>

      {/* Header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(245,158,11,.1),rgba(251,146,60,.05))',border:'1px solid rgba(245,158,11,.25)',borderRadius:28,padding:'24px 28px',marginBottom:24,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#f59e0b,#fb923c,transparent)'}} />
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(245,158,11,.15)',border:'1px solid rgba(245,158,11,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fbbf24',boxShadow:'0 0 20px rgba(245,158,11,.2)'}}>
            <RotateCcw size={26}/>
          </div>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>مدیریت امانات</h2>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',margin:'4px 0 0'}}>{loans.length} کالای امانی در جریان · LOAN MANAGER</p>
          </div>
        </div>
        {loans.length>0 && (
          <div style={{background:'rgba(245,158,11,.1)',border:'1px solid rgba(245,158,11,.25)',borderRadius:12,padding:'10px 18px',display:'flex',alignItems:'center',gap:10}}>
            <AlertTriangle size={16} color="#fbbf24"/>
            <div>
              <div style={{fontSize:'22px',fontWeight:900,color:'#fbbf24',lineHeight:1}}>{loans.length}</div>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',fontWeight:900,letterSpacing:'.2em'}}>برگشت نشده</div>
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      {loans.length===0 ? (
        <div style={{background:'rgba(10,12,24,.7)',border:'1px solid rgba(255,255,255,.07)',borderRadius:24,padding:'80px 20px',textAlign:'center'}}>
          <CheckCircle size={50} style={{margin:'0 auto 16px',display:'block',color:'rgba(16,185,129,.4)'}}/>
          <h3 style={{fontSize:'18px',fontWeight:900,color:'rgba(255,255,255,.2)',marginBottom:8}}>همه کالاها برگشت داده شده‌اند</h3>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,.1)',fontWeight:700,letterSpacing:'.3em',textTransform:'uppercase'}}>NO ACTIVE LOANS</p>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {loans.map((loan,i)=>{
            const days = daysSince(loan.timestamp||0);
            const urgent = days>7;
            return (
              <div key={i} className="lm-card" style={{background:'rgba(10,12,24,.7)',backdropFilter:'blur(16px)',border:`1px solid ${urgent?'rgba(239,68,68,.2)':'rgba(245,158,11,.15)'}`,borderRadius:22,padding:'20px',position:'relative',overflow:'hidden',boxShadow:'0 6px 24px rgba(0,0,0,.3)',animation:urgent?'lmWarning 2s ease-in-out infinite':undefined}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${urgent?'#ef4444':'#f59e0b'},transparent)`}} />

                {/* Header row */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div onClick={()=>onRecordClick(loan.record)} style={{cursor:'pointer'}}>
                    <div style={{fontSize:'9px',fontWeight:900,color:'#fbbf24',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:4}}>#{loan.docNumber}</div>
                    <h4 style={{fontSize:'14px',fontWeight:900,color:'#fff',lineHeight:1.3,maxWidth:180}}>{loan.productDescription}</h4>
                  </div>
                  <div style={{background:urgent?'rgba(239,68,68,.12)':'rgba(245,158,11,.1)',border:`1px solid ${urgent?'rgba(239,68,68,.3)':'rgba(245,158,11,.25)'}`,borderRadius:10,padding:'6px 10px',textAlign:'center',flexShrink:0}}>
                    <Clock size={12} color={urgent?'#f87171':'#fbbf24'} style={{display:'block',margin:'0 auto 3px'}}/>
                    <div style={{fontSize:'14px',fontWeight:900,color:urgent?'#f87171':'#fbbf24',lineHeight:1}}>{days}</div>
                    <div style={{fontSize:'8px',color:'rgba(255,255,255,.3)',fontWeight:900}}>روز</div>
                  </div>
                </div>

                {/* Info */}
                <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.04)',borderRadius:10,padding:'6px 10px'}}>
                    <User size={11} color="rgba(255,255,255,.4)"/>
                    <span style={{fontSize:'11px',fontWeight:700,color:'rgba(255,255,255,.7)'}}>{loan.recipientName}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(99,102,241,.08)',borderRadius:10,padding:'6px 10px'}}>
                    <Package size={11} color="#818cf8"/>
                    <span style={{fontSize:'11px',fontWeight:700,color:'#a5b4fc'}}>{loan.quantity} {loan.unit}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <button onClick={()=>onReturn(loan.recordId,loan.itemIdx,'EXCELLENT',5)}
                    style={{padding:'10px 8px',borderRadius:12,background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.3)',color:'#6ee7b7',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'11px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(16,185,129,.25)';(e.currentTarget as HTMLElement).style.color='#fff';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(16,185,129,.1)';(e.currentTarget as HTMLElement).style.color='#6ee7b7';}}
                  ><CheckCircle size={13}/>بازگشت سالم</button>
                  <button onClick={()=>onReturn(loan.recordId,loan.itemIdx,'NEEDS_REPAIR',2)}
                    style={{padding:'10px 8px',borderRadius:12,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.25)',color:'#f87171',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'11px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.22)';(e.currentTarget as HTMLElement).style.color='#fff';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.08)';(e.currentTarget as HTMLElement).style.color='#f87171';}}
                  ><AlertTriangle size={13}/>بازگشت معیوب</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
