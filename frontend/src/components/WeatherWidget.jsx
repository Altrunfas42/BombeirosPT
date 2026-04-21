import { useEffect, useState } from 'react';
import axios from 'axios';

function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  async function fetchWeather() {
    try {
      const res = await axios.get(
        'https://api.open-meteo.com/v1/forecast?latitude=38.72&longitude=-9.13&current_weather=true'
      );

      setWeather(res.data.current_weather);
    } catch (error) {
      console.error(error);
    }
  }

  if (!weather) return null;

  return (
    <div
      style={{
        background: 'white',
        padding: '18px',
        borderRadius: '14px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.07)',
        marginBottom: '18px',
      }}
    >
      <strong style={{ fontSize: '18px' }}>
        🌤 Condições Meteorológicas
      </strong>

      <div style={{ marginTop: '10px' }}>
        🌡 Temperatura: {weather.temperature}°C
      </div>

      <div>💨 Vento: {weather.windspeed} km/h</div>
    </div>
  );
}

export default WeatherWidget;