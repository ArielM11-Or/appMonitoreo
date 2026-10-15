import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { ORURO_LANDMARKS } from '@/services/mock-data';
import { PublicTruckStatus } from '@/types/models';

interface PublicMapProps {
  trucks: PublicTruckStatus[];
  height?: number;
}

export function PublicMap({ trucks, height = 450 }: PublicMapProps) {
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(true);

  const htmlContent = useMemo(() => {
    const trucksJson = JSON.stringify(trucks);
    const landmarksJson = JSON.stringify(ORURO_LANDMARKS);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
    }
    #map {
      width: 100%;
      height: 100%;
    }

    /* Control Panel Flotante en el Mapa */
    .demo-control-bar {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(8px);
      padding: 8px 14px;
      border-radius: 12px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.15);
      font-size: 12px;
    }
    .demo-status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
    }
    .demo-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }
    .btn-toggle {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-toggle:hover {
      background: #0369a1;
    }

    /* Estilos del Marcador de Camión (Inspirados en sistemaMonitoreo) */
    .truck-marker-icon {
      background: none !important;
      border: none !important;
    }

    /* Badge flotante de Estado sobre el camión */
    .state-badge {
      position: absolute;
      top: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      color: white;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      transition: all 0.3s ease;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 10;
    }

    /* Wrapper circular con sombra y rotación continua */
    .marker-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 3px solid #ffffff;
      position: relative;
      transition: transform 0.8s ease-out, background-color 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    }
    .marker-wrapper svg {
      width: 28px;
      height: 28px;
      display: block;
    }

    /* Estado: AVANZANDO */
    .state-avanzando .marker-wrapper {
      background-color: #16a34a;
      box-shadow: 0 0 16px rgba(22, 163, 74, 0.7);
    }
    .state-avanzando .state-badge {
      background: #16a34a;
    }
    .state-avanzando .marker-wrapper::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid #16a34a;
      animation: honk 1.6s infinite ease-out;
      opacity: 0;
    }
    @keyframes honk {
      0% { transform: scale(1); opacity: 0.9; }
      100% { transform: scale(2); opacity: 0; }
    }

    /* Estado: RECOGIENDO (Detenido en esquina) */
    .state-recogiendo .marker-wrapper {
      background-color: #ea580c;
      border-color: #fed7aa;
      animation: collect-pulse 1s infinite alternate;
    }
    .state-recogiendo .state-badge {
      background: #ea580c;
      transform: translateX(-50%) scale(1.1);
    }
    @keyframes collect-pulse {
      0% { box-shadow: 0 0 10px rgba(234, 88, 12, 0.5); }
      100% { box-shadow: 0 0 28px rgba(234, 88, 12, 1); }
    }

    /* Icono de Referencia Urbana */
    .landmark-icon {
      background: #ffffff;
      border: 2px solid #0284c7;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Barra de Control del Demo -->
  <div class="demo-control-bar">
    <div class="demo-status-pill">
      <div class="demo-indicator" id="demo-indicator"></div>
      <span id="demo-status-text">Simulación: Avanzando</span>
    </div>
    <button class="btn-toggle" id="btn-toggle-demo" onclick="toggleDemo()">Pausar</button>
  </div>

  <script>
    // 1. Centro del recorrido en el Casco Histórico de Oruro
    // Cochabamba, Washington, Ayacucho, Pres. Montes
    const oruroCenter = [-17.9667, -67.1146];
    const map = L.map('map', {
      center: oruroCenter,
      zoom: 17, // Zoom cercano para visualizar las calles con precisión
      zoomControl: true
    });

    // 2. Capa oficial OpenStreetMap (sin marcas de agua ni API key)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // 3. Landmarks de Oruro
    const landmarks = ${landmarksJson};
    Object.values(landmarks).forEach(function(lm) {
      const icon = L.divIcon({
        className: 'custom-landmark',
        html: '<div class="landmark-icon">📍</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker([lm.latitude, lm.longitude], { icon: icon })
        .addTo(map)
        .bindPopup('<b>' + lm.title + '</b><br><span style="font-size:11px;color:#64748B;">Referencia Urbana - Oruro</span>');
    });

    // 4. Esquinas reales del Casco Histórico (de la ruta de sistemaMonitoreo)
    const CORNERS = [
      { lat: -17.9662472, lng: -67.1149926, name: "Cochabamba & Washington" },
      { lat: -17.9665350, lng: -67.1141072, name: "Cochabamba & Pres. Montes" },
      { lat: -17.9673350, lng: -67.1144072, name: "Ayacucho & Pres. Montes" },
      { lat: -17.9670472, lng: -67.1152926, name: "Ayacucho & Washington" }
    ];

    // Marcar las esquinas de recolección en el mapa
    CORNERS.forEach(function(c) {
      L.circleMarker([c.lat, c.lng], {
        radius: 6,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.8,
        weight: 2
      }).addTo(map).bindPopup('<b>Punto de Recojo</b><br>' + c.name);
    });

    // 5. Generar Ruta con orientación matemática continua (heading)
    function generateRoute(corners, stepsPerSegment) {
      const route = [];
      for (let i = 0; i < corners.length; i++) {
        const start = corners[i];
        const end = corners[(i + 1) % corners.length];

        for (let j = 0; j < stepsPerSegment; j++) {
          const fraction = j / stepsPerSegment;
          const isCorner = (j === 0);

          const dy = end.lat - start.lat;
          const dx = end.lng - start.lng;
          // Math.atan2(dx, dy) -> Y latitud, X longitud
          let angle = Math.atan2(dx, dy) * (180 / Math.PI);

          route.push({
            lat: start.lat + (end.lat - start.lat) * fraction,
            lng: start.lng + (end.lng - start.lng) * fraction,
            isCorner: isCorner,
            cornerName: isCorner ? start.name : null,
            heading: angle
          });
        }
      }
      return route;
    }

    const MOCK_ROUTE = generateRoute(CORNERS, 25);

    // Dibujar el trazo de la ruta (polyline)
    const routeCoords = MOCK_ROUTE.map(p => [p.lat, p.lng]);
    routeCoords.push(routeCoords[0]); // cerrar bucle
    L.polyline(routeCoords, {
      color: '#0284c7',
      weight: 4,
      opacity: 0.6,
      dashArray: '6, 8'
    }).addTo(map);

    // 6. SVG del Camión de Residuos (Idéntico a sistemaMonitoreo con caja verde y cabina)
    const truckSVG = \`
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="10" width="40" height="25" fill="#e2e8f0" rx="4"/>
        <rect x="25" y="35" width="50" height="55" fill="#16a34a" rx="4"/>
        <circle cx="20" cy="30" r="8" fill="#1e293b"/>
        <circle cx="80" cy="30" r="8" fill="#1e293b"/>
        <circle cx="20" cy="80" r="8" fill="#1e293b"/>
        <circle cx="80" cy="80" r="8" fill="#1e293b"/>
        <path d="M40,15 L60,15 L65,30 L35,30 Z" fill="#38bdf8"/>
      </svg>
    \`;

    const truckIcon = L.divIcon({
      className: 'truck-marker-icon state-avanzando',
      html: \`
        <div class="state-badge" id="truck-state-badge">REC-01: Avanzando</div>
        <div class="marker-wrapper" id="truck-wrapper">\${truckSVG}</div>
      \`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const initialPoint = MOCK_ROUTE[0];
    const truckMarker = L.marker([initialPoint.lat, initialPoint.lng], { icon: truckIcon }).addTo(map);
    truckMarker.bindPopup('<b>Camión REC-01</b><br>Ruta Casco Histórico Oruro<br>Estado: En Recolección');

    // 7. Bucle de Simulación de Movimiento y Recojo
    let routeIndex = 0;
    let pauseTicks = 0;
    let isRunning = true;

    function tick() {
      if (!isRunning) return;

      let state = 'Avanzando';
      const currentPoint = MOCK_ROUTE[routeIndex];

      if (pauseTicks > 0) {
        state = 'Recogiendo';
        pauseTicks--;
      } else {
        routeIndex = (routeIndex + 1) % MOCK_ROUTE.length;
        const nextPoint = MOCK_ROUTE[routeIndex];

        if (nextPoint.isCorner) {
          pauseTicks = 6; // Se detiene durante 6 ciclos simulando recojo de bolsas en la esquina
        }
      }

      const point = MOCK_ROUTE[routeIndex];
      truckMarker.setLatLng([point.lat, point.lng]);

      const iconElement = truckMarker.getElement();
      if (iconElement) {
        iconElement.classList.remove('state-avanzando', 'state-recogiendo');
        iconElement.classList.add(state === 'Avanzando' ? 'state-avanzando' : 'state-recogiendo');

        const badge = iconElement.querySelector('#truck-state-badge');
        if (badge) {
          badge.textContent = 'REC-01: ' + state;
        }

        const wrapper = iconElement.querySelector('#truck-wrapper');
        if (wrapper && point.heading !== undefined) {
          wrapper.style.transform = 'rotate(' + point.heading + 'deg)';
        }
      }

      // Actualizar barra flotante
      const statusText = document.getElementById('demo-status-text');
      const indicator = document.getElementById('demo-indicator');
      if (statusText) {
        statusText.textContent = state === 'Avanzando' ? 'REC-01: Avanzando (14 km/h)' : 'REC-01: Recogiendo en esquina';
      }
      if (indicator) {
        indicator.style.background = state === 'Avanzando' ? '#22c55e' : '#ea580c';
        indicator.style.boxShadow = state === 'Avanzando' ? '0 0 8px #22c55e' : '0 0 12px #ea580c';
      }
    }

    const intervalId = setInterval(tick, 1000);

    window.toggleDemo = function() {
      isRunning = !isRunning;
      const btn = document.getElementById('btn-toggle-demo');
      const text = document.getElementById('demo-status-text');
      if (btn) {
        btn.textContent = isRunning ? 'Pausar' : 'Reanudar';
        btn.style.background = isRunning ? '#0284c7' : '#16a34a';
      }
      if (text && !isRunning) {
        text.textContent = 'Simulación en Pausa';
      }
    };
  </script>
</body>
</html>
    `;
  }, [trucks]);

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 14,
          }}
          title="Mapa de Recolección en Oruro - Modo Demo"
        />
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  webView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
