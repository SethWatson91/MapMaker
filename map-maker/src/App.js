import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'; // Add useMapEvents
import 'leaflet/dist/leaflet.css';
import './App.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function App() {
  const [maps, setMaps] = useState([]);
  const [newMarker, setNewMarker] = useState({ lat: 51.505, lng: -0.09, name: '' });
  const [mapName, setMapName] = useState('');
  const [localMarkers, setLocalMarkers] = useState([]);

  useEffect(() => {
    fetch('https://localhost:5001/api/maps/test', { mode: 'cors' })
      .then(response => response.json())
      .then(data => setMaps(data))
      .catch(error => console.error('Error fetching maps:', error));
  }, []);

  // Component to handle map events
  const MapEvents = () => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        const marker = {
          lat,
          lng,
          name: newMarker.name || 'New Marker'
        };
        setLocalMarkers([...localMarkers, marker]); // Add marker directly on click
        setNewMarker({ lat, lng, name: '' }); // Update inputs for manual entry
      },
    });
    return null;
  };

  const handleAddMarkerManually = () => {
    const marker = {
      lat: newMarker.lat,
      lng: newMarker.lng,
      name: newMarker.name || 'New Marker'
    };
    setLocalMarkers([...localMarkers, marker]);
    setNewMarker({ lat: 51.505, lng: -0.09, name: '' });
  };

  const handleSaveMap = () => {
    if (!mapName) {
      alert('Please enter a map name.');
      return;
    }

    const newMap = {
      id: `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: mapName,
      layers: localMarkers,
      creator: 'user123'
    };

    console.log('Saving map - Request Data:', newMap);

    fetch('https://localhost:5001/api/maps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMap),
      mode: 'cors'
    })
      .then(response => {
        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Failed to save map: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then(savedMap => {
        console.log('Saved Map Response:', savedMap);
        setMaps([...maps, savedMap]);
        setLocalMarkers([]);
        setMapName('');
        alert('Map saved successfully!');
      })
      .catch(error => {
        console.error('Error saving map:', error.message);
        alert('Failed to save map: ' + error.message);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Map Maker</h1>
      <div style={{ marginBottom: '20px' }}>
        <h3>Create a New Map</h3>
        <input
          type="text"
          placeholder="Map Name"
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <h4>Add Markers (Click on the map or enter manually)</h4>
        <input
          type="text"
          placeholder="Marker Name"
          value={newMarker.name}
          onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={newMarker.lat}
          onChange={(e) => setNewMarker({ ...newMarker, lat: parseFloat(e.target.value) })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={newMarker.lng}
          onChange={(e) => setNewMarker({ ...newMarker, lng: parseFloat(e.target.value) })}
          style={{ marginRight: '10px' }}
        />
        <button onClick={handleAddMarkerManually} style={{ marginRight: '10px' }}>
          Add Marker Manually
        </button>
        <button onClick={handleSaveMap}>Save Map</button>
      </div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        doubleClickZoom={false} // Disable double-click zooming (optional)
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapEvents /> {/* Add the MapEvents component */}
        {maps.flatMap(map =>
          Array.isArray(map.layers)
            ? map.layers.map((layer, index) => (
                <Marker key={`${map.id}-${index}`} position={[layer.lat, layer.lng]}>
                  <Popup>{layer.name}</Popup>
                </Marker>
              ))
            : []
        )}
        {localMarkers.map((marker, index) => (
          <Marker key={`local-${index}`} position={[marker.lat, marker.lng]}>
            <Popup>{marker.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;