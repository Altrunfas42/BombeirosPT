import { useState } from 'react';
import MapView from './MapView';
import StatsCards from './StatsCards';
import SidebarRequests from './SidebarRequests';
import WeatherWidget from './WeatherWidget';

function Dashboard() {
  const [dark, setDark] = useState(false);

  const bg = dark ? '#0f172a' : '#f5f7fa';
  const text = dark ? 'white' : '#111';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: 'Arial',
        transition: '0.3s',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: dark ? '#020617' : '#0f172a',
          color: 'white',
          padding: '18px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
          }}
        >
          🔥 Bombeiros PT
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setDark(!dark)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {dark ? '☀ Light' : '🌙 Dark'}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.reload();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: '#dc2626',
              color: 'white',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '25px' }}>
        <div style={{ marginBottom: '20px' }}>
          <WeatherWidget />
        </div>

        <StatsCards dark={dark} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            marginTop: '25px',
          }}
        >
          <MapView />
          <SidebarRequests dark={dark} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;