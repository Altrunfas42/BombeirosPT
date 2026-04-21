import { useEffect, useState } from 'react';
import api from '../services/api';

function Card({ title, value, color, dark }) {
  return (
    <div
      style={{
        background: dark ? '#020617' : 'white',
        padding: '22px',
        borderRadius: '14px',
        flex: 1,
        boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
        transition: '0.2s',
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        style={{
          color: dark ? '#cbd5e1' : '#666',
          marginBottom: '10px',
          fontSize: '15px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '30px',
          fontWeight: 'bold',
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatsCards({ dark }) {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const token = localStorage.getItem('token');

      const res = await api.get('/burn-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      setStats({
        pending: data.filter((r) => r.status === 'PENDING').length,
        approved: data.filter((r) => r.status === 'APPROVED').length,
        rejected: data.filter((r) => r.status === 'REJECTED').length,
        total: data.length,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
      }}
    >
      <Card
        title="❓ Pendentes"
        value={stats.pending}
        color="#eab308"
        dark={dark}
      />
      <Card
        title="✅ Aprovados"
        value={stats.approved}
        color="#16a34a"
        dark={dark}
      />
      <Card
        title="❌ Rejeitados"
        value={stats.rejected}
        color="#dc2626"
        dark={dark}
      />
      <Card
        title="📊 Total"
        value={stats.total}
        color="#2563eb"
        dark={dark}
      />
    </div>
  );
}

export default StatsCards;