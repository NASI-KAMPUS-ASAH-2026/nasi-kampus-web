import { statusMeta } from '../../data/orderStatus';
import Icon from '../Icon';

export function StatusBadge({ status, size }) {
  const m = statusMeta(status);
  return <span className={`badge badge--${m.tone}${size === 'sm' ? ' badge--sm' : ''}`}><i aria-hidden="true" />{m.id}</span>;
}

export function AdminStatusBadge({ status, size }) {
  const toneMap = {
    'Menunggu Konfirmasi': 'warning',
    'Dikonfirmasi': 'info',
    'Ditolak': 'error',
    'Sedang Dipersiapkan': 'orange',
    'Siap Dijemput': 'success',
    'Selesai': 'neutral',
  };
  const tone = toneMap[status] || 'neutral';
  return <span className={`badge badge--${tone}${size === 'sm' ? ' badge--sm' : ''}`}><i aria-hidden="true" />{status}</span>;
}

export function PaymentBadge({ status, size }) {
  const tone = status === 'Lunas' ? 'success' : status === 'DP' ? 'warning' : 'error';
  return <span className={`badge badge--${tone}${size === 'sm' ? ' badge--sm' : ''}`}><i aria-hidden="true" />{status}</span>;
}

export function Alert({ tone = 'info', title, children, icon, className = '', role }) {
  return (
    <div className={`alert alert--${tone} ${className}`} role={role || (tone === 'error' ? 'alert' : 'note')}>
      <Icon name={icon || (tone === 'error' ? 'alert' : tone === 'success' ? 'check' : 'info')} size={20} />
      <div>
        {title && <strong className="alert-title">{title}</strong>}
        <div className="alert-body">{children}</div>
      </div>
    </div>
  );
}
