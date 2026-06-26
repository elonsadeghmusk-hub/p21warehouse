/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { Users, Trash2, Edit3, Plus, Search, UserCheck, Shield } from 'lucide-react';
import { Recipient } from '../types';

interface PersonnelManagerProps { recipients:Recipient[]; onAdd:(r:Recipient)=>void; onUpdate:(r:Recipient)=>void; onDelete:(n:string)=>void; isAdmin:boolean; }

const SI: React.CSSProperties = {width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'11px 14px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontSize:'12px',fontWeight:700,outline:'none',transition:'all .2s'};
const focus = (e:any)=>{e.currentTarget.style.borderColor='rgba(99,102,241,.5)';e.currentTarget.style.background='rgba(99,102,241,.06)';e.currentTarget.style.boxShadow='0 0 16px rgba(99,102,241,.1)';};
const blur  = (e:any)=>{e.currentTarget.style.borderColor='rgba(255,255,255,.1)';e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.boxShadow='none';};

export const PersonnelManager: React.FC<PersonnelManagerProps> = ({ recipients, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [name,setName]   = useState('');
  const [unit,setUnit]   = useState('');
  const [isDup,setIsDup] = useState(false);
  const [editing,setEditing] = useState<Recipient|null>(null);
  const [search,setSearch]   = useState('');

  const handleName = (v:string) => { setName(v); setIsDup(recipients.some(r=>r.fullName===v&&(!editing||editing.fullName!==v))); };
  const reset = () => { setName('');setUnit('');setIsDup(false);setEditing(null); };
  const handleSave = () => {
    if(!name||isDup) return;
    if(editing) { onUpdate({...editing,fullName:name,orgUnit:unit}); }
    else { onAdd({fullName:name,orgUnit:unit,safetyScore:100}); }
    reset();
  };

  const filtered = useMemo(()=>recipients.filter(r=>
    r.fullName.toLowerCase().includes(search.toLowerCase())||
    (r.orgUnit||'').toLowerCase().includes(search.toLowerCase())
  ),[recipients,search]);

  const units = useMemo(()=>Array.from(new Set(recipients.map(r=>r.orgUnit).filter(Boolean))),[recipients]);

  return (
    <div style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif',animation:'pmEnter .4s ease'}}>
      <style>{`@keyframes pmEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .pm-card:hover{background:rgba(99,102,241,.07)!important;border-color:rgba(99,102,241,.3)!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)!important;} .pm-card{transition:all .2s;}`}</style>

      {/* Header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(6,182,212,.05))',border:'1px solid rgba(99,102,241,.22)',borderRadius:28,padding:'24px 28px',marginBottom:24,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)'}} />
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',boxShadow:'0 0 20px rgba(99,102,241,.2)'}}>
            <Users size={26}/>
          </div>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>مدیریت پرسنل</h2>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',margin:'4px 0 0'}}>{recipients.length} نفر ثبت شده · PERSONNEL MANAGER</p>
          </div>
        </div>
        {isDup && <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:12,padding:'10px 16px',color:'#f87171',fontSize:'11px',fontWeight:900}}>⚠️ این پرسنل قبلاً ثبت شده!</div>}
      </div>

      {/* Form */}
      {isAdmin && (
        <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,.08)',borderRadius:24,padding:24,marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{width:32,height:32,borderRadius:10,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={16} color="#818cf8"/></div>
            <span style={{fontSize:'12px',fontWeight:900,color:'rgba(255,255,255,.5)',letterSpacing:'.15em',textTransform:'uppercase'}}>{editing?'ویرایش پرسنل':'افزودن پرسنل جدید'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <input value={name} onChange={e=>handleName(e.target.value)} placeholder="نام و نام‌خانوادگی*"
              style={{...SI,...(isDup?{borderColor:'rgba(239,68,68,.5)',background:'rgba(239,68,68,.05)'}:{})}} onFocus={focus} onBlur={blur} />
            <input value={unit} onChange={e=>setUnit(e.target.value)} placeholder="واحد سازمانی / پیمانکار"
              style={SI} onFocus={focus} onBlur={blur} />
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={handleSave} disabled={isDup||!name}
              style={{flex:1,background:'linear-gradient(135deg,#6366f1,#4f46e5)',border:'1px solid rgba(255,255,255,.15)',borderRadius:12,padding:'12px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'12px',cursor:isDup||!name?'not-allowed':'pointer',opacity:isDup||!name?.5:1,boxShadow:'0 4px 16px rgba(99,102,241,.3)',transition:'all .2s'}}
            >{editing?'بروزرسانی':'➕ افزودن پرسنل'}</button>
            {editing && <button onClick={reset} style={{padding:'12px 20px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'11px',cursor:'pointer'}}>انصراف</button>}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={14} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'rgba(99,102,241,.6)',pointerEvents:'none'}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجوی پرسنل..."
            style={{...SI,paddingRight:42}} onFocus={focus} onBlur={blur} />
        </div>
        {units.map(u=>(
          <button key={u} onClick={()=>setSearch(u===search?'':u!)}
            style={{padding:'8px 14px',borderRadius:10,background:search===u?'rgba(99,102,241,.2)':'rgba(255,255,255,.04)',border:`1px solid ${search===u?'rgba(99,102,241,.4)':'rgba(255,255,255,.08)'}`,color:search===u?'#a5b4fc':'rgba(255,255,255,.35)',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'10px',cursor:'pointer',transition:'all .2s'}}>{u}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
        {filtered.map((r,i)=>(
          <div key={i} className="pm-card" style={{background:'rgba(10,12,24,.6)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:'20px 18px',position:'relative',overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,.25)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(99,102,241,.35),transparent)'}} />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div style={{width:42,height:42,borderRadius:14,background:'linear-gradient(135deg,rgba(99,102,241,.2),rgba(6,182,212,.1))',border:'1px solid rgba(99,102,241,.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:900,color:'#a5b4fc'}}>
                {r.fullName.charAt(0)}
              </div>
              {isAdmin && (
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>{setEditing(r);setName(r.fullName);setUnit(r.orgUnit||'');setIsDup(false);}}
                    style={{width:28,height:28,borderRadius:8,background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',color:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.08)'}
                  ><Edit3 size={12}/></button>
                  <button onClick={()=>onDelete(r.fullName)}
                    style={{width:28,height:28,borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.08)'}
                  ><Trash2 size={12}/></button>
                </div>
              )}
            </div>
            <h4 style={{fontSize:'14px',fontWeight:900,color:'#fff',marginBottom:6}}>{r.fullName}</h4>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {r.orgUnit && <span style={{background:'rgba(6,182,212,.1)',border:'1px solid rgba(6,182,212,.2)',color:'#67e8f9',padding:'3px 10px',borderRadius:100,fontSize:'9px',fontWeight:900}}>{r.orgUnit}</span>}
              <span style={{background:'rgba(16,185,129,.1)',border:'1px solid rgba(16,185,129,.2)',color:'#6ee7b7',padding:'3px 10px',borderRadius:100,fontSize:'9px',fontWeight:900}}>
                <Shield size={9} style={{display:'inline',marginLeft:3}}/>{r.safetyScore||100}% ایمنی
              </span>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:'1/-1',padding:'60px',textAlign:'center',opacity:.2}}>
            <UserCheck size={40} style={{margin:'0 auto 12px',display:'block'}}/>
            <p style={{fontSize:'11px',fontWeight:900,letterSpacing:'.4em',textTransform:'uppercase'}}>پرسنلی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
};
