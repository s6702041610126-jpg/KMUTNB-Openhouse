import React, { useRef, useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { FACULTIES } from '../constants/faculties';
import { useApp } from '../context/AppContext';

export default function InAppMapView({ onSelectFaculty }) {
  const webViewRef = useRef(null);
  const {
    userLocation,
    activeNavigator,
    visitedFaculties,
    selectedAvatar,
    startNavigation,
    locationMode,
    setLocationModeAuto,
    resetToCampusLocation,
    refreshCurrentLocation,
    updateNavigatorRoute,
  } = useApp();

  // Map Tile Type: 'google_vector' | 'google_satellite' | 'google_embed'
  const [tileMode, setTileMode] = useState('google_vector');
  const [isMapReady, setIsMapReady] = useState(false);
  const hasSentInitialPos = useRef(false);

  // Selected faculty for iframe embed viewer mode
  const selectedFacultyForEmbed =
    FACULTIES.find((f) => f.id === activeNavigator?.facultyId) || FACULTIES[0];

  // Leaflet Map HTML — generated ONCE (or on tile/visited change), location is updated via postMessage only
  const mapHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #E5E7EB;
          }
          .custom-pin-wrapper {
            position: relative;
            width: 46px;
            height: 46px;
          }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 46px;
            height: 46px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            color: white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            border: 3px solid white;
          }
          .custom-pin-inner {
            transform: rotate(45deg);
            font-size: 22px;
            font-weight: bold;
          }
          .custom-pin.visited::after {
            content: '✓';
            position: absolute;
            top: -4px;
            right: -4px;
            background: #10B981;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            font-weight: bold;
            transform: rotate(45deg);
          }
          .avatar-pin-container {
            position: relative;
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-heading-arrow {
            position: absolute;
            top: -14px;
            left: 50%;
            margin-left: -8px;
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 14px solid #F15A24;
            filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));
          }
          .avatar-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #F15A24 0%, #FF8C00 100%);
            border: 3px solid white;
            font-size: 26px;
            animation: pulse-avatar 2s infinite;
          }
          @keyframes pulse-avatar {
            0% { box-shadow: 0 0 0 0 rgba(241, 90, 36, 0.7), 0 4px 12px rgba(0,0,0,0.4); }
            70% { box-shadow: 0 0 0 14px rgba(241, 90, 36, 0), 0 4px 12px rgba(0,0,0,0.4); }
            100% { box-shadow: 0 0 0 0 rgba(241, 90, 36, 0), 0 4px 12px rgba(0,0,0,0.4); }
          }
          .user-badge {
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            background: #1E293B;
            color: #FFFFFF;
            font-size: 9px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 8px;
            white-space: nowrap;
            border: 1px solid #F15A24;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          .leaflet-popup-content-wrapper {
            border-radius: 18px;
            padding: 4px;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
          }
          .popup-btn-nav {
            background: #F15A24;
            color: white;
            border: none;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            width: 100%;
            cursor: pointer;
            margin-top: 8px;
            box-shadow: 0 4px 10px rgba(241,90,36,0.35);
          }
          .popup-btn-detail {
            background: #F1F5F9;
            color: #334155;
            border: 1px solid #CBD5E1;
            padding: 8px 14px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            width: 100%;
            cursor: pointer;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const faculties = ${JSON.stringify(FACULTIES)};
          const visitedIds = ${JSON.stringify(visitedFaculties)};
          
          // Center map at KMUTNB campus on init — user marker position updated via postMessage
          const KMUTNB_CENTER = [13.81935, 100.51430];
          const map = L.map('map', { zoomControl: false }).setView(KMUTNB_CENTER, 17);
          L.control.zoom({ position: 'topright' }).addTo(map);

          // Google Maps Tile Layers
          const googleVectorUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
          const googleSatUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

          let currentTileUrl = '${tileMode === 'google_satellite' ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'}';

          let tileLayer = L.tileLayer(currentTileUrl, {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '© Google Maps — KMUTNB Open House'
          }).addTo(map);

          const markers = {};
          let userMarker = null;
          let accuracyCircle = null;
          let polyline = null;

          // Render Teardrop Faculty Building Markers (Pin tip precisely at exact lat/lng)
          faculties.forEach(fac => {
            const isVisited = visitedIds.includes(fac.id);
            const iconHtml = \`
              <div class="custom-pin-wrapper">
                <div class="custom-pin \${isVisited ? 'visited' : ''}" style="background:\${fac.color}">
                  <div class="custom-pin-inner">\${fac.badgeIcon}</div>
                </div>
              </div>
            \`;
            
            const customIcon = L.divIcon({
              html: iconHtml,
              className: '',
              iconSize: [46, 46],
              iconAnchor: [23, 46],
              popupAnchor: [0, -46]
            });

            const marker = L.marker([fac.latitude, fac.longitude], { icon: customIcon }).addTo(map);
            
            const popupContent = \`
              <div style="text-align:center; padding: 6px; min-width: 170px;">
                <div style="font-weight:800; font-size:15px; color:#1E293B;">\${fac.name}</div>
                <div style="font-size:12px; color:#64748B; margin-top:3px;">📍 \${fac.building}</div>
                <div style="font-size:11px; color:#10B981; font-weight:700; margin-top:6px;">🎯 \${fac.activities.length} XP Activities</div>
                <button class="popup-btn-nav" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'START_NAV_DIRECT', facultyId:'\${fac.id}'}))">
                  🧭 Navigate Here 🚶
                </button>
                <button class="popup-btn-detail" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'SELECT_FACULTY', facultyId:'\${fac.id}'}))">
                  ℹ️ View Details
                </button>
              </div>
            \`;

            marker.bindPopup(popupContent);
            markers[fac.id] = marker;
          });

          // Render Live User Avatar Marker & Compass Arrow (100% Automatic device GPS)
          function updateUserMarker(lat, lng, heading, accuracy, avatarIcon) {
            const headingDeg = heading || 0;
            const avatarHtml = \`
              <div class="avatar-pin-container">
                <div class="avatar-heading-arrow" style="transform: rotate(\${headingDeg}deg)"></div>
                <div class="avatar-pin">\${avatarIcon || '🤖'}</div>
                <div class="user-badge">My Location (GPS)</div>
              </div>
            \`;

            const icon = L.divIcon({
              html: avatarHtml,
              className: '',
              iconSize: [54, 54],
              iconAnchor: [27, 27]
            });

            if (userMarker) {
              userMarker.setLatLng([lat, lng]);
              userMarker.setIcon(icon);
            } else {
              userMarker = L.marker([lat, lng], {
                icon: icon,
                zIndexOffset: 1000
              }).addTo(map);
            }

            if (accuracyCircle) {
              accuracyCircle.setLatLng([lat, lng]);
              accuracyCircle.setRadius(accuracy || 10);
            } else {
              accuracyCircle = L.circle([lat, lng], {
                radius: accuracy || 10,
                color: '#F15A24',
                fillColor: '#F15A24',
                fillOpacity: 0.18,
                weight: 1.5
              }).addTo(map);
            }
          }

          // ── OSRM Real Walking Route Engine ────────────────────────────────
          var routeShadow = null;
          var routeCasing = null;
          var routeLine   = null;
          var dotLayer    = null;
          var stepMarkers = [];
          var currentRouteTarget = null;
          var isFetchingRoute = false;

          var routeLoadingEl = document.createElement('div');
          routeLoadingEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(30,41,59,0.9);color:#fff;font-size:13px;font-weight:700;padding:10px 22px;border-radius:20px;display:none;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.35);';
          routeLoadingEl.innerHTML = '🗺️ Calculating route…';
          document.body.appendChild(routeLoadingEl);

          function clearRoute() {
            if (routeShadow) { map.removeLayer(routeShadow); routeShadow = null; }
            if (routeCasing) { map.removeLayer(routeCasing); routeCasing = null; }
            if (routeLine)   { map.removeLayer(routeLine);   routeLine   = null; }
            if (dotLayer)    { map.removeLayer(dotLayer);    dotLayer    = null; }
            stepMarkers.forEach(function(m){ map.removeLayer(m); });
            stepMarkers = [];
            currentRouteTarget = null;
          }

          function drawRoute(coords, steps, shouldFit) {
            clearRoute();
            var latLngs = coords.map(function(c){ return [c[1], c[0]]; });

            routeShadow = L.polyline(latLngs, { color:'#1E293B', weight:14, opacity:0.25, lineCap:'round', lineJoin:'round' }).addTo(map);
            routeCasing = L.polyline(latLngs, { color:'#FFFFFF',  weight:11, opacity:0.95, lineCap:'round', lineJoin:'round' }).addTo(map);
            routeLine   = L.polyline(latLngs, { color:'#F15A24',  weight:7,  opacity:1,    lineCap:'round', lineJoin:'round' }).addTo(map);
            dotLayer    = L.polyline(latLngs, { color:'#FFFFFF',  weight:2,  opacity:0.6,  lineCap:'round', dashArray:'1,16' }).addTo(map);

            if (steps) {
              steps.forEach(function(step, i) {
                if (i === 0 || !step.maneuver || step.maneuver.type === 'arrive') return;
                var loc = step.maneuver.location;
                var mod = step.maneuver.modifier || '';
                var emoji = '⬆️';
                if (mod.indexOf('left')  >= 0) emoji = '↰';
                if (mod.indexOf('right') >= 0) emoji = '↱';
                if (step.maneuver.type === 'roundabout') emoji = '🔄';

                var icon = L.divIcon({
                  html: '<div style="background:#1E293B;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid #F15A24;">' + emoji + '</div>',
                  className: '', iconSize:[28,28], iconAnchor:[14,14]
                });
                var m = L.marker([loc[1], loc[0]], { icon: icon, zIndexOffset: 500 }).addTo(map);
                stepMarkers.push(m);
              });
            }

            if (shouldFit && routeLine) {
              map.fitBounds(routeLine.getBounds(), { padding:[80,80], maxZoom:18 });
            }
          }

          function getStepIcon(m) {
            var mod = m.modifier || '';
            if (mod.indexOf('left')  >= 0) return '↰';
            if (mod.indexOf('right') >= 0) return '↱';
            if (mod.indexOf('uturn') >= 0) return '↩️';
            if (m.type === 'roundabout')   return '🔄';
            return '⬆️';
          }

          function getStepVerb(m) {
            var mod = m.modifier || '';
            if (m.type === 'depart')  return '🚶 Start walking straight';
            if (m.type === 'arrive')  return '🏁 Arrived!';
            if (mod === 'left')       return '↰ Turn left';
            if (mod === 'sharp left') return '↰ Sharp left';
            if (mod === 'slight left')return '↰ Slight left';
            if (mod === 'right')      return '↱ Turn right';
            if (mod === 'sharp right')return '↱ Sharp right';
            if (mod === 'slight right')return '↱ Slight right';
            if (mod === 'uturn')      return '↩️ U-Turn';
            if (m.type === 'roundabout') return '🔄 Enter roundabout';
            return '⬆️ Walk straight';
          }

          function fetchRoute(uLat, uLng, tLat, tLng, shouldFit) {
            if (isFetchingRoute) return;
            isFetchingRoute = true;
            routeLoadingEl.style.display = 'block';
            var url = 'https://router.project-osrm.org/route/v1/foot/' + uLng + ',' + uLat + ';' + tLng + ',' + tLat + '?overview=full&geometries=geojson&steps=true';
            fetch(url)
              .then(function(r){ return r.json(); })
              .then(function(json) {
                if (json.code !== 'Ok' || !json.routes || !json.routes.length) throw new Error('no route');
                var route = json.routes[0];
                var coords = route.geometry.coordinates;
                var steps  = route.legs[0] ? route.legs[0].steps : [];

                var totalDist = Math.round(route.distance);
                var totalMin  = Math.max(1, Math.round(route.duration / 60));
                var stepTexts = steps
                  .filter(function(s){ return s.maneuver.type !== 'arrive' && s.distance > 5; })
                  .map(function(s){
                    return {
                      icon: getStepIcon(s.maneuver),
                      instruction: s.name ? getStepVerb(s.maneuver) + (s.name ? ' → ' + s.name : '') : getStepVerb(s.maneuver),
                      distance: Math.round(s.distance)
                    };
                  });

                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ROUTE_INFO',
                    totalDistance: totalDist,
                    totalTimeMin: totalMin,
                    steps: stepTexts.length > 0 ? stepTexts : null
                  }));
                }
                drawRoute(coords, steps, shouldFit);
                currentRouteTarget = { lat: tLat, lng: tLng };
              })
              .catch(function(err) {
                // Fallback straight line
                var latLngs = [[uLat, uLng],[tLat, tLng]];
                clearRoute();
                routeCasing = L.polyline(latLngs, { color:'#fff', weight:11, opacity:0.9, lineCap:'round', dashArray:'14,10' }).addTo(map);
                routeLine   = L.polyline(latLngs, { color:'#F15A24', weight:7, opacity:1, lineCap:'round', dashArray:'14,10' }).addTo(map);
                if (shouldFit) map.fitBounds(routeLine.getBounds(), { padding:[80,80], maxZoom:18 });
                currentRouteTarget = { lat: tLat, lng: tLng };
              })
              .finally(function() {
                isFetchingRoute = false;
                routeLoadingEl.style.display = 'none';
              });
          }

          function updateRoute(uLat, uLng, tLat, tLng, shouldFit) {
            if (!tLat || !tLng) { clearRoute(); return; }
            var isSame = currentRouteTarget &&
              Math.abs(currentRouteTarget.lat - tLat) < 0.000001 &&
              Math.abs(currentRouteTarget.lng - tLng) < 0.000001;
            if (isSame && routeLine) return; // Same target, don't re-fetch
            fetchRoute(uLat, uLng, tLat, tLng, shouldFit);
          }

          // User marker and route will be set via postMessage after GPS is ready
          // (no static baked coordinates — avoids map reload on GPS update)

          var hasCenteredOnInitialPos = false;

          // Message Handler for Real-Time Updates & Tile Switch
          window.addEventListener('message', function(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'UPDATE_USER_POS') {
                updateUserMarker(data.lat, data.lng, data.heading, data.accuracy, data.avatarIcon);
                if (!hasCenteredOnInitialPos || data.forceCenter) {
                  map.setView([data.lat, data.lng], 18);
                  hasCenteredOnInitialPos = true;
                }
                if (data.targetLat && data.targetLng) {
                  if (data.isInitial) currentRouteTarget = null; // force re-fetch for new nav
                  updateRoute(data.lat, data.lng, data.targetLat, data.targetLng, data.isInitial || false);
                } else {
                  clearRoute();
                }
              } else if (data.type === 'SWITCH_TILE_MODE') {
                var newUrl = data.mode === 'google_satellite' ? googleSatUrl : googleVectorUrl;
                map.removeLayer(tileLayer);
                tileLayer = L.tileLayer(newUrl, { maxZoom: 20 }).addTo(map);
              } else if (data.type === 'CENTER_ON_USER') {
                map.flyTo([data.lat, data.lng], 18.5, { duration: 1 });
              } else if (data.type === 'RECALC_ROUTE') {
                currentRouteTarget = null;
                fetchRoute(data.userLat, data.userLng, data.targetLat, data.targetLng, true);
              }
            } catch(e){}
          });
        </script>
      </body>
    </html>
  `, [tileMode, visitedFaculties]);
  const prevFacultyIdRef = useRef(null);
  const prevLocationModeRef = useRef(null);

  useEffect(() => {
    if (webViewRef.current && tileMode !== 'google_embed' && isMapReady) {
      const isNewTarget = activeNavigator?.facultyId !== prevFacultyIdRef.current;
      const isNewMode = locationMode !== prevLocationModeRef.current;
      prevFacultyIdRef.current = activeNavigator?.facultyId || null;
      prevLocationModeRef.current = locationMode;

      // Force center on first location update or when map just loaded
      const isFirstUpdate = !hasSentInitialPos.current;
      if (isFirstUpdate) hasSentInitialPos.current = true;

      const payload = JSON.stringify({
        type: 'UPDATE_USER_POS',
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        heading: userLocation.heading || 0,
        accuracy: userLocation.accuracy || 10,
        avatarIcon: selectedAvatar.icon,
        targetLat: activeNavigator ? activeNavigator.latitude : null,
        targetLng: activeNavigator ? activeNavigator.longitude : null,
        isInitial: isNewTarget,
        forceCenter: isNewMode || isFirstUpdate,
      });
      webViewRef.current.postMessage(payload);
    }
  }, [userLocation, activeNavigator, selectedAvatar, tileMode, locationMode, isMapReady]);

  // Send initial position once WebView is fully loaded
  const handleMapLoad = () => {
    setIsMapReady(true);
    hasSentInitialPos.current = false; // allow re-center after reload
  };

  const handleSwitchTileMode = (newMode) => {
    setTileMode(newMode);
    if (webViewRef.current && newMode !== 'google_embed') {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'SWITCH_TILE_MODE',
          mode: newMode,
        })
      );
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_FACULTY') {
        const fac = FACULTIES.find((f) => f.id === data.facultyId);
        if (fac && onSelectFaculty) {
          onSelectFaculty(fac);
        }
      } else if (data.type === 'START_NAV_DIRECT') {
        const fac = FACULTIES.find((f) => f.id === data.facultyId);
        if (fac) {
          startNavigation(fac);
        }
      } else if (data.type === 'MANUAL_SET_USER_POS') {
        setUserLocation({
          latitude: data.lat,
          longitude: data.lng,
          heading: 0,
          accuracy: 1,
        });
      } else if (data.type === 'ROUTE_INFO') {
        // OSRM returned real route data — update navigator with real steps & distance
        if (updateNavigatorRoute) {
          updateNavigatorRoute({
            totalDistance: data.totalDistance,
            totalTimeMin: data.totalTimeMin,
            steps: data.steps,
          });
        }
      }
    } catch (e) {
      console.log('Error parsing WebView message:', e);
    }
  };

  const centerOnUser = async () => {
    const latestPos = await refreshCurrentLocation();
    const targetLat = latestPos ? latestPos.latitude : userLocation.latitude;
    const targetLng = latestPos ? latestPos.longitude : userLocation.longitude;

    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'CENTER_ON_USER',
          lat: targetLat,
          lng: targetLng,
        })
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Google Maps HD Map Type Selector */}
      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeTab, tileMode === 'google_vector' && styles.modeTabActive]}
          onPress={() => handleSwitchTileMode('google_vector')}
        >
          <Text style={[styles.modeTabText, tileMode === 'google_vector' && styles.modeTabTextActive]}>
            🗺️ Google Street
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, tileMode === 'google_satellite' && styles.modeTabActive]}
          onPress={() => handleSwitchTileMode('google_satellite')}
        >
          <Text style={[styles.modeTabText, tileMode === 'google_satellite' && styles.modeTabTextActive]}>
            🛰️ Google Satellite
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, tileMode === 'google_embed' && styles.modeTabActive]}
          onPress={() => setTileMode('google_embed')}
        >
          <Text style={[styles.modeTabText, tileMode === 'google_embed' && styles.modeTabTextActive]}>
            📍 Google Embed
          </Text>
        </TouchableOpacity>
      </View>

      {tileMode !== 'google_embed' ? (
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: mapHtml }}
            onMessage={handleMessage}
            onLoad={handleMapLoad}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            allowsInlineMediaPlayback={true}
            allowUniversalAccessFromFileURLs={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F15A24" />
                <Text style={styles.loadingText}>Loading KMUTNB HD Map...</Text>
              </View>
            )}
          />

          {/* Floating Action Controls */}
          <View style={styles.floatingControls}>
            <TouchableOpacity
              style={[styles.locationPillBtn, locationMode === 'auto' && styles.locationPillBtnActive]}
              onPress={setLocationModeAuto}
              activeOpacity={0.8}
            >
              <Text style={[styles.locationPillText, locationMode === 'auto' && styles.locationPillTextActive]}>
                📡 Live GPS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationPillBtn, locationMode === 'campus' && styles.locationPillBtnActive]}
              onPress={resetToCampusLocation}
              activeOpacity={0.8}
            >
              <Text style={[styles.locationPillText, locationMode === 'campus' && styles.locationPillTextActive]}>
                🏫 Front Gate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.recenterBtn} onPress={centerOnUser} activeOpacity={0.8}>
              <Text style={styles.recenterIcon}>{selectedAvatar.icon}</Text>
              <Text style={styles.recenterText}>Recenter</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Direct Embedded Google Maps iFrame Mode */
        <View style={styles.embedContainer}>
          <View style={styles.embedHeader}>
            <Text style={styles.embedTitle}>{selectedFacultyForEmbed.name}</Text>
            <Text style={styles.embedSub}>📍 {selectedFacultyForEmbed.building}</Text>
          </View>
          <WebView
            originWhitelist={['*']}
            source={{ uri: selectedFacultyForEmbed.embedUrl }}
            style={styles.webview}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 8,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#F15A24',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#F15A24',
  },
  recenterIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  recenterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  locationPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  locationPillBtnActive: {
    backgroundColor: '#1E293B',
    borderColor: '#F15A24',
  },
  locationPillText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  locationPillTextActive: {
    color: '#FFFFFF',
  },
  embedContainer: {
    flex: 1,
  },
  embedHeader: {
    backgroundColor: '#1E293B',
    padding: 12,
  },
  embedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  embedSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
