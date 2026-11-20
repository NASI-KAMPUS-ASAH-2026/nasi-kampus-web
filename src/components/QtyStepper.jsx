import Icon from './Icon';
import { CONFIG } from '../config';

export default function QtyStepper({ value, onChange, min = 1, max = CONFIG.order.maxQtyPerItem, label = 'Jumlah', size }) {
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className={`qty${size === 'lg' ? ' qty--lg' : ''}`} role="group" aria-label={label}>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Kurangi ${label.toLowerCase()}`}>
        <Icon name="minus" size={18} />
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`}>{value}</output>
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`Tambah ${label.toLowerCase()}`}>
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
