import React, { useEffect, useRef, useState } from 'react';

interface VarInteractiveMapProps {
  lat: number;
  lon: number;
  weatherData?: any;
  soilData?: any;
  satelliteImages?: { url: string; date: string; type: string; }[];
  onLandDrawn?: (landData: {
    area: number;
    perimeter: number;
    coordinates: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
  }) => void;
}

// Map theme configurations
const mapThemes = {
  openstreetmap: {
    name: 'خريطة الشارع',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'صور الأقمار الصناعية',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    name: 'خريطة التضاريس',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors'
  },
  dark: {
    name: 'الخريطة المظلمة',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  },
  agricultural: {
    name: 'خريطة زراعية',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

// Helper function to calculate geodesic distance between two points
const calculateGeodesicDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Helper function to calculate accurate area using geodesic formula
const calculateGeodesicArea = (coordinates: Array<{ lat: number; lng: number }>): number => {
  if (coordinates.length < 3) return 0;
  
  let area = 0;
  const R = 6371000; // Earth's radius in meters
  
  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length;
    const lat1 = coordinates[i].lat * Math.PI / 180;
    const lon1 = coordinates[i].lng * Math.PI / 180;
    const lat2 = coordinates[j].lat * Math.PI / 180;
    const lon2 = coordinates[j].lng * Math.PI / 180;
    
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs(area * R * R / 2);
  return area; // Area in square meters
};

// Helper function to calculate accurate perimeter using geodesic distances
const calculateGeodesicPerimeter = (coordinates: Array<{ lat: number; lng: number }>): number => {
  if (coordinates.length < 2) return 0;
  
  let perimeter = 0;
  
  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];
    
    perimeter += calculateGeodesicDistance(
      current.lat, current.lng,
      next.lat, next.lng
    );
  }
  
  return perimeter; // Perimeter in meters
};

// Helper function to validate and clean coordinates
const validateCoordinates = (coordinates: Array<{ lat: number; lng: number }>): Array<{ lat: number; lng: number }> => {
  return coordinates.filter(coord => {
    return coord.lat >= -90 && coord.lat <= 90 && 
           coord.lng >= -180 && coord.lng <= 180 &&
           !isNaN(coord.lat) && !isNaN(coord.lng);
  });
};

// Helper function to calculate center point of coordinates
const calculateCenter = (coordinates: Array<{ lat: number; lng: number }>): { lat: number; lng: number } => {
  if (coordinates.length === 0) return { lat: 0, lng: 0 };
  
  const validCoords = validateCoordinates(coordinates);
  if (validCoords.length === 0) return { lat: 0, lng: 0 };
  
  const sumLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
  const sumLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
  
  return {
    lat: sumLat / validCoords.length,
    lng: sumLng / validCoords.length
  };
};

