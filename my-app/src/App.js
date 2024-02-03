import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import logo from './logo.svg'; // You can remove this if not using the logo
import './App.css';

function App() {
  const [position, setPosition] = useState([45.5017, -73.5673]); // Montreal's coordinates as default
  const [address, setAddress] = useState('');

  const updatePosition = (lat, lng) => {
    setPosition([lat, lng]);
  };

  const searchAddress = async () => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      updatePosition(parseFloat(lat), parseFloat(lon));
    } else {
      alert('Address not found!');
    }
  };


  return (
    <div className="App">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter an address"
      />
      <button onClick={searchAddress}>Search</button>
      <MapView position={position} />
    </div>
  );
}

const MapView = ({ position }) => {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default App;