/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PageShellProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  icon, title, subtitle, accentColor = '#6366f1', headerRight, children
}) => {
  const hex = accentColor;
  return (
    <div style={{ direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif', animation: 'psEnter 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
      <style>{`
        @keyframes psEnter { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes psScan  { 0% { top:0% } 100% { top:100% } }
        @keyframes psPulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
      `}</style>

      {/* Page header */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${hex}0a 0%, rgba(6,182,212,0.04) 100%)`,
        border: `1px solid ${hex}22`,
        borderRadius: 28,
        padding: '28px 32px',
        marginBottom: 28,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {/* Scan line */}
        <div style={{ position:'absolute', left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${hex}40,transparent)`, animation:'psScan 4s linear infinite', pointerEvents:'none' }} />
        {/* Glow corner */}
        <div style={{ position:'absolute', top:0, right:0, width:160, height:160, background:`radial-gradient(circle, ${hex}0f 0%, transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{
            width:52, height:52, borderRadius:16,
            background:`${hex}18`, border:`1px solid ${hex}30`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color: hex, boxShadow:`0 0 20px ${hex}25`,
            flexShrink:0,
          }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:900, color:'#fff', margin:0, lineHeight:1.1 }}>{title}</h2>
            {subtitle && <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', margin:'6px 0 0' }}>{subtitle}</p>}
          </div>
        </div>
        {headerRight && <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>{headerRight}</div>}
      </div>

      {children}
    </div>
  );
};

// ── Reusable glass card ────────────────────────────────────────────────────────
export const GlassCard: React.FC<{ children: React.ReactNode; accent?: string; style?: React.CSSProperties; className?: string }> = ({ children, accent = '#6366f1', style, className }) => (
  <div className={className} style={{
    background: 'rgba(10,12,24,0.7)',
    backdropFilter: 'blur(20px)',
    border: `1px solid rgba(255,255,255,0.07)`,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    ...style,
  }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${accent}30,transparent)`, pointerEvents:'none' }} />
    {children}
  </div>
);

// ── Field label + input ────────────────────────────────────────────────────────
export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label style={{ display:'block', fontSize:'9px', fontWeight:900, color:'rgba(255,255,255,0.3)', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:6 }}>{label}</label>
    {children}
  </div>
);

// ── Styled input ───────────────────────────────────────────────────────────────
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{
    width:'100%', boxSizing:'border-box',
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:12, padding:'12px 16px', color:'#fff',
    fontFamily:'Vazirmatn,sans-serif', fontSize:'13px', fontWeight:600, outline:'none',
    transition:'all 0.2s',
    ...(props.style || {}),
  }}
  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.background='rgba(99,102,241,0.06)'; e.currentTarget.style.boxShadow='0 0 16px rgba(99,102,241,0.1)'; }}
  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.boxShadow='none'; }}
  />
);

// ── Styled select ──────────────────────────────────────────────────────────────
export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{
    width:'100%', boxSizing:'border-box',
    background:'rgba(10,12,24,0.9)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:12, padding:'12px 16px', color:'#fff',
    fontFamily:'Vazirmatn,sans-serif', fontSize:'13px', fontWeight:700, outline:'none',
    transition:'all 0.2s', cursor:'pointer',
    ...(props.style || {}),
  }} />
);

// ── Btn ────────────────────────────────────────────────────────────────────────
export const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'success'|'danger'|'ghost'; accentColor?: string }> = ({ variant='primary', accentColor, children, style, ...rest }) => {
  const bg: Record<string, string> = {
    primary: accentColor ? `linear-gradient(135deg,${accentColor},${accentColor}cc)` : 'linear-gradient(135deg,#6366f1,#4f46e5)',
    success: 'linear-gradient(135deg,#10b981,#059669)',
    danger:  'linear-gradient(135deg,#ef4444,#dc2626)',
    ghost:   'rgba(255,255,255,0.06)',
  };
  return (
    <button {...rest} style={{
      background: bg[variant], color:'#fff', border:'1px solid rgba(255,255,255,0.12)',
      borderRadius:12, padding:'11px 20px', fontFamily:'Vazirmatn,sans-serif',
      fontWeight:900, fontSize:'12px', letterSpacing:'0.1em', cursor:'pointer',
      transition:'all 0.2s', display:'inline-flex', alignItems:'center', gap:6,
      boxShadow: variant !== 'ghost' ? `0 4px 20px ${accentColor||'rgba(99,102,241,0.3)'}` : 'none',
      ...(style||{}),
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter='brightness(1.15)'; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter=''; (e.currentTarget as HTMLElement).style.transform=''; }}
    onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform='scale(0.97)'; }}
    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform=''; }}
    >
      {children}
    </button>
  );
};

// ── Table container ────────────────────────────────────────────────────────────
export const TableContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background:'rgba(5,8,18,0.8)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'right' }}>
        {children}
      </table>
    </div>
  </div>
);

export const Th: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <th style={{ padding:'14px 18px', fontSize:'9px', fontWeight:900, color:'rgba(99,102,241,0.8)', textTransform:'uppercase', letterSpacing:'0.25em', background:'rgba(99,102,241,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap', ...style }}>{children}</th>
);

export const Td: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <td style={{ padding:'13px 18px', fontSize:'12px', borderBottom:'1px solid rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.85)', verticalAlign:'middle', ...style }}>{children}</td>
);

export const TrRow: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <tr onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined, transition:'background 0.2s' }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.06)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=''; }}
  >{children}</tr>
);

// ── Badge ──────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = '#6366f1', children }) => (
  <span style={{ background:`${color}18`, border:`1px solid ${color}35`, color, padding:'3px 10px', borderRadius:100, fontSize:'9px', fontWeight:900, letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{children}</span>
);

// ── Empty state ────────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ message?: string }> = ({ message = 'داده‌ای موجود نیست' }) => (
  <div style={{ padding:'60px 20px', textAlign:'center', opacity:0.2 }}>
    <div style={{ fontSize:'32px', marginBottom:12 }}>📦</div>
    <p style={{ fontSize:'11px', fontWeight:900, letterSpacing:'0.4em', textTransform:'uppercase' }}>{message}</p>
  </div>
);
