/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { PackagePlus, HardHat, Activity, TrendingUp, Package, Users, Clock, Star, Award, Zap, BarChart2, Shield, Cpu, Database, Wifi, AlertTriangle } from 'lucide-react';
import { ExitRecord } from '../types';

const LOGO_BASE64 = 'data:image/png;base64,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';

interface DashboardViewProps {
  exits: ExitRecord[];
}

// ── Particle System ──────────────────────────────────────────────────────────
const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        // خط اتصال بین ذرات نزدیک
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6 }} />;
};

// ── Live Stats Bar (بین ساعت و میز کار) ─────────────────────────────────────
const LiveStatsBar: React.FC<{ exits: ExitRecord[] }> = ({ exits }) => {
  const today = exits.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString());
  const thisWeek = exits.filter(e => (Date.now() - e.timestamp) / 86400000 <= 7);
  const lastExit = exits.length > 0 ? [...exits].sort((a,b)=>b.timestamp-a.timestamp)[0] : null;
  const minutesAgo = lastExit ? Math.floor((Date.now() - lastExit.timestamp) / 60000) : null;
  const topProduct = (() => {
    const pm: Record<string,number> = {};
    exits.forEach(e => e.items.forEach(it => { pm[it.productDescription] = (pm[it.productDescription]||0)+it.quantity; }));
    const s = Object.entries(pm).sort((a,b)=>b[1]-a[1]);
    return s[0]?.[0] || '—';
  })();

  const cells = [
    { icon: <PackagePlus size={18}/>, label: 'خروج امروز', value: today.length, unit: 'سند', sub: `${today.reduce((s,e)=>s+e.items.length,0)} قلم`, color: '#6366f1' },
    { icon: <Activity size={18}/>, label: 'این هفته', value: thisWeek.length, unit: 'تراکنش', sub: `${thisWeek.reduce((s,e)=>s+e.items.length,0)} قلم`, color: '#06b6d4' },
    { icon: <TrendingUp size={18}/>, label: 'پرمصرف‌ترین کالا', value: null, unit: '', sub: topProduct, color: '#10b981', text: topProduct.length > 12 ? topProduct.slice(0,12)+'…' : topProduct },
    { icon: <Clock size={18}/>, label: 'آخرین خروج', value: minutesAgo !== null ? (minutesAgo < 60 ? minutesAgo : Math.floor(minutesAgo/60)) : '—', unit: minutesAgo !== null ? (minutesAgo < 60 ? 'دقیقه' : 'ساعت') : '', sub: lastExit?.recipientName || '—', color: '#f59e0b' },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, margin:'14px 0' }}>
      {cells.map((c,i) => (
        <div key={i} style={{ background:`linear-gradient(135deg,${c.color}08,${c.color}14)`, border:`1px solid ${c.color}22`, borderRadius:18, padding:'16px 18px', position:'relative', overflow:'hidden', cursor:'default', transition:'all 0.3s' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLDivElement).style.borderColor=`${c.color}45`;(e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 28px ${c.color}20`;}}
          onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='';(e.currentTarget as HTMLDivElement).style.borderColor=`${c.color}22`;(e.currentTarget as HTMLDivElement).style.boxShadow='';}}
        >
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c.color},transparent)` }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ color:c.color, opacity:0.8 }}>{c.icon}</div>
            <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', fontWeight:900, letterSpacing:'0.15em', textTransform:'uppercase' }}>{c.label}</span>
          </div>
          {c.value !== null ? (
            <div style={{ display:'flex', alignItems:'baseline', gap:5, marginBottom:4 }}>
              <span style={{ fontSize:'32px', fontWeight:900, color:c.color, lineHeight:1, textShadow:`0 0 18px ${c.color}60` }}>{c.value}</span>
              <span style={{ fontSize:'10px', color:`${c.color}90`, fontWeight:700 }}>{c.unit}</span>
            </div>
          ) : (
            <div style={{ fontSize:'14px', fontWeight:900, color:c.color, marginBottom:4, lineHeight:1.3 }}>{c.text}</div>
          )}
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.sub}</div>
          <div style={{ position:'absolute', bottom:12, left:14, width:5, height:5, borderRadius:'50%', background:c.color, animation:`ping 2s infinite`, animationDelay:`${i*0.6}s` }} />
        </div>
      ))}
    </div>
  );
};

