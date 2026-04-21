import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function getRoleFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';

    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return (decoded?.role || '').toUpperCase();
  } catch {
    return '';
  }
}

function getTypeIcon(description = '') {
  const text = description.toLowerCase();

  if (text.includes('queimada')) return '🔥';
  if (text.includes('pedido de ajuda')) return '🆘';
  if (text.includes('vegetação')) return '🌿';
  if (text.includes('fumo')) return '🚨';

  return '📍';
}

function getStatusBadge(status) {
  if (status === 'APPROVED') return '✅';
  if (status === 'REJECTED') return '❌';
  return '❓';
}

function getPriorityColor(priority) {
  if (priority === 'CRITICAL') return '#dc2626';
  if (priority === 'HIGH') return '#ea580c';
  return '#eab308';
}

function SidebarRequests({ dark }) {
  const [requests, setRequests] = useState([]);

  const role = useMemo(() => getRoleFromToken(), []);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const token = localStorage.getItem('token');

      const res = await api.get('/burn-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar pedidos');
    }
  }

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem('token');

      await api.patch(
        `/burn-requests/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Atualizado');
      loadRequests();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || 'Erro'
      );
    }
  }

  return (
    <div
      style={{
        width: '350px',
        height: '100vh',
        overflowY: 'auto',
        background: dark ? '#020617' : '#f9fafb',
        padding: '15px',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      <h2 style={{ marginBottom: '15px' }}>
        📋 Pedidos
      </h2>

      {requests.length === 0 && <p>Sem pedidos</p>}

      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: dark ? '#020617' : 'white',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <div style={{ fontSize: '22px' }}>
              {getTypeIcon(req.description)}
            </div>

            <div style={{ fontSize: '18px' }}>
              {getStatusBadge(req.status)}
            </div>
          </div>

          {/* INFO */}
          <p>
            <strong>ID:</strong> #{req.id}
          </p>

          <p
            style={{
              color: getPriorityColor(req.priority),
              fontWeight: 'bold',
            }}
          >
            Prioridade: {req.priority}
          </p>

          <p>{req.description}</p>

          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            {new Date(req.date).toLocaleDateString()} | {req.startTime} - {req.endTime}
          </p>

          {/* BOTÕES */}
          {role === 'FIREFIGHTER' &&
            req.status === 'PENDING' && (
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '10px',
                }}
              >
                <button
                  onClick={() =>
                    updateStatus(req.id, 'APPROVED')
                  }
                  style={{
                    flex: 1,
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Aprovar
                </button>

                <button
                  onClick={() =>
                    updateStatus(req.id, 'REJECTED')
                  }
                  style={{
                    flex: 1,
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Rejeitar
                </button>
              </div>
            )}

          {req.status !== 'PENDING' && (
            <p
              style={{
                marginTop: '8px',
                fontWeight: 'bold',
              }}
            >
              ✔ Finalizado
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default SidebarRequests;