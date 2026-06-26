/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { Box, Layers, Edit3, Trash2, Plus, Search, Package } from 'lucide-react';
import { Product } from '../types';

interface WarehouseManagerProps { products: Product[]; onAdd:(p:Product)=>void; onUpdate:(p:Product)=>void; onDelete:(code:string)=>void; isAdmin:boolean; }

const SI: React.CSSProperties = { width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.1)',borderRadius:12,padding:'11px 14px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontSize:'12px',fontWeight:700,outline:'none',transition:'all .2s' };

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({ products, onAdd, onUpdate, onDelete, isAdmin }) => {
  const [code,setCode]   = useState('');
  const [desc,setDesc]   = useState('');
  const [unit,setUnit]   = useState('عدد');
  const [specs,setSpecs] = useState('');
  const [cat,setCat]     = useState('');
  const [editing,setEditing] = useState<Product|null>(null);
  const [isDup,setIsDup] = useState(false);
  const [search,setSearch] = useState('');

  const handleCode = (v:string) => { setCode(v); setIsDup(products.some(p=>p.code===v&&(!editing||editing.code!==v))); };
  const reset = () => { setCode('');setDesc('');setSpecs('');setCat('');setUnit('عدد');setEditing(null);setIsDup(false); };
  const handleSave = () => {
    if(!code||!desc||isDup) return;
    const p: Product = {code,description:desc,unit,technicalSpecs:specs,category:cat};
    if(editing) { onUpdate(p); } else { onAdd(p); }
    reset();
  };

  const filtered = useMemo(() => products.filter(p=>
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    (p.category||'').toLowerCase().includes(search.toLowerCase())
  ), [products, search]);

  const cats = useMemo(() => Array.from(new Set(products.map(p=>p.category).filter(Boolean))), [products]);

  const focus = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => {
    e.currentTarget.style.borderColor='rgba(99,102,241,.5)';
    e.currentTarget.style.background='rgba(99,102,241,.06)';
    e.currentTarget.style.boxShadow='0 0 16px rgba(99,102,241,.1)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement>) => {
    e.currentTarget.style.borderColor='rgba(255,255,255,.1)';
    e.currentTarget.style.background='rgba(255,255,255,.04)';
    e.currentTarget.style.boxShadow='none';
  };

  return (
    <div style={{direction:'rtl',fontFamily:'Vazirmatn,sans-serif',animation:'wmEnter .4s ease'}}>
      <style>{`
        @keyframes wmEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .wm-card:hover{background:rgba(99,102,241,.06)!important;border-color:rgba(99,102,241,.25)!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3)!important;}
        .wm-card{transition:all .2s cubic-bezier(.4,0,.2,1);}
        .wm-dup{border-color:rgba(239,68,68,.4)!important;background:rgba(239,68,68,.06)!important;box-shadow:0 0 16px rgba(239,68,68,.12)!important;}
      `}</style>

      {/* Page header */}
      <div style={{position:'relative',background:'linear-gradient(135deg,rgba(99,102,241,.1),rgba(6,182,212,.05))',border:'1px solid rgba(99,102,241,.22)',borderRadius:28,padding:'24px 28px',marginBottom:24,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#6366f1,#06b6d4,transparent)'}} />
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{width:52,height:52,borderRadius:16,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',boxShadow:'0 0 20px rgba(99,102,241,.2)'}}>
            <Box size={26}/>
          </div>
          <div>
            <h2 style={{fontSize:'20px',fontWeight:900,color:'#fff',margin:0}}>مدیریت انبار کالا</h2>
            <p style={{fontSize:'10px',color:'rgba(255,255,255,.3)',fontWeight:700,letterSpacing:'.2em',textTransform:'uppercase',margin:'4px 0 0'}}>{products.length} کالا ثبت شده · WAREHOUSE MANAGER</p>
          </div>
        </div>
        {isDup && <div style={{background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',borderRadius:12,padding:'10px 16px',display:'flex',alignItems:'center',gap:8,color:'#f87171',fontSize:'11px',fontWeight:900}}>⚠️ کد کالا تکراری است!</div>}
      </div>

      {/* Form */}
      {isAdmin && (
        <div style={{background:'rgba(10,12,24,.75)',backdropFilter:'blur(20px)',border:`1px solid ${isDup?'rgba(239,68,68,.35)':'rgba(255,255,255,.08)'}`,borderRadius:24,padding:24,marginBottom:24,transition:'border-color .3s'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <div style={{width:32,height:32,borderRadius:10,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',display:'flex',alignItems:'center',justifyContent:'center'}}><Plus size={16} color="#818cf8"/></div>
            <span style={{fontSize:'12px',fontWeight:900,color:'rgba(255,255,255,.5)',letterSpacing:'.15em',textTransform:'uppercase'}}>{editing?'ویرایش کالا':'افزودن کالا جدید'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:16}}>
            {[
              {v:code,     sv:(v:string)=>handleCode(v), ph:'کد کالا*',         extra: isDup?{className:'wm-dup'}:{}},
              {v:desc,     sv:setDesc,                   ph:'شرح کالا*'},
              {v:cat,      sv:setCat,                    ph:'دسته‌بندی'},
              {v:specs,    sv:setSpecs,                  ph:'مشخصات فنی'},
              {v:unit,     sv:setUnit,                   ph:'واحد'},
            ].map(({v,sv,ph,extra={}}:any,i)=>(
              <input key={i} value={v} onChange={e=>sv(e.target.value)} placeholder={ph}
                style={{...SI,...(isDup&&ph.includes('کد')?{borderColor:'rgba(239,68,68,.5)',background:'rgba(239,68,68,.05)',boxShadow:'0 0 12px rgba(239,68,68,.1)'}:{})}}
                onFocus={focus} onBlur={blur} />
            ))}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={handleSave} disabled={isDup||!code||!desc}
              style={{flex:1,background:'linear-gradient(135deg,#6366f1,#4f46e5)',border:'1px solid rgba(255,255,255,.15)',borderRadius:12,padding:'12px 20px',color:'#fff',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'12px',letterSpacing:'.1em',cursor:isDup||!code||!desc?'not-allowed':'pointer',opacity:isDup||!code||!desc?.5:1,transition:'all .2s',boxShadow:'0 4px 16px rgba(99,102,241,.3)'}}
              onMouseEnter={e=>{if(!isDup&&code&&desc)(e.currentTarget as HTMLElement).style.filter='brightness(1.15)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.filter='';}}
            >{editing?'بروزرسانی کالا':'➕ افزودن به انبار'}</button>
            {editing && <button onClick={reset} style={{padding:'12px 20px',borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'11px',cursor:'pointer'}}>انصراف</button>}
          </div>
        </div>
      )}

      {/* Search + stats */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <Search size={14} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'rgba(99,102,241,.6)',pointerEvents:'none'}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="جستجو در انبار..."
            style={{...SI,paddingRight:42}} onFocus={focus} onBlur={blur} />
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setSearch(c===search?'':c!)}
              style={{padding:'8px 14px',borderRadius:10,background:search===c?'rgba(99,102,241,.2)':'rgba(255,255,255,.04)',border:`1px solid ${search===c?'rgba(99,102,241,.4)':'rgba(255,255,255,.08)'}`,color:search===c?'#a5b4fc':'rgba(255,255,255,.35)',fontFamily:'Vazirmatn,sans-serif',fontWeight:900,fontSize:'10px',cursor:'pointer',transition:'all .2s'}}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
        {filtered.map(p=>(
          <div key={p.code} className="wm-card" style={{background:'rgba(10,12,24,.6)',backdropFilter:'blur(10px)',border:'1px solid rgba(255,255,255,.07)',borderRadius:18,padding:'18px 16px',position:'relative',overflow:'hidden',boxShadow:'0 4px 16px rgba(0,0,0,.25)'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(99,102,241,.4),transparent)'}} />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:12,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Layers size={18} color="#818cf8"/></div>
              {isAdmin && (
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>{setEditing(p);setCode(p.code);setDesc(p.description);setUnit(p.unit);setSpecs(p.technicalSpecs||'');setCat(p.category||'');setIsDup(false);}}
                    style={{width:28,height:28,borderRadius:8,background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',color:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(245,158,11,.08)'}
                  ><Edit3 size={12}/></button>
                  <button onClick={()=>onDelete(p.code)}
                    style={{width:28,height:28,borderRadius:8,background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.25)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,.08)'}
                  ><Trash2 size={12}/></button>
                </div>
              )}
            </div>
            <h4 style={{fontSize:'13px',fontWeight:900,color:'#fff',marginBottom:6,lineHeight:1.3}}>{p.description}</h4>
            <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:8}}>
              <span style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.4)',padding:'2px 8px',borderRadius:8,fontSize:'9px',fontFamily:'monospace',fontWeight:700}}>{p.code}</span>
              <span style={{background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',color:'#c4b5fd',padding:'2px 8px',borderRadius:8,fontSize:'9px',fontWeight:900}}>{p.unit}</span>
              {p.category && <span style={{background:'rgba(6,182,212,.1)',border:'1px solid rgba(6,182,212,.2)',color:'#67e8f9',padding:'2px 8px',borderRadius:8,fontSize:'9px',fontWeight:900}}>{p.category}</span>}
            </div>
            {p.technicalSpecs && <p style={{fontSize:'10px',color:'rgba(255,255,255,.25)',fontWeight:600,marginTop:8,lineHeight:1.4}}>{p.technicalSpecs}</p>}
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:'1/-1',padding:'60px',textAlign:'center',opacity:.2}}>
            <Package size={40} style={{margin:'0 auto 12px',display:'block'}}/>
            <p style={{fontSize:'11px',fontWeight:900,letterSpacing:'.4em',textTransform:'uppercase'}}>کالایی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
};