const VarInteractiveMap: React.FC<VarInteractiveMapProps> = ({ 
  lat, 
  lon, 
  weatherData, 
  soilData, 
  satelliteImages,
  onLandDrawn 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [drawnAreas, setDrawnAreas] = useState<any[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('openstreetmap');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Helper function to calculate accurate area and perimeter
  const calculateAreaAndPerimeter = (layer: any, L: any) => {
    let area = 0;
    let perimeter = 0;
    let coordinates: Array<{ lat: number; lng: number }> = [];

    try {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0];
        
        // Convert to our coordinate format and validate
        coordinates = validateCoordinates(latlngs.map((latlng: any) => ({
          lat: latlng.lat,
          lng: latlng.lng
        })));
        
        if (coordinates.length < 3) {
          console.warn('Invalid polygon: insufficient valid coordinates');
          return { area: 1000, perimeter: 100, coordinates: [{ lat: 0, lng: 0 }] };
        }
        
        // Calculate area using our geodesic formula
        area = calculateGeodesicArea(coordinates);
        
        // Calculate perimeter using our geodesic formula
        perimeter = calculateGeodesicPerimeter(coordinates);
        
        console.log('Polygon calculation (geodesic):', { 
          area: area / 10000, // Convert to hectares
          perimeter, 
          points: coordinates.length,
          coordinates: coordinates.slice(0, 3) // Log first 3 points for debugging
        });
        
      } else if (layer instanceof L.Rectangle) {
        const bounds = layer.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        
        // Create proper polygon coordinates for rectangle and validate
        coordinates = validateCoordinates([
          { lat: sw.lat, lng: sw.lng },
          { lat: sw.lat, lng: ne.lng },
          { lat: ne.lat, lng: ne.lng },
          { lat: ne.lat, lng: sw.lng }
        ]);
        
        if (coordinates.length < 3) {
          console.warn('Invalid rectangle: insufficient valid coordinates');
          return { area: 1000, perimeter: 100, coordinates: [{ lat: 0, lng: 0 }] };
        }
        
        // Calculate area using our geodesic formula
        area = calculateGeodesicArea(coordinates);
        
        // Calculate perimeter using our geodesic formula
        perimeter = calculateGeodesicPerimeter(coordinates);
        
        console.log('Rectangle calculation (geodesic):', { 
          area: area / 10000, // Convert to hectares
          perimeter, 
          bounds: { sw, ne },
          coordinates
        });
        
      } else if (layer instanceof L.Circle) {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        
        // Validate center coordinates
        if (!validateCoordinates([{ lat: center.lat, lng: center.lng }]).length) {
          console.warn('Invalid circle center coordinates');
          return { area: 1000, perimeter: 100, coordinates: [{ lat: 0, lng: 0 }] };
        }
        
        // For circles, we can use the standard formulas but need to account for Earth's curvature
        // Calculate the actual geodesic radius using a more accurate method
        const geodesicRadius = calculateGeodesicDistance(
          center.lat, center.lng,
          center.lat + (radius / 111320), // Approximate conversion to degrees
          center.lng
        );
        
        // Calculate area using πr² formula with geodesic radius
        area = Math.PI * geodesicRadius * geodesicRadius;
        
        // Calculate perimeter using 2πr formula with geodesic radius
        perimeter = 2 * Math.PI * geodesicRadius;
        
        coordinates = [{
          lat: center.lat,
          lng: center.lng
        }];
        
        console.log('Circle calculation (geodesic):', { 
          area: area / 10000, // Convert to hectares
          perimeter, 
          radius: geodesicRadius, 
          center,
          originalRadius: radius
        });
      }

      // Ensure we have valid values
      if (isNaN(area) || area <= 0) {
        console.warn('Invalid area calculated, using fallback');
        area = 1000; // Default 0.1 hectare
      }
      if (isNaN(perimeter) || perimeter <= 0) {
        console.warn('Invalid perimeter calculated, using fallback');
        perimeter = 100; // Default 100 meters
      }
      
      return { area, perimeter, coordinates };
    } catch (error) {
      console.error('Error calculating area/perimeter:', error);
      return { area: 1000, perimeter: 100, coordinates: [{ lat: 0, lng: 0 }] };
    }
  };

  // Function to initialize drawing controls
  const initDrawingControls = (L: any, map: any, setDrawnAreasFn: React.Dispatch<React.SetStateAction<any[]>>) => {
    // Initialize drawing controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Drawing controls
    const drawControl = new (L as any).Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>خطأ في الرسم</strong> لا يمكن رسم المضلعات المتقاطعة'
          },
          shapeOptions: {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.3
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.3
          }
        },
        circle: {
          shapeOptions: {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.3
          }
        },
        marker: false,
        polyline: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Handle drawing events
    map.on('draw:created', (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);

      // Use the helper function for accurate calculations
      const { area, perimeter, coordinates } = calculateAreaAndPerimeter(layer, L);

      // Convert area to hectares (1 hectare = 10,000 square meters)
      const areaInHectares = area / 10000;
      const perimeterInMeters = perimeter;

      // Add popup with measurements
      const popupContent = `
        <div dir="rtl" style="text-align: right;">
          <h4 style="margin: 0 0 10px 0; color: #2E8B57;">معلومات الأرض</h4>
          <p><strong>المساحة:</strong> ${areaInHectares.toFixed(2)} هكتار</p>
          <p><strong>المحيط:</strong> ${perimeterInMeters.toFixed(0)} متر</p>
          <p><strong>عدد النقاط:</strong> ${coordinates.length}</p>
          <button onclick="exportCoordinates()" style="background: #2E8B57; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            تصدير الإحداثيات
          </button>
        </div>
      `;

      layer.bindPopup(popupContent);

      // Store drawn area data
      const landData = {
        area: areaInHectares,
        perimeter: perimeterInMeters,
        coordinates: coordinates,
        center: layer.getBounds ? layer.getBounds().getCenter() : calculateCenter(coordinates),
        layer: layer
      };

      console.log('Drawn land data:', landData);
      setDrawnAreasFn(prev => [...prev, landData]);

      // Call callback if provided
      if (onLandDrawn) {
        console.log('Calling onLandDrawn callback');
        onLandDrawn(landData);
      }

      // Add export function to window
      (window as any).exportCoordinates = () => {
        const dataStr = JSON.stringify(coordinates, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'land_coordinates.json';
        link.click();
        URL.revokeObjectURL(url);
      };
    });

    // Handle edit events
    map.on('draw:edited', (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        // Use the helper function for accurate calculations
        const { area, perimeter, coordinates } = calculateAreaAndPerimeter(layer, L);

        const areaInHectares = area / 10000;
        const perimeterInMeters = perimeter;

        // Update popup content
        const popupContent = `
          <div dir="rtl" style="text-align: right;">
            <h4 style="margin: 0 0 10px 0; color: #2E8B57;">معلومات الأرض (محدثة)</h4>
            <p><strong>المساحة:</strong> ${areaInHectares.toFixed(2)} هكتار</p>
            <p><strong>المحيط:</strong> ${perimeterInMeters.toFixed(0)} متر</p>
            <p><strong>عدد النقاط:</strong> ${coordinates.length}</p>
            <button onclick="exportCoordinates()" style="background: #2E8B57; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              تصدير الإحداثيات
            </button>
          </div>
        `;

        layer.setPopupContent(popupContent);
      });
    });

    // Handle delete events
    map.on('draw:deleted', (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        // Remove from drawn areas state
        setDrawnAreasFn(prev => prev.filter((area: any) => area.layer !== layer));
      });
    });
  };

  // Function to change map theme
  const changeMapTheme = (themeKey: string, L: any, map: any) => {
    if (mapInstanceRef.current && mapThemes[themeKey as keyof typeof mapThemes]) {
      const theme = mapThemes[themeKey as keyof typeof mapThemes];
      
      // Remove existing tile layer
      if (mapInstanceRef.current.hasLayer(mapInstanceRef.current._tileLayer)) {
        mapInstanceRef.current.removeLayer(mapInstanceRef.current._tileLayer);
      }
      
      // Add new tile layer
      const newTileLayer = L.tileLayer(theme.url, {
        attribution: theme.attribution
      });
      
      newTileLayer.addTo(mapInstanceRef.current);
      mapInstanceRef.current._tileLayer = newTileLayer;
      setCurrentTheme(themeKey);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Dynamically import leaflet only on client side
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Add leaflet CSS dynamically
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Add Leaflet.draw CSS
        if (!document.querySelector('link[href*="leaflet.draw"]')) {
          const drawLink = document.createElement('link');
          drawLink.rel = 'stylesheet';
          drawLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
          document.head.appendChild(drawLink);
        }
        
        // Create new map instance and store reference
        const map = L.map(mapRef.current!).setView([lat, lon], 10);
        mapInstanceRef.current = map;

        // Add initial tile layer
        const initialTheme = mapThemes[currentTheme as keyof typeof mapThemes];
        const tileLayer = L.tileLayer(initialTheme.url, {
          attribution: initialTheme.attribution
        }).addTo(map);
        map._tileLayer = tileLayer;

        // Weather marker
        if (weatherData) {
          L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>الطقس</b><br/>درجة الحرارة: ${weatherData.temperature}°C<br/>الرطوبة: ${weatherData.humidity}%<br/>الأمطار: ${weatherData.rainfall}mm`)
            .openPopup();
        }

        // Soil marker
        if (soilData) {
          L.circle([lat, lon], {
            color: 'brown',
            fillColor: '#a0522d',
            fillOpacity: 0.4,
            radius: 2000
          })
            .addTo(map)
            .bindPopup(`<b>التربة</b><br/>pH: ${soilData.ph}<br/>الرطوبة: ${soilData.moisture}%`);
        }

        // Satellite overlays
        if (satelliteImages && satelliteImages.length > 0) {
          satelliteImages.forEach(img => {
            if (img.type === 'ndvi' || img.type === 'rgb') {
              L.marker([lat + Math.random() * 0.05, lon + Math.random() * 0.05])
                .addTo(map)
                .bindPopup(`<b>${img.type.toUpperCase()} صورة</b><br/><img src='${img.url}' style='width:100px;height:auto' /><br/>${img.date}`);
            }
          });
        }

        // Load Leaflet.draw JavaScript and initialize drawing controls
        if (!(window as any).L?.Control?.Draw) {
          const drawScript = document.createElement('script');
          drawScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
          drawScript.onload = () => {
            // Initialize drawing controls after script loads
            initDrawingControls(L, map, setDrawnAreas);
          };
          document.head.appendChild(drawScript);
        } else {
          // Initialize drawing controls immediately if already loaded
          initDrawingControls(L, map, setDrawnAreas);
        }

        // Add theme selector control - Ultra mobile optimized
        const themeControl = L.control({ position: 'topright' });
        themeControl.onAdd = function() {
          const div = L.DomUtil.create('div', 'theme-selector');
          div.innerHTML = `
            <div style="background: white; padding: 4px 6px; border-radius: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-size: 9px; min-width: 90px; max-width: 110px;">
              <h4 style="margin: 0 0 2px 0; color: #2E8B57; font-size: 9px;">الخريطة</h4>
              <select id="theme-select" style="width: 100%; padding: 1px 2px; border: 1px solid #ccc; border-radius: 2px; font-size: 8px;">
                ${Object.entries(mapThemes).map(([key, theme]) => 
                  `<option value="${key}" ${key === currentTheme ? 'selected' : ''}>${theme.name}</option>`
                ).join('')}
              </select>
            </div>
          `;
          
          // Add event listener for theme change
          setTimeout(() => {
            const select = div.querySelector('#theme-select') as HTMLSelectElement;
            if (select) {
              select.addEventListener('change', (e) => {
                const target = e.target as HTMLSelectElement;
                changeMapTheme(target.value, L, map);
              });
            }
          }, 100);
          
          return div;
        };
        themeControl.addTo(map);

        // Add compact drawing instructions - Ultra mobile optimized
        const instructions = L.control({ position: 'topright' });
        instructions.onAdd = function() {
          const div = L.DomUtil.create('div', 'drawing-instructions');
          div.innerHTML = `
            <div style="background: white; padding: 4px 6px; border-radius: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-size: 9px; max-width: 100px; margin-top: 4px;">
              <h4 style="margin: 0 0 2px 0; color: #2E8B57; font-size: 9px;">تعليمات</h4>
              <p style="margin: 0; font-size: 8px;">• ارسم الأرض</p>
              <p style="margin: 0; font-size: 8px;">• ستظهر المساحة</p>
            </div>
          `;
          return div;
        };
        instructions.addTo(map);

        // Add minimal summary - Ultra mobile optimized
        const summary = L.control({ position: 'bottomright' });
        summary.onAdd = function() {
          const div = L.DomUtil.create('div', 'drawn-areas-summary');
          div.innerHTML = `
            <div style="background: white; padding: 4px 6px; border-radius: 3px; box-shadow: 0 1px 4px rgba(0,0,0,0.2); font-size: 9px;">
              <h4 style="margin: 0 0 2px 0; color: #2E8B57; font-size: 9px;">الأراضي</h4>
              <p style="margin: 0; font-size: 8px;">عدد: <span id="drawn-count">0</span></p>
              <p style="margin: 0; font-size: 8px;">مساحة: <span id="total-area">0</span> هكتار</p>
            </div>
          `;
          return div;
        };
        summary.addTo(map);

        // Update summary when areas are drawn
        const updateSummary = () => {
          const countElement = document.getElementById('drawn-count');
          const areaElement = document.getElementById('total-area');
          if (countElement && areaElement) {
            // We can't access drawnAreas here, so we'll just set initial values
            countElement.textContent = '0';
            areaElement.textContent = '0.00';
          }
        };

        // Update summary initially
        updateSummary();

        // Add ultra-responsive CSS for map controls
        const style = document.createElement('style');
        style.textContent = `
          .theme-selector, .drawing-instructions, .drawn-areas-summary {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: all 0.3s ease;
          }
          
          @media (max-width: 768px) {
            .theme-selector div, .drawing-instructions div, .drawn-areas-summary div {
              padding: 3px 4px !important;
              font-size: 7px !important;
              min-width: 70px !important;
              max-width: 90px !important;
            }
            
            .theme-selector h4, .drawing-instructions h4, .drawn-areas-summary h4 {
              font-size: 7px !important;
              margin-bottom: 1px !important;
            }
            
            .theme-selector p, .drawing-instructions p, .drawn-areas-summary p {
              font-size: 6px !important;
              margin-bottom: 0px !important;
            }
            
            .theme-selector select {
              font-size: 6px !important;
              padding: 0px 1px !important;
            }
          }
          
          @media (max-width: 480px) {
            .theme-selector div, .drawing-instructions div, .drawn-areas-summary div {
              padding: 2px 3px !important;
              font-size: 6px !important;
              min-width: 60px !important;
              max-width: 75px !important;
            }
            
            .theme-selector h4, .drawing-instructions h4, .drawn-areas-summary h4 {
              font-size: 6px !important;
              margin-bottom: 1px !important;
            }
            
            .theme-selector p, .drawing-instructions p, .drawn-areas-summary p {
              font-size: 5px !important;
              margin-bottom: 0px !important;
            }
            
            .theme-selector select {
              font-size: 5px !important;
              padding: 0px !important;
            }
          }
          
          @media (max-width: 360px) {
            .theme-selector div, .drawing-instructions div, .drawn-areas-summary div {
              padding: 1px 2px !important;
              font-size: 5px !important;
              min-width: 50px !important;
              max-width: 65px !important;
            }
            
            .theme-selector h4, .drawing-instructions h4, .drawn-areas-summary h4 {
              font-size: 5px !important;
              margin-bottom: 0px !important;
            }
            
            .theme-selector p, .drawing-instructions p, .drawn-areas-summary p {
              font-size: 4px !important;
              margin-bottom: 0px !important;
            }
            
            .theme-selector select {
              font-size: 4px !important;
              padding: 0px !important;
            }
          }
          
          /* Hide controls on very small screens and show toggle button */
          @media (max-width: 320px) {
            .theme-selector, .drawing-instructions, .drawn-areas-summary {
              display: none !important;
            }
          }
        `;
        document.head.appendChild(style);

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, lat, lon, weatherData, soilData, satelliteImages, onLandDrawn, drawnAreas, currentTheme]);

  // Update summary when drawnAreas changes
  useEffect(() => {
    const updateSummary = () => {
      const countElement = document.getElementById('drawn-count');
      const areaElement = document.getElementById('total-area');
      if (countElement && areaElement) {
        countElement.textContent = drawnAreas.length.toString();
        const totalArea = drawnAreas.reduce((sum: number, area: any) => sum + area.area, 0);
        areaElement.textContent = totalArea.toFixed(2);
      }
    };

    // Update summary after a short delay to ensure DOM elements are ready
    const timeoutId = setTimeout(updateSummary, 100);
    return () => clearTimeout(timeoutId);
  }, [drawnAreas]);

  if (!isClient) {
    return <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg"></div>;
  }

  return (
    <div className="relative w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full"></div>
      
      {/* Drawing mode indicator - Ultra mobile optimized */}
      {isDrawingMode && (
        <div className="absolute top-1 left-1 md:top-4 md:left-4 bg-emerald-500 text-white px-1 py-0.5 md:px-4 md:py-2 rounded text-xs md:text-sm">
          وضع الرسم نشط
        </div>
      )}
      
      {/* Instructions overlay - Hidden on mobile to save space */}
      <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-black/70 backdrop-blur-sm p-2 md:p-4 rounded-xl shadow-lg max-w-[150px] md:max-w-xs text-xs md:text-sm hidden md:block border border-white/20">
        <h4 className="text-xs md:text-sm font-bold text-green-400 mb-1 md:mb-2">تعليمات الرسم</h4>
        <ul className="text-xs text-gray-300 space-y-0.5 md:space-y-1">
          <li>• استخدم أدوات الرسم</li>
          <li>• ارسم حدود الأرض</li>
          <li>• ستظهر المساحة تلقائياً</li>
          <li>• يمكنك تعديل الأشكال</li>
        </ul>
      </div>
    </div>
  );
};

export default VarInteractiveMap;
