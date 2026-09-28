import { useState, useCallback, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const NAIROBI_DEFAULT = { lat: -1.2921, lng: 36.8219 };

const STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};

/** GPS-first location picker with a draggable marker fallback — if
 * geolocation fails or is denied, the user can still drop/drag the pin
 * manually on the map instead of being blocked from reporting. */
export default function LocationPicker({ theme, onChange }) {
  const [position, setPosition] = useState(NAIROBI_DEFAULT);
  const [gpsStatus, setGpsStatus] = useState('locating'); // locating | ok | denied | unavailable
  const [viewState, setViewState] = useState({ ...NAIROBI_DEFAULT, longitude: NAIROBI_DEFAULT.lng, latitude: NAIROBI_DEFAULT.lat, zoom: 13 });

  const applyPosition = useCallback((lat, lng) => {
    setPosition({ lat, lng });
    onChange({ lat, lng });
  }, [onChange]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      applyPosition(NAIROBI_DEFAULT.lat, NAIROBI_DEFAULT.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('ok');
        applyPosition(latitude, longitude);
        setViewState((v) => ({ ...v, latitude, longitude, zoom: 15 }));
      },
      () => {
        // GPS fallback: keep the default Nairobi pin so the user can
        // still drag it to the right spot instead of being stuck.
        setGpsStatus('denied');
        applyPosition(NAIROBI_DEFAULT.lat, NAIROBI_DEFAULT.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [applyPosition]);

  const recenterOnGPS = () => {
    setGpsStatus('locating');
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('ok');
        applyPosition(latitude, longitude);
        setViewState((v) => ({ ...v, latitude, longitude, zoom: 15 }));
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="location-picker">
      <div className="location-picker-map">
        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          mapStyle={STYLES[theme] || STYLES.light}
          style={{ width: '100%', height: '100%' }}
        >
          <Marker
            longitude={position.lng}
            latitude={position.lat}
            draggable
            onDragEnd={(e) => applyPosition(e.lngLat.lat, e.lngLat.lng)}
          >
            <div className="location-pin">📍</div>
          </Marker>
        </Map>
        <button type="button" className="gps-recenter-btn" onClick={recenterOnGPS}>
          🎯 Use my location
        </button>
      </div>

      <div className="location-status">
        {gpsStatus === 'locating' && 'Finding your location…'}
        {gpsStatus === 'ok' && `📍 ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)} — drag the pin to correct it`}
        {gpsStatus === 'denied' && '⚠️ Location permission denied — drag the pin to your actual location'}
        {gpsStatus === 'unavailable' && '⚠️ GPS not available on this device — drag the pin to your location'}
      </div>
    </div>
  );
}
