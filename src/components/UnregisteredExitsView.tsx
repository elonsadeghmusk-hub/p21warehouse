/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from './Toast';
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search, Package, User, Calendar, Hash, ArrowRightLeft, Sparkles, Clock } from 'lucide-react';
import { ExitRecord, Product } from '../types';

interface UnregisteredExitsViewProps {
  exits: ExitRecord[];
  products: Product[];
  onAssignCode: (recordId: string, itemIndex: number, newCode: string) => void;
}

export const UnregisteredExitsView: React.FC<UnregisteredExitsViewProps> = ({ exits, products, onAssignCode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningCodes, setAssigningCodes] = useState<Record<string, string>>({});
  const [showProductDrop, setShowProductDrop] = useState<string|null>(null);

  const unregisteredItems = exits.flatMap(record =>
    record.items.map((item, index) => ({
      recordId: record.id, itemIndex: index,
      docNumber: record.docNumber, recipientName: record.recipientName,
      date: record.date, timestamp: record.timestamp, ...item
    }))
  ).filter(item => item.productCode === 'بدون کد' || item.productCode === 'NEW');

  const filteredItems = unregisteredItems.filter(item =>
    item.productDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.docNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCodeChange = (key: string, value: string) => {
    setAssigningCodes(prev => ({ ...prev, [key]: value }));
    setShowProductDrop(key);
  };

  const handleConfirm = (recordId: string, itemIndex: number, key: string) => {
    const newCode = assigningCodes[key];
    if (!newCode) { toast.warning('لطفاً کد کالا را وارد کنید'); return; }
    const product = products.find(p => p.code === newCode);
    if (!product) { toast.confirm('این کد در انبار یافت نشد. آیا مطمئن هستید؟', () => { onAssignCode(recordId, itemIndex, newCode); const n = { ...assigningCodes }; delete n[key]; setAssigningCodes(n); setShowProductDrop(null); }); return; }
    onAssignCode(recordId, itemIndex, newCode);
    const n = { ...assigningCodes };
    delete n[key];
    setAssigningCodes(n);
    setShowProductDrop(null);
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'Vazirmatn,sans-serif' }}>
      <style>{`
        @keyframes slideInUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 15px rgba(245,158,11,0.15)} 50%{box-shadow:0 0 30px rgba(245,158,11,0.35)} }
        @keyframes scanH { 0%{left:-100%} 100%{left:100%} }
      `}</style>

      {/* هدر */}
      <div style={{ position:'relative', background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(251,146,60,0.05))', border:'1px solid rgba(245,158,11,0.25)', borderRadius:28, padding:'24px 28px', marginBottom:24, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#f59e0b,#fb923c,transparent)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:'50%', height:1, background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.3),transparent)', animation:'scanH 3s linear infinite' }} />
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:52, height:52, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', animation:'glowPulse 3s ease-in-out infinite' }}>
              <AlertCircle size={26} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize:22, fontWeight:900, color:'#fbbf24', margin:0, letterSpacing:'-0.5px' }}>خروج کالاهای ثبت نشده</h3>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', margin:'4px 0 0' }}>
                مدیریت کالاهای بدون کد · {filteredItems.length} مورد
              </p>
            </div>
          </div>
          {/* جستجو */}
          <div style={{ position:'relative', width:260 }}>
            <Search style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)' }} size={16} />
            <input
              placeholder="جستجو..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:'10px 42px 10px 14px', color:'#fff', fontFamily:'Vazirmatn,sans-serif', fontSize:13, fontWeight:700, outline:'none' }}
            />
          </div>
        </div>
      </div>

      {/* لیست */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filteredItems.map((item, idx) => {
          const key = `${item.recordId}-${item.itemIndex}`;
          const filteredProds = products.filter(p =>
            p.description.toLowerCase().includes((assigningCodes[key]||'').toLowerCase()) ||
            p.code.toLowerCase().includes((assigningCodes[key]||'').toLowerCase())
          ).slice(0,15);

          return (
            <div key={key} style={{ position:'relative', background:'linear-gradient(135deg,rgba(245,158,11,0.04),rgba(0,0,0,0.3))', border:'1px solid rgba(245,158,11,0.12)', borderRadius:24, padding:'20px 24px', overflow:'hidden', animation:`slideInUp 0.4s ease ${idx*0.05}s both`, transition:'border-color 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(245,158,11,0.3)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='rgba(245,158,11,0.12)')}
            >
              {/* نوار رنگی سمت راست */}
              <div style={{ position:'absolute', top:0, right:0, width:3, height:'100%', background:'linear-gradient(180deg,#f59e0b,transparent)' }} />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 80px 1fr', gap:20, alignItems:'center' }}>
                {/* اطلاعات کالا */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Package size={20} color="#f59e0b" />
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:900, color:'#fff', marginBottom:4 }}>{item.productDescription}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>
                      <Hash size={10} /><span>{item.docNumber}</span>
                    </div>
                  </div>
                </div>

                {/* اطلاعات تحویل */}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>
                    <User size={13} color="#f59e0b" /><span>{item.recipientName}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>
                    <Calendar size={12} color="#f59e0b" /><span>{item.date}</span>
                  </div>
                </div>

                {/* تعداد */}
                <div style={{ textAlign:'center' }}>
                  <div style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:100, padding:'6px 12px', fontSize:12, fontWeight:900, color:'#fbbf24' }}>
                    {item.quantity} {item.unit}
                  </div>
                </div>

                {/* کدگذاری */}
                <div style={{ display:'flex', gap:10, alignItems:'center', position:'relative' }}>
                  <div style={{ flex:1, position:'relative' }}>
                    <ArrowRightLeft style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.2)', pointerEvents:'none' }} size={14} />
                    <input
                      placeholder="کد کالای جدید..."
                      value={assigningCodes[key] || ''}
                      onChange={e => handleCodeChange(key, e.target.value)}
                      onFocus={()=>setShowProductDrop(key)}
                      onBlur={()=>setTimeout(()=>setShowProductDrop(null),200)}
                      style={{ width:'100%', boxSizing:'border-box', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:'10px 40px 10px 14px', color:'#fff', fontFamily:'Vazirmatn,sans-serif', fontSize:12, fontWeight:700, outline:'none', transition:'border-color 0.2s' }}
                    />
                    {/* dropdown محصولات */}
                    {showProductDrop===key && filteredProds.length > 0 && (
                      <div style={{ position:'absolute', bottom:'calc(100% + 6px)', right:0, left:0, zIndex:999, background:'rgba(10,12,28,0.97)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:14, overflow:'hidden', boxShadow:'0 -20px 60px rgba(0,0,0,0.7)', backdropFilter:'blur(20px)', maxHeight:200, overflowY:'auto' }}>
                        {filteredProds.map((p,i) => (
                          <div key={p.code} onMouseDown={()=>{setAssigningCodes(prev=>({...prev,[key]:p.code}));setShowProductDrop(null);}}
                            style={{ padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:10, background:i%2===0?'rgba(245,158,11,0.02)':'transparent', transition:'background 0.15s' }}
                            onMouseEnter={e=>(e.currentTarget.style.background='rgba(245,158,11,0.1)')}
                            onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'rgba(245,158,11,0.02)':'transparent')}
                          >
                            <span style={{ background:'rgba(245,158,11,0.15)', borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:900, color:'#fbbf24' }}>{p.code}</span>
                            <span style={{ fontSize:12, color:'#fff' }}>{p.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleConfirm(item.recordId, item.itemIndex, key)}
                    style={{ width:44, height:44, background:'linear-gradient(135deg,#d97706,#b45309)', border:'none', borderRadius:12, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 20px rgba(245,158,11,0.3)', transition:'all 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='scale(1.1)';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 6px 25px rgba(245,158,11,0.5)';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 4px 20px rgba(245,158,11,0.3)';}}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div style={{ width:80, height:80, background:'rgba(16,185,129,0.1)', border:'2px solid rgba(16,185,129,0.2)', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle2 size={40} color="#10b981" />
            </div>
            <p style={{ fontSize:14, fontWeight:900, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.4em' }}>تمامی کالاها کدگذاری شده‌اند</p>
          </div>
        )}
      </div>
    </div>
  );
};