// ── Left Panel (سمت چپ — آمار تفکیکی برترین تحویل‌گیرنده) ──────────────────
const RecipientLeftPanel: React.FC<{ topRecipient: any; exits: ExitRecord[] }> = ({ topRecipient, exits }) => {
  const [activeTab, setActiveTab] = useState<'items'|'trend'|'compare'>('items');

  const topItems = (() => {
    const pm: Record<string,number> = {};
    exits.filter(e=>e.recipientName===topRecipient.name).forEach(e=>e.items.forEach(it=>{pm[it.productDescription]=(pm[it.productDescription]||0)+it.quantity;}));
    return Object.entries(pm).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();

  const monthlyData = (() => {
    const months: Record<string,number> = {};
    exits.filter(e=>e.recipientName===topRecipient.name).forEach(e=>{
      const d = new Date(e.timestamp);
      const key = d.toLocaleDateString('fa-IR',{month:'short'});
      months[key] = (months[key]||0)+e.items.length;
    });
    return Object.entries(months).slice(-6);
  })();

  const compare = (() => {
    const pm: Record<string,number> = {};
    exits.forEach(e=>{ pm[e.recipientName]=(pm[e.recipientName]||0)+e.items.length; });
    const s = Object.entries(pm).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const max = s[0]?.[1]||1;
    return s.map(([name,cnt])=>({ name, cnt, pct: Math.round(cnt/max*100) }));
  })();

  const tb = (t: string): React.CSSProperties => ({
    padding:'5px 12px', borderRadius:'8px 8px 0 0', border:'none', fontFamily:'Vazirmatn,sans-serif',
    fontSize:'9px', fontWeight:900, cursor:'pointer', transition:'all 0.2s', letterSpacing:'0.1em', textTransform:'uppercase' as const,
    background: activeTab===t ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: activeTab===t ? '#a5b4fc' : 'rgba(255,255,255,0.25)',
    borderBottom: activeTab===t ? '2px solid #6366f1' : '2px solid transparent',
  });

  const maxI = topItems[0]?.[1]||1;
  const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899'];
  const medals = ['🥇','🥈','🥉'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12, height:'100%' }}>
      {/* تب‌ها */}
      <div style={{ display:'flex', gap:2, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <button style={tb('items')} onClick={()=>setActiveTab('items')}>پرمصرف</button>
        <button style={tb('trend')} onClick={()=>setActiveTab('trend')}>روند</button>
        <button style={tb('compare')} onClick={()=>setActiveTab('compare')}>رتبه‌بندی</button>
      </div>

      {activeTab==='items' && (
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {topItems.length > 0 ? topItems.map(([name,cnt],i) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:'9px', fontWeight:900, color:COLORS[i], width:16, textAlign:'center', flexShrink:0 }}>#{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.75)', fontWeight:700, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
                  <span style={{ fontSize:'11px', fontWeight:900, color:COLORS[i], flexShrink:0, marginRight:4 }}>{cnt}</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(cnt/maxI)*100}%`, background:`linear-gradient(90deg,${COLORS[i]}55,${COLORS[i]})`, borderRadius:2, boxShadow:`0 0 6px ${COLORS[i]}40`, transition:'width 1s' }} />
                </div>
              </div>
            </div>
          )) : <p style={{ opacity:0.25, fontSize:'11px', textAlign:'center', padding:'16px 0' }}>داده موجود نیست</p>}
        </div>
      )}

      {activeTab==='trend' && (
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {monthlyData.length > 0 ? (() => {
            const maxM = Math.max(...monthlyData.map(m=>m[1]),1);
            return monthlyData.map(([month,cnt]) => (
              <div key={month} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', fontWeight:700, width:36, flexShrink:0, direction:'ltr', textAlign:'left' }}>{month}</span>
                <div style={{ flex:1, height:18, background:'rgba(255,255,255,0.04)', borderRadius:6, overflow:'hidden', position:'relative' }}>
                  <div style={{ height:'100%', width:`${(cnt/maxM)*100}%`, background:'linear-gradient(90deg,rgba(99,102,241,0.6),rgba(6,182,212,0.8))', borderRadius:6, transition:'width 1s' }} />
                  <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', fontSize:'9px', fontWeight:900, color:'rgba(255,255,255,0.8)' }}>{cnt}</span>
                </div>
              </div>
            ));
          })() : <p style={{ opacity:0.25, fontSize:'11px', textAlign:'center', padding:'16px 0' }}>داده ماهانه موجود نیست</p>}
        </div>
      )}

      {activeTab==='compare' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {compare.map(({name,cnt,pct},i) => {
            const gc=['#f59e0b','#9ca3af','#b45309'];
            return (
              <div key={name} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'11px 13px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>{medals[i]||'•'}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:i===0?'#fff':'rgba(255,255,255,0.55)', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:900, color:gc[i]||'#6366f1', flexShrink:0 }}>{cnt}</span>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:gc[i]||'#6366f1', borderRadius:2, boxShadow:`0 0 6px ${gc[i]||'#6366f1'}50`, transition:'width 1.2s' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Loan Slider (امانات) ─────────────────────────────────────────────────────
const LoanSlider: React.FC<{ exits: ExitRecord[] }> = ({ exits }) => {
  const [idx, setIdx] = useState(0);

  const loans = useMemo(() => {
    const result: { name: string; item: string; qty: number; unit: string; date: string }[] = [];
    exits.forEach(e => {
      e.items.forEach((it: any) => {
        if (it.isLoan) {
          result.push({ name: e.recipientName, item: it.productDescription, qty: it.quantity, unit: it.unit || 'عدد', date: e.date });
        }
      });
    });
    return result.reverse(); // جدیدترین اول
  }, [exits]);

  useEffect(() => {
    if (loans.length <= 1) return;
    const t = setInterval(() => setIdx(p => (p + 1) % loans.length), 3200);
    return () => clearInterval(t);
  }, [loans.length]);

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(251,146,60,0.04))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 24, padding: '18px 22px', position: 'relative', overflow: 'hidden', minHeight: 130 }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#f59e0b,transparent)' }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Package size={14} color="#f59e0b" />
        </div>
        <span style={{ fontSize:'9px', fontWeight:900, color:'#f59e0b', textTransform:'uppercase', letterSpacing:'0.25em' }}>امانات فعال</span>
        {loans.length > 0 && (
          <span style={{ marginRight:'auto', background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:100, padding:'2px 10px', fontSize:'10px', fontWeight:900, color:'#fbbf24' }}>{loans.length}</span>
        )}
      </div>

      {loans.length === 0 ? (
        <div style={{ textAlign:'center', padding:'16px 0', color:'rgba(255,255,255,0.2)', fontSize:'11px', fontWeight:700 }}>امانات فعالی ثبت نشده</div>
      ) : (
        <>
          <div key={idx} style={{ animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fbbf24', flexShrink:0 }}>
                  {loans[idx].name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:'#fff', marginBottom:2 }}>{loans[idx].name}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{loans[idx].date}</div>
                </div>
              </div>
              <span style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:100, padding:'4px 12px', fontSize:'11px', fontWeight:900, color:'#fbbf24', flexShrink:0 }}>
                {loans[idx].qty} {loans[idx].unit}
              </span>
            </div>
            <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'8px 12px', fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:600, lineHeight:1.4 }}>
              {loans[idx].item}
            </div>
          </div>

          {/* نقاط ناوبری */}
          {loans.length > 1 && (
            <div style={{ display:'flex', gap:4, justifyContent:'center', marginTop:10 }}>
              {loans.slice(0, Math.min(loans.length,8)).map((_,i) => (
                <div key={i} onClick={()=>setIdx(i)} style={{ width: i===idx%Math.min(loans.length,8)?16:5, height:5, borderRadius:3, background: i===idx%Math.min(loans.length,8)?'#f59e0b':'rgba(255,255,255,0.15)', transition:'all 0.3s', cursor:'pointer' }} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Orbit Ring ────────────────────────────────────────────────────────────────
const OrbitRing: React.FC<{ radius: number; speed: number; items: { icon: React.ReactNode; label: string; color: string }[]; reverse?: boolean }> = ({ radius, speed, items, reverse }) => {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    const animate = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current;
      lastRef.current = ts;
      setAngle(prev => (prev + (reverse ? -1 : 1) * (speed * dt / 1000)) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, reverse]);
  return (
    <div style={{ position: 'absolute', width: radius * 2, height: radius * 2, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
      {items.map((item, i) => {
        const itemAngle = ((360 / items.length) * i + angle) * (Math.PI / 180);
        const x = Math.cos(itemAngle) * radius;
        const y = Math.sin(itemAngle) * radius;
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}>
            <div style={{ background: `${item.color}22`, border: `1px solid ${item.color}55`, borderRadius: '12px', padding: '8px 12px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '70px', boxShadow: `0 0 12px ${item.color}33` }}>
              <div style={{ color: item.color, fontSize: '16px' }}>{item.icon}</div>
              <span style={{ color: item.color, fontSize: '9px', fontWeight: 900, textAlign: 'center', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; delay?: number }> = ({ icon, label, value, color, delay = 0 }) => {
  const [displayed, setDisplayed] = useState(0);
  const target = typeof value === 'number' ? value : 0;
  useEffect(() => {
    if (typeof value !== 'number') return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return (
    <div style={{ background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`, border: `1px solid ${color}30`, borderRadius: '24px', padding: '28px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: `0 4px 30px ${color}15, inset 0 1px 0 ${color}20`, transition: 'all 0.3s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.02)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${color}30`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 30px ${color}15, inset 0 1px 0 ${color}20`; }}
    >
      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: `linear-gradient(90deg, transparent, ${color}08, transparent)`, animation: 'shineSweep 4s ease-in-out infinite', animationDelay: `${delay}ms` }} />
      <div style={{ width: 52, height: 52, background: `${color}18`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color, boxShadow: `0 0 20px ${color}30`, border: `1px solid ${color}30` }}>{icon}</div>
      <p style={{ fontSize: '10px', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.35em', marginBottom: '10px', color: '#fff' }}>{label}</p>
      <h3 style={{ fontSize: '42px', fontWeight: 900, color, lineHeight: 1, textShadow: `0 0 20px ${color}80` }}>{typeof value === 'number' ? displayed : value}</h3>
    </div>
  );
};

