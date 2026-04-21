import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

function getPriorityColor(priority) {
  if (priority === 'CRITICAL') return '#dc2626';
  if (priority === 'HIGH') return '#ea580c';
  return '#eab308';
}

function getTypeIcon(description = '') {
  const text = description.toLowerCase();

  if (text.includes('queimada')) return '🔥';
  if (text.includes('pedido de ajuda')) return '🆘';
  if (text.includes('vegetação perigosa')) return '🌿';
  if (text.includes('fumo suspeito')) return '🚨';

  return '📍';
}

function getStatusBadge(status) {
  if (status === 'APPROVED') return '✅';
  if (status === 'REJECTED') return '❌';
  return '❓';
}

function createMarkerIcon(description, status) {
  const typeIcon = getTypeIcon(description);
  const statusBadge = getStatusBadge(status);

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="
        position: relative;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
      ">
        <span>${typeIcon}</span>
        <span style="
          position: absolute;
          top: -6px;
          right: -8px;
          font-size: 14px;
          background: white;
          border-radius: 999px;
          padding: 1px 3px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        ">
          ${statusBadge}
        </span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

function MapClickHandler({ canCreate, onSelectPoint }) {
  useMapEvents({
    click(e) {
      if (canCreate) {
        onSelectPoint(e.latlng);
      }
    },
  });

  return null;
}

function MapView() {
  const [requests, setRequests] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const [type, setType] = useState('Queimada');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const role = useMemo(() => getRoleFromToken(), []);
  const isCitizen = role === 'CITIZEN';
  const isFirefighter = role === 'FIREFIGHTER';

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get('/burn-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  }

  function resetForm() {
    setSelectedPoint(null);
    setType('Queimada');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
  }

  function getPriorityFromType(selectedType) {
    if (selectedType === 'Fumo Suspeito') return 'CRITICAL';
    if (
      selectedType === 'Pedido de Ajuda' ||
      selectedType === 'Vegetação Perigosa'
    ) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  async function createRequest() {
    try {
      const token = localStorage.getItem('token');

      if (!selectedPoint) {
        toast.error('Seleciona um ponto no mapa');
        return;
      }

      if (!date || !startTime || !endTime || !description.trim()) {
        toast.error('Preenche todos os campos');
        return;
      }

      const priority = getPriorityFromType(type);

      await api.post(
        '/burn-requests',
        {
          latitude: selectedPoint.lat,
          longitude: selectedPoint.lng,
          date,
          startTime,
          endTime,
          description: `${type} - ${description.trim()}`,
          priority,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Pedido criado com sucesso');
      resetForm();
      loadRequests();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast.error(
        error?.response?.data?.message || 'Erro ao criar pedido'
      );
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

      toast.success('Estado atualizado com sucesso');
      loadRequests();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar pedido'
      );
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        background: 'white',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          zIndex: 1000,
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          lineHeight: 1.5,
          minWidth: '170px',
        }}
      >
        <strong>Legenda</strong>
        <hr />
        <div>🔥 Queimada</div>
        <div>🆘 Pedido de Ajuda</div>
        <div>🌿 Vegetação Perigosa</div>
        <div>🚨 Fumo Suspeito</div>
        <hr />
        <div>🟡 Prioridade Média</div>
        <div>🟠 Prioridade Alta</div>
        <div>🔴 Prioridade Crítica</div>
        <hr />
        <div>❓ Pendente</div>
        <div>✅ Aprovado</div>
        <div>❌ Rejeitado</div>
      </div>

      <MapContainer
        center={[38.72, -9.13]}
        zoom={7}
        style={{
          height: '650px',
          width: '100%',
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapClickHandler
          canCreate={isCitizen}
          onSelectPoint={setSelectedPoint}
        />

        {selectedPoint && isCitizen && (
          <Marker position={selectedPoint}>
            <Popup minWidth={280}>
              <div>
                <h3 style={{ marginTop: 0 }}>Novo Pedido</h3>

                <label>Tipo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '6px',
                  }}
                >
                  <option>Queimada</option>
                  <option>Pedido de Ajuda</option>
                  <option>Vegetação Perigosa</option>
                  <option>Fumo Suspeito</option>
                </select>

                <label>Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '6px',
                  }}
                />

                <label>Hora Início</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '6px',
                  }}
                />

                <label>Hora Fim</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '6px',
                  }}
                />

                <label>Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    padding: '6px',
                    resize: 'vertical',
                  }}
                />

                <button
                  onClick={createRequest}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                  }}
                >
                  Criar Pedido
                </button>

                <button
                  onClick={resetForm}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#e5e7eb',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {requests.map((req) => (
          <div key={req.id}>
            <Circle
              center={[req.latitude, req.longitude]}
              radius={250}
              pathOptions={{
                color: getPriorityColor(req.priority),
                fillColor: getPriorityColor(req.priority),
                fillOpacity: 0.28,
              }}
            />

            <Marker
              position={[req.latitude, req.longitude]}
              icon={createMarkerIcon(req.description, req.status)}
            >
              <Popup minWidth={280}>
                <div>
                  <h3 style={{ marginTop: 0 }}>Pedido #{req.id}</h3>

                  <p>
                    <strong>Estado:</strong> {req.status}
                  </p>

                  <p>
                    <strong>Prioridade:</strong> {req.priority}
                  </p>

                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(req.date).toLocaleDateString()}
                  </p>

                  <p>
                    <strong>Horário:</strong> {req.startTime} - {req.endTime}
                  </p>

                  <p>
                    <strong>Descrição:</strong> {req.description}
                  </p>

                  {isFirefighter && req.status === 'PENDING' && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '10px',
                      }}
                    >
                      <button
                        onClick={() => updateStatus(req.id, 'APPROVED')}
                        style={{
                          flex: 1,
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                      >
                        Aprovar
                      </button>

                      <button
                        onClick={() => updateStatus(req.id, 'REJECTED')}
                        style={{
                          flex: 1,
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
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
                        marginTop: '10px',
                        fontWeight: 'bold',
                        color:
                          req.status === 'APPROVED' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      ✔ Decisão finalizada
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;

