import { EmptyState } from '../../components/States';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon="search"
        title="Halaman tidak ditemukan (404)"
        text="Alamat yang Anda buka tidak tersedia atau sudah dipindahkan. Silakan kembali ke beranda atau lihat daftar menu kami."
        action={{ to: '/', label: 'Kembali ke Beranda' }}
        secondary={{ to: '/menu', label: 'Lihat Menu' }}
      />
    </div>
  );
}
