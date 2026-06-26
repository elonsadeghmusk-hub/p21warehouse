/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ── Global toast manager ──────────────────────────────────────────────────────
type Listener = (items: ToastItem[]) => void;
let _items: ToastItem[] = [];
let _id = 0;
const _listeners: Set<Listener> = new Set();
const _notify = () => _listeners.forEach(l => l([..._items]));

const _add = (item: Omit<ToastItem,'id'>, duration = 3500) => {
  const id = ++_id;
  _items = [..._items, { ...item, id }];
  _notify();
  if (item.type !== 'confirm') setTimeout(() => _remove(id), duration);
  return id;
};
const _remove = (id: number) => {
  _items = _items.filter(i => i.id !== id);
  _notify();
};

// ── Public API ────────────────────────────────────────────────────────────────
export const toast = {
  success: (msg: string) => _add({ type: 'success', message: msg }),
  error:   (msg: string) => _add({ type: 'error',   message: msg }, 5000),
  warning: (msg: string) => _add({ type: 'warning', message: msg }, 4000),
  info:    (msg: string) => _add({ type: 'info',    message: msg }),
  confirm: (msg: string, onConfirm: () => void, onCancel?: () => void) =>
    _add({ type: 'confirm', message: msg, onConfirm, onCancel }),
};

// ── Toast Component ───────────────────────────────────────────────────────────
const CONFIGS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#6ee7b7', icon: <CheckCircle2 size={20}/>, glow: '0 0 30px rgba(16,185,129,0.25)' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  color: '#fca5a5', icon: <XCircle size={20}/>,      glow: '0 0 30px rgba(239,68,68,0.25)' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', color: '#fcd34d', icon: <AlertTriangle size={20}/>, glow: '0 0 30px rgba(245,158,11,0.25)' },
  info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', color: '#a5b4fc', icon: <Info size={20}/>,          glow: '0 0 30px rgba(99,102,241,0.25)' },
  confirm: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.45)', color: '#a5b4fc', icon: <AlertTriangle size={20}/>, glow: '0 0 40px rgba(99,102,241,0.3)' },
};

const ToastEl: React.FC<{ item: ToastItem }> = ({ item }) => {
  const [visible, setVisible] = useState(false);
  const cfg = CONFIGS[item.type];
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const close = () => { setVisible(false); setTimeout(() => _remove(item.id), 300); };

  return (
    <div style={{
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20,
      padding: item.type === 'confirm' ? '24px 24px' : '14px 18px',
      backdropFilter: 'blur(20px)',
      boxShadow: cfg.glow + ', 0 8px 32px rgba(0,0,0,0.4)',
      minWidth: 300,
      maxWidth: 420,
      position: 'relative',
      overflow: 'hidden',
      direction: 'rtl',
      fontFamily: 'Vazirmatn, sans-serif',
    }}>
      {/* نوار بالا */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${cfg.color},transparent)` }} />

      {item.type !== 'confirm' ? (
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ color:cfg.color, flexShrink:0 }}>{cfg.icon}</div>
          <span style={{ fontSize:13, fontWeight:700, color:'#fff', flex:1, lineHeight:1.5 }}>{item.message}</span>
          <button onClick={close} style={{ color:'rgba(255,255,255,0.3)', background:'none', border:'none', cursor:'pointer', padding:2, flexShrink:0 }}><X size={14}/></button>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ color:cfg.color, flexShrink:0 }}>{cfg.icon}</div>
            <span style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.6 }}>{item.message}</span>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={() => { item.onCancel?.(); close(); }}
              style={{ padding:'8px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', fontFamily:'Vazirmatn,sans-serif', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}
            >انصراف</button>
            <button onClick={() => { item.onConfirm?.(); close(); }}
              style={{ padding:'8px 20px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', fontFamily:'Vazirmatn,sans-serif', fontSize:12, fontWeight:900, cursor:'pointer', boxShadow:'0 4px 15px rgba(99,102,241,0.4)', transition:'all 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.filter='brightness(1.2)')}
              onMouseLeave={e=>(e.currentTarget.style.filter='')}
            >تأیید</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Toast Container ───────────────────────────────────────────────────────────
export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    _listeners.add(setItems);
    return () => { _listeners.delete(setItems); };
  }, []);
  if (!items.length) return null;
  return (
    <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column-reverse', gap:10, alignItems:'center', pointerEvents:'none' }}>
      {items.map(item => (
        <div key={item.id} style={{ pointerEvents:'all' }}>
          <ToastEl item={item} />
        </div>
      ))}
    </div>
  );
};
