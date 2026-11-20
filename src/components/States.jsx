import { Link } from 'react-router-dom';
import Icon from './Icon';

/** Ilustrasi garis sederhana (bukan emoji) untuk state kosong/error. */
function StateArt({ icon }) {
  return (
    <div className="state-art" aria-hidden="true">
      <span className="state-ring" />
      <span className="state-ring state-ring--2" />
      <span className="state-ic"><Icon name={icon} size={34} strokeWidth={1.8} /></span>
    </div>
  );
}

export function EmptyState({ icon = 'box', title, text, action, secondary, tone }) {
  const renderAction = (a, cls) => a && (a.to
    ? <Link className={cls} to={a.to}>{a.label}</Link>
    : <button type="button" className={cls} onClick={a.onClick}>{a.label}</button>);
  return (
    <div className={`empty${tone === 'error' ? ' empty--error' : ''}`}>
      <StateArt icon={icon} />
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {(action || secondary) && (
        <div className="empty-actions">
          {renderAction(action, 'btn btn-primary')}
          {renderAction(secondary, 'btn btn-outline')}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ onRetry, title = 'Data gagal dimuat', text = 'Periksa koneksi Anda, lalu coba lagi.' }) {
  return <EmptyState tone="error" icon="alert" title={title} text={text} action={onRetry ? { label: 'Coba lagi', onClick: onRetry } : undefined} />;
}

export const GridSkeleton = ({ n = 6, label = 'Memuat menu' }) => (
  <div className="grid" aria-busy="true" aria-label={label}>
    {Array.from({ length: n }, (_, i) => (
      <div className="skel-card" key={i}>
        <div className="skel skel-img" />
        <div className="skel skel-line" style={{ width: '40%' }} />
        <div className="skel skel-line" style={{ width: '80%' }} />
        <div className="skel skel-line" style={{ width: '60%' }} />
      </div>
    ))}
  </div>
);

export const BlockSkeleton = ({ h = 320, label = 'Memuat' }) => (
  <div className="skel" style={{ height: h, borderRadius: 24 }} aria-busy="true" aria-label={label} />
);
