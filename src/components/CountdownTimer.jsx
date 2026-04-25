import { useState, useEffect } from 'react';

function getTimeLeft(expiresAt) {
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s, diff };
}

export default function CountdownTimer({ expiresAt, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!timeLeft) {
    return <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Süresi doldu</span>;
  }

  const { h, m, s, diff } = timeLeft;
  const urgent = diff < 30 * 60 * 1000;
  const warning = diff < 60 * 60 * 1000;
  const color = urgent ? 'var(--danger)' : warning ? '#c17f24' : 'var(--success)';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12 }}>⏱</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {h > 0 ? `${h}s ${m}dk` : `${m}:${String(s).padStart(2, '0')}`}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: urgent ? '#fdecea' : warning ? '#fff8e1' : '#edf7f1', borderRadius: 'var(--radius-sm)', border: `1px solid ${color}20` }}>
      <span>⏱</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {h > 0 ? `${h} saat ${m} dk kaldı` : `${m}:${String(s).padStart(2, '0')} kaldı`}
      </span>
    </div>
  );
}
