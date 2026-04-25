export default function DiscountBadge({ discountRate, basePrice, currentPrice }) {
  if (!discountRate || discountRate <= 0) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{
        background: 'linear-gradient(135deg, var(--terracotta), #e8845a)',
        color: 'white',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}>
        %{discountRate} İndirim
      </span>
      <span style={{
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        textDecoration: 'line-through',
      }}>
        ₺{basePrice?.toFixed(2)}
      </span>
    </div>
  );
}
