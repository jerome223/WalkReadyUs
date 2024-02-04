import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { getTravelTimeData } from './TravelTime';
import axios from 'axios';
import { Polygon } from 'react-leaflet';
import L from 'leaflet';
import pinIcon from './pin.png';
import comIcon from './com.png';
import medIcon from './med.png';
import epiceIcon from './epice.png';
import pharmIcon from './pharm.png';
import restoIcon from './resto.png';
import parcIcon from './parc.png';
import { isPointInsidePolygon } from './VerifyInside';
import { fetchAndParseCSV } from './CsvParse'; 


function App() {
  const [position, setPosition] = useState([45.5017, -73.5673]); // Montreal's coordinates as default
  const [address, setAddress] = useState('2500 Polytechnique');
  const [time, setTime] = useState('15'); // New state for time in minutes
  const [isochrone, setIsochrone] = useState([]);
  const [insidePoints, setInsidePoints] = useState({
    com: [],
    med: [],
    parc: [],
    pharmacie: [],
    resto: [],
    epicerie: []
  });
  const [checkboxStates, setCheckboxStates] = useState({
    CentresCommunautaires: false,
    ServicesMedicaux: false,
    Parcs: false,
    Pharmacies: false,
    Restaurants: false,
    Epiceries: false
  });
  
  
  
  const handleCheckboxChange = (option) => (e) => {
  setCheckboxStates({ ...checkboxStates, [option]: e.target.checked });
  };
  
  const updatePosition = (lat, lng) => {
    setPosition([lat, lng]);
  };

  const fetchAndSetPointsForCategory = async (category, csvFilePath, shapes) => {
    const points = await fetchAndParseCSV(csvFilePath);
    const insidePoints = points.filter(point => 
      isPointInsidePolygon([point.lat, point.lng], shapes)
    );
    console.log(category, insidePoints);
    setInsidePoints(prevState => ({ ...prevState, [category]: insidePoints }));
  };
  

  const searchAddress = async () => {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${address}`;
    try {
      const geoResponse = await axios.get(geocodingUrl);
      const geoData = geoResponse.data;
      //console.log(geoData);
      if (geoData && geoData.length > 0) {
        const { lat, lon } = geoData[0];
        updatePosition(parseFloat(lat), parseFloat(lon));
        console.log(lat, lon);
        // Ensure the time is correctly parsed as an integer
        //lng = lon;
        const data = await getTravelTimeData(parseFloat(lat), parseFloat(lon), parseInt(time, 10));
        //console.log(data);
          if (data && data.results && data.results[0].shapes) 
            {
              const isochroneShapes = data.results[0].shapes.map(shape => shape.shell);
              setIsochrone(isochroneShapes);

          
              if (isochroneShapes.length > 0) { // Ensure isochroneShapes is not empty
                fetchAndSetPointsForCategory('com', './com.csv', isochroneShapes[0]);
                fetchAndSetPointsForCategory('med', './med.csv', isochroneShapes[0]);
                fetchAndSetPointsForCategory('parc', './parc.csv', isochroneShapes[0]);
                fetchAndSetPointsForCategory('pharmacie', './pharmacie.csv', isochroneShapes[0]);
                fetchAndSetPointsForCategory('resto', './resto.csv', isochroneShapes[0]);
                fetchAndSetPointsForCategory('epicerie', './epicerie.csv', isochroneShapes[0]);
                
                //checkPointsInsideIsochrone();
              }
            }
        } 
        else {
              alert('Address not found!');
             }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to search the address or get travel time data.');
    }
  };
  
  return (
    <div className="App">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Ton adresse icitte"
      />
       <input
        type="number" // Ensures only numbers can be entered
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="Temps de marche en minutes"
      />
      <button onClick={searchAddress}>Chercher</button>

          {/* Adding checkboxes */}
          <div>
              {Object.keys(checkboxStates).map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={checkboxStates[option]}
                    onChange={handleCheckboxChange(option)}
                  /> {option.replace('option', 'Option ')}
                </label>
              ))}
          </div>



      <MapView 
        address={address}
        position={position} 
        isochrone={isochrone} 
        insidePoints={insidePoints} 
        checkboxStates={checkboxStates}/>
    </div>
  );
}

function MapUpdater({ position }) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return null; // This component does not render anything itself.
}

const customIcon = new L.Icon({
  iconUrl: pinIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const comMarkerIcon = new L.Icon({
  iconUrl: comIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const medMarkerIcon = new L.Icon({
  iconUrl: medIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const parcMarkerIcon = new L.Icon({
  iconUrl: parcIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const pharmMarkerIcon = new L.Icon({
  iconUrl: pharmIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const epiceMarkerIcon = new L.Icon({
  iconUrl: epiceIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const restoMarkerIcon = new L.Icon({
  iconUrl: restoIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});


const MapView = ({ address, position, isochrone, insidePoints, checkboxStates }) => {
  return (
    <MapContainer center={position} zoom={14} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
        {address} <br/> We know where you live now.
        </Popup>
      </Marker>
      
      {checkboxStates.CentresCommunautaires && insidePoints.com.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={comMarkerIcon}>
          <Popup>Centre communautaire</Popup>
        </Marker>
      ))}

      {checkboxStates.ServicesMedicaux && insidePoints.med.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={medMarkerIcon}>
          <Popup>Service médical</Popup>
        </Marker>
      ))}

      {checkboxStates.Parcs && insidePoints.parc.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={parcMarkerIcon}>
          <Popup>Parc</Popup>
        </Marker>
      ))}

      {checkboxStates.Pharmacies && insidePoints.pharmacie.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={pharmMarkerIcon}>
          <Popup>Pharmacie</Popup>
        </Marker>
      ))}

      {checkboxStates.Restaurants && insidePoints.resto.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={restoMarkerIcon}>
          <Popup>Restaurant</Popup>
        </Marker>
      ))}

      {checkboxStates.Epiceries && insidePoints.epicerie.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={epiceMarkerIcon}>
          <Popup>Épicerie</Popup>
        </Marker>
      ))}

      {isochrone.map((area, index) => (
        <Polygon key={index} positions={area} color="blue" fillOpacity={0.3} />
      ))}
      <MapUpdater position={position} />
    </MapContainer>
  );
};

export default App;