// ── Rotating Item Card ────────────────────────────────────────────────────────
const RotatingItemCard: React.FC<{ items: any[]; activeIdx: number }> = ({ items, activeIdx }) => {
  const item = items[activeIdx];
  if (!item) return null;
  return (
    <div style={{ position: 'relative', padding: '32px', borderRadius: '32px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #6366f1, #06b6d4, #10b981, transparent)' }} />
      <span style={{ fontSize: '9px', fontWeight: 900, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.4em' }}>کالا {activeIdx + 1} از {items.length}</span>
      <div key={activeIdx} style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)', textAlign: 'center' }}>
        <h4 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>{item.productDescription}</h4>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 16px', borderRadius: 100, fontSize: '11px', fontWeight: 900, color: '#a5b4fc' }}>{item.quantity} {item.unit}</span>
          {item.category && <span style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', padding: '6px 16px', borderRadius: 100, fontSize: '11px', fontWeight: 900, color: '#67e8f9' }}>{item.category}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {items.slice(0, Math.min(items.length, 10)).map((_, i) => (
          <div key={i} style={{ width: i === activeIdx % Math.min(items.length, 10) ? 20 : 6, height: 6, borderRadius: 3, background: i === activeIdx % Math.min(items.length, 10) ? '#6366f1' : 'rgba(255,255,255,0.2)', transition: 'all 0.4s' }} />
        ))}
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export const DashboardView: React.FC<DashboardViewProps> = ({ exits }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const counts = useMemo(() => ({
    exit: exits.filter(e => e.type === 'EXIT').length,
    ppe: exits.filter(e => e.type === 'PPE').length,
    total: exits.length,
    today: exits.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length,
  }), [exits]);

  const topRecipient = useMemo(() => {
    const pm: Record<string, { count: number; items: any[]; records: number }> = {};
    exits.forEach(e => {
      if (!pm[e.recipientName]) pm[e.recipientName] = { count: 0, items: [], records: 0 };
      pm[e.recipientName].count += e.items.length;
      pm[e.recipientName].items.push(...e.items);
      pm[e.recipientName].records += 1;
    });
    const sorted = Object.entries(pm).sort((a, b) => b[1].count - a[1].count);
    return sorted.length > 0 ? { name: sorted[0][0], ...sorted[0][1] } : null;
  }, [exits]);

  const topPersons = useMemo(() => {
    const pm: Record<string, number> = {};
    exits.forEach(e => { pm[e.recipientName] = (pm[e.recipientName] || 0) + e.items.length; });
    return Object.entries(pm).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [exits]);

  useEffect(() => {
    if (topRecipient && topRecipient.items.length > 1) {
      const t = setInterval(() => setSlideIdx(prev => (prev + 1) % topRecipient.items.length), 2800);
      return () => clearInterval(t);
    }
  }, [topRecipient]);

  const orbitItems1 = [
    { icon: <Package size={14} />, label: 'انبارداری', color: '#6366f1' },
    { icon: <Shield size={14} />, label: 'ایمنی HSE', color: '#10b981' },
    { icon: <TrendingUp size={14} />, label: 'آمار لحظه‌ای', color: '#06b6d4' },
    { icon: <Users size={14} />, label: 'پرسنل', color: '#f59e0b' },
    { icon: <Zap size={14} />, label: 'عملکرد', color: '#ec4899' },
    { icon: <BarChart2 size={14} />, label: 'گزارش', color: '#8b5cf6' },
  ];
  const orbitItems2 = [
    { icon: <Award size={14} />, label: 'کیفیت', color: '#f59e0b' },
    { icon: <Clock size={14} />, label: 'زمانبندی', color: '#06b6d4' },
    { icon: <Star size={14} />, label: 'برتری', color: '#ec4899' },
    { icon: <TrendingUp size={14} />, label: 'رشد', color: '#10b981' },
  ];

  const formatTime = (d: Date) => d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ direction: 'rtl', position: 'relative', minHeight: '100vh', fontFamily: 'Vazirmatn, sans-serif' }}>
      <style>{`
        @keyframes shineSweep { 0% { left: -100% } 50% { left: 150% } 100% { left: 150% } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes floatUp { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes scanLine { 0% { top: 0% } 100% { top: 100% } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes ping { 0% { transform: scale(1); opacity: 1 } 75%, 100% { transform: scale(2.5); opacity: 0 } }
        @keyframes bgPulse { 0%, 100% { opacity: 0.03 } 50% { opacity: 0.06 } }
        @keyframes hexFloat { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-15px) rotate(3deg) } }
        @keyframes dataFlow { 0% { transform: translateY(-100%) } 100% { transform: translateY(100vh) } }
      `}</style>

      {/* ── پارتیکل‌ها ── */}
      <ParticleField />

      {/* ── بک‌گراند لوگو پیشرفته ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* لوگو مرکزی با blur و glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500 }}>
          <div style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', animation: 'bgPulse 4s ease-in-out infinite' }} />
          <img src={LOGO_BASE64} alt="" style={{ width: '100%', opacity: 0.05, filter: 'blur(1px) saturate(0)', animation: 'hexFloat 8s ease-in-out infinite' }} />
        </div>
        {/* گرادیان‌های رنگی */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 15% 25%, rgba(99,102,241,0.08) 0%, transparent 40%), radial-gradient(circle at 85% 75%, rgba(6,182,212,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 90%, rgba(16,185,129,0.05) 0%, transparent 40%)' }} />
        {/* خطوط شبکه‌ای */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
          <defs>
            <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6366f1" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid3" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#06b6d4" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
          <rect width="100%" height="100%" fill="url(#grid3)" />
        </svg>
        {/* خطوط جریان داده عمودی */}
        {[10, 25, 40, 55, 70, 85].map((x, i) => (
          <div key={i} style={{ position: 'absolute', top: 0, left: `${x}%`, width: 1, height: '30%', background: `linear-gradient(180deg, transparent, rgba(99,102,241,0.15), transparent)`, animation: `dataFlow ${4 + i * 0.7}s linear infinite`, animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>

      {/* ── محتوا ── */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 0.6s ease' }}>

        {/* ── هدر ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s infinite' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase' }}>سیستم فعال · P21 ULTRA</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginTop: 8, letterSpacing: '-0.02em' }}>میز کار مدیریت انبار</h1>
          </div>

          {/* ساعت */}
          <div style={{ textAlign: 'left', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '14px 22px', borderRadius: 16, backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#a5b4fc', letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums' }}>{formatTime(time)}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: 4, textAlign: 'center' }}>{formatDate(time)}</div>
          </div>
        </div>

        {/* ── آمار زنده بین ساعت و میز کار ── */}
        <LiveStatsBar exits={exits} />

        {/* ── کارت‌های آمار ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 32, marginTop: 20 }}>
          <StatCard icon={<PackagePlus size={22} />} label="حواله خروج" value={counts.exit} color="#6366f1" delay={0} />
          <StatCard icon={<HardHat size={22} />} label="تجهیزات HSE" value={counts.ppe} color="#10b981" delay={150} />
          <StatCard icon={<Activity size={22} />} label="کل تراکنش‌ها" value={counts.total} color="#06b6d4" delay={300} />
          <StatCard icon={<Clock size={22} />} label="امروز" value={counts.today} color="#f59e0b" delay={450} />
        </div>

        {/* ── بخش اصلی: برترین تحویل‌گیرنده (راست/بزرگ) + سیستم نظارت (چپ/کوچک) ── */}
        {topRecipient ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '40px', padding: '48px 40px', marginBottom: 32, position: 'relative', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)', animation: 'scanLine 4s linear infinite', pointerEvents: 'none' }} />

            {/* چیدمان: برترین تحویل‌گیرنده سمت راست (بزرگ‌تر) — سیستم نظارت سمت چپ */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: 36, alignItems: 'center', position: 'relative', zIndex: 1 }}>

              {/* ستون ۱ — سیستم نظارت دورانی P21 (دست نخورده) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: 250, height: 250, borderRadius: '50%', border: '1px dashed rgba(99,102,241,0.15)', transform: 'translate(-50%,-50%)' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: 150, height: 150, borderRadius: '50%', border: '1px dashed rgba(6,182,212,0.1)', transform: 'translate(-50%,-50%)' }} />
                  <OrbitRing radius={115} speed={18} items={orbitItems1} />
                  <OrbitRing radius={65} speed={28} items={orbitItems2} reverse />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.2))', border: '2px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.4)', animation: 'floatUp 3s ease-in-out infinite', zIndex: 10 }}>
                    <Cpu size={30} color="#a5b4fc" />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em' }}>سیستم نظارت دورانی P21</span>
                </div>
              </div>

              {/* ستون ۲ — دو نیم: برترین تحویل‌گیرنده + امانات */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* نیم بالا: برترین تحویل‌گیرنده */}
                <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 24, padding: '20px 24px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '7px 16px', borderRadius: 100, marginBottom: 12 }}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#a5b4fc', letterSpacing: '0.3em', textTransform: 'uppercase' }}>برترین تحویل‌گیرنده</span>
                  </div>
                  <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', lineHeight: 1.1, textShadow: '0 0 30px rgba(99,102,241,0.7)', marginBottom: 10, letterSpacing: '-1px' }}>{topRecipient.name}</h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', padding: '5px 12px', borderRadius: 100, fontSize: '11px', fontWeight: 900, color: '#a5b4fc' }}>{topRecipient.count} قلم</span>
                    <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '5px 12px', borderRadius: 100, fontSize: '11px', fontWeight: 900, color: '#6ee7b7' }}>{topRecipient.records} فاکتور</span>
                  </div>
                  <RotatingItemCard items={topRecipient.items} activeIdx={slideIdx} />
                </div>

                {/* نیم پایین: امانات */}
                <LoanSlider exits={exits} />
              </div>

              {/* ستون ۳ — پنل آمار کاربردی (فضای خالی سمت راست) */}
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 24, padding: '20px 18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                <RecipientLeftPanel topRecipient={topRecipient} exits={exits} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.2, fontWeight: 900, letterSpacing: '0.5em', textTransform: 'uppercase', fontSize: '13px', marginBottom: 32 }}>داده‌ای برای نمایش موجود نیست</div>
        )}

        {/* ── ردیف پایین ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: 28, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={16} color="#f59e0b" /></div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>پرتکرارترین دریافت‌کنندگان</span>
            </div>
            {topPersons.length > 0 ? topPersons.map(([name, count], i) => {
              const maxC = topPersons[0][1];
              const bw = (count / maxC) * 100;
              const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
              const c = colors[i];
              return (
                <div key={name} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: c, width: 20, textAlign: 'center' }}>#{i + 1}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: c }}>{count}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bw}%`, background: `linear-gradient(90deg, ${c}80, ${c})`, borderRadius: 2, transition: 'width 1.2s' }} />
                  </div>
                </div>
              );
            }) : <p style={{ opacity: 0.3, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', textAlign: 'center', padding: '20px 0' }}>داده موجود نیست</p>}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: 28, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={16} color="#06b6d4" /></div>
              <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>شاخص‌های کلیدی</span>
            </div>
            {[
              { label: 'نرخ خروج کالا', value: counts.total > 0 ? Math.round((counts.exit / counts.total) * 100) : 0, color: '#6366f1', unit: '%' },
              { label: 'سهم تجهیزات ایمنی', value: counts.total > 0 ? Math.round((counts.ppe / counts.total) * 100) : 0, color: '#10b981', unit: '%' },
              { label: 'فعالیت امروز', value: counts.total > 0 ? Math.round((counts.today / counts.total) * 100) : 0, color: '#f59e0b', unit: '%' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{m.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: m.color }}>{m.value}{m.unit}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.value}%`, background: `linear-gradient(90deg, ${m.color}60, ${m.color})`, borderRadius: 3, boxShadow: `0 0 8px ${m.color}60`, transition: 'width 1.5s' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 28, padding: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, textAlign: 'center' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 6 }}>گزارش خودکار</p>
              <p style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700 }}>سیستم مدیریت دارایی P21 ULTRA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
