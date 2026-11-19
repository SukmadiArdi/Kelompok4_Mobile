import { HiddenGem } from '../../types';

export interface LeafletMapConfig {
  gems: HiddenGem[];
  selectedGemId: string | null;
  mapType?: 'streets' | 'satellite';
  center?: [number, number];
  zoom?: number;
}

export function generateLeafletHtml(config: LeafletMapConfig): string {
  const {
    gems,
    selectedGemId,
    mapType = 'streets',
    center = [-2.5, 118.0],
    zoom = 5,
  } = config;

  const serializedGems = JSON.stringify(
    gems.map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      city: g.city,
      province: g.province,
      difficulty: g.difficulty,
      rating: g.rating,
      image: g.image,
      lat: g.mapCoords?.lat ?? -6.2,
      lng: g.mapCoords?.lng ?? 106.8,
    }))
  );

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      background: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      overflow: hidden;
    }
    
    .gem-marker-pin {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: bold;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .gem-marker-pin:hover {
      transform: scale(1.18);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
    }
    .gem-marker-pin.active {
      transform: scale(1.3);
      border-color: #1E293B;
      box-shadow: 0 0 0 4px rgba(217, 83, 56, 0.45), 0 8px 18px rgba(0, 0, 0, 0.4);
    }

    /* Popup Styling */
    .leaflet-popup-content-wrapper {
      border-radius: 14px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    }
    .leaflet-popup-content {
      margin: 0 !important;
      line-height: 1.35;
    }
    .popup-card {
      width: 220px;
      overflow: hidden;
    }
    .popup-img {
      width: 100%;
      height: 105px;
      object-fit: cover;
      display: block;
    }
    .popup-body {
      padding: 10px 12px;
    }
    .popup-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .popup-badge-mudah { background: #E8F5EE; color: #1B4931; }
    .popup-badge-sedang { background: #FEF3C7; color: #B45309; }
    .popup-badge-menantang { background: #FEE2E2; color: #B91C1C; }
    
    .popup-title {
      font-size: 13px;
      font-weight: 800;
      color: #1E293B;
      margin-bottom: 4px;
      line-height: 1.25;
    }
    .popup-loc {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 8px;
    }
    .popup-btn {
      display: block;
      width: 100%;
      text-align: center;
      background: #D95338;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 6px 0;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      border: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    const gemsData = ${serializedGems};
    let initialSelectedId = ${JSON.stringify(selectedGemId)};
    const isSatellite = ${mapType === 'satellite' ? 'true' : 'false'};

    // Inisialisasi Peta (zoomControl dinonaktifkan karena menggunakan touch gestures)
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      tap: false,
      scrollWheelZoom: true,
      inertia: true,
      inertiaDeceleration: 2500,
      inertiaMaxSpeed: 2500,
    }).setView([${center[0]}, ${center[1]}], ${zoom});

    // Pilihan Tile Layer Bebas API Key
    if (isSatellite) {
      L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
    } else {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
    }

    const markersMap = {};

    function getPinColor(diff) {
      if (diff === 'Mudah') return '#10B981';
      if (diff === 'Sedang') return '#F59E0B';
      return '#D95338';
    }

    function getCategoryEmoji(cat) {
      if (cat === 'Air Terjun') return '💧';
      if (cat === 'Pantai Sunyi') return '🏖️';
      if (cat === 'Kampung Adat') return '🏡';
      if (cat === 'Tebing & Sunrise') return '🌅';
      return '🌲';
    }

    function notifySelect(gemId) {
      // 1. Native WebView postMessage
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_GEM', id: gemId }));
      }
      // 2. Web Iframe postMessage
      if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'SELECT_GEM', id: gemId }, '*');
      }
    }

    gemsData.forEach((gem) => {
      const pinColor = getPinColor(gem.difficulty);
      const isSelected = gem.id === initialSelectedId;
      const emoji = getCategoryEmoji(gem.category);

      const iconHtml = \`
        <div id="pin-\${gem.id}" class="gem-marker-pin \${isSelected ? 'active' : ''}" style="background-color: \${pinColor};">
          <span>\${emoji}</span>
        </div>
      \`;

      const customIcon = L.divIcon({
        className: 'gem-div-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([gem.lat, gem.lng], { icon: customIcon }).addTo(map);

      const diffClass = gem.difficulty === 'Mudah' ? 'popup-badge-mudah' : (gem.difficulty === 'Sedang' ? 'popup-badge-sedang' : 'popup-badge-menantang');

      const popupContent = \`
        <div class="popup-card">
          <img src="\${gem.image}" class="popup-img" alt="\${gem.name}" />
          <div class="popup-body">
            <span class="popup-badge \${diffClass}">\${gem.difficulty} • \${gem.category}</span>
            <div class="popup-title">\${gem.name}</div>
            <div class="popup-loc">📍 \${gem.city}, \${gem.province}</div>
            <button class="popup-btn" onclick="notifySelect('\${gem.id}')">Pilih Destinasi</button>
          </div>
        </div>
      \`;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        updateActivePin(gem.id);
        notifySelect(gem.id);
      });

      markersMap[gem.id] = marker;
    });

    function updateActivePin(gemId) {
      Object.keys(markersMap).forEach((id) => {
        const el = document.getElementById('pin-' + id);
        if (el) {
          if (id === gemId) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        }
      });
    }

    // Centering bila ada target awal terpilih
    if (initialSelectedId && markersMap[initialSelectedId]) {
      const selected = gemsData.find((g) => g.id === initialSelectedId);
      if (selected) {
        map.setView([selected.lat, selected.lng], 8);
      }
    }

    function fitAllMarkers() {
      var markerList = Object.values(markersMap);
      if (markerList.length > 0) {
        var group = L.featureGroup(markerList);
        if (group.getBounds().isValid()) {
          map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 11 });
          return;
        }
      }
      map.flyTo([-2.5, 118.0], 5, { duration: 1.0 });
    }

    // Fungsi terpadu penanganan pesan dari React Native / WebView / Iframe
    function handleIncomingMapMessage(data) {
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      if (!data || typeof data !== 'object') return;

      if (data.type === 'FOCUS_GEM' && data.id) {
        var gem = gemsData.find(function(g) { return g.id === data.id; });
        if (gem) {
          updateActivePin(gem.id);
          map.flyTo([gem.lat, gem.lng], 10, { duration: 1.0 });
          if (markersMap[gem.id]) {
            markersMap[gem.id].openPopup();
          }
        }
      } else if (data.type === 'RESET_VIEW' || data.type === 'CENTER_TO') {
        // Prioritas 1: Koordinat spesifik yang dikirimkan (misal destinasi aktif)
        if (data.lat && data.lng) {
          map.flyTo([data.lat, data.lng], data.zoom || 10, { duration: 1.0 });
          if (data.id && markersMap[data.id]) {
            updateActivePin(data.id);
            markersMap[data.id].openPopup();
          }
        } else if (initialSelectedId && markersMap[initialSelectedId]) {
          // Prioritas 2: Destinasi awal terpilih
          var selGem = gemsData.find(function(g) { return g.id === initialSelectedId; });
          if (selGem) {
            updateActivePin(selGem.id);
            map.flyTo([selGem.lat, selGem.lng], 10, { duration: 1.0 });
            markersMap[initialSelectedId].openPopup();
          } else {
            fitAllMarkers();
          }
        } else {
          // Prioritas 3: Rentangkan peta mencakup semua marker
          fitAllMarkers();
        }
      } else if (data.type === 'PAN_BY') {
        map.panBy([data.x || 0, data.y || 0], { animate: true, duration: 0.3 });
      } else if (data.type === 'ZOOM_IN') {
        map.zoomIn();
      } else if (data.type === 'ZOOM_OUT') {
        map.zoomOut();
      }
    }

    // Lampirkan ke window untuk direct call via injectJavaScript (Android & iOS)
    window.handleIncomingMapMessage = handleIncomingMapMessage;

    // Pasang listener di window dan document (kompatibilitas penuh WebView Android/iOS & Web Iframe)
    window.addEventListener('message', function(event) {
      handleIncomingMapMessage(event.data);
    });
    document.addEventListener('message', function(event) {
      handleIncomingMapMessage(event.data);
    });
  </script>
</body>
</html>`;
}
