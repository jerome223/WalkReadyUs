import React, { useEffect, useRef, useState } from 'react';
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
//import { fetchAndParseCSV } from './CsvParse';
import { fetchNearbyUtilities } from './FetchNearby';


function App() {
  const [position, setPosition] = useState([45.5017, -73.5673]); // Montreal's coordinates as default
  const [address, setAddress] = useState('2500 Chem. de Polytechnique, Montréal, QC H3T 1J4, Canada');
  const autocompleteInput = useRef(null);
  let autocomplete = null;
  const [time, setTime] = useState('15'); // New state for time in minutes
  const [isochrone, setIsochrone] = useState([]);
  const [insidePoints, setInsidePoints] = useState({
    library: [],
    hospital: [],
    park: [],
    pharmacy: [],
    restaurant: [],
    supermarket: []
  });
  const [checkboxStates, setCheckboxStates] = useState({
    Bibliotheques: false,
    CentresMedicaux: false,
    Parcs: false,
    Pharmacies: false,
    Restaurants: false,
    Epiceries: false
  });
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const handleCheckboxChange = (option) => (e) => {
  setCheckboxStates({ ...checkboxStates, [option]: e.target.checked });
  };
  
  const updatePosition = (lat, lng) => {
    setPosition([lat, lng]);
  };

  // Replace this function with Google's API for places
  const fetchAndSetPointsForCategory = async (category, origin, shapes) => { 
    //console.log(origin, origin.lat, origin.lng);
    try{
    const dist = 60*parseInt(time, 10);
    const points = await fetchNearbyUtilities(origin.lat, origin.lng, dist, category); // distance should be 100m x time in minutes
    console.log(points, category, dist);
    const insidePoints = points.filter(point => 
      isPointInsidePolygon([point.lat, point.lng], shapes)
    );
    console.log(insidePoints);
    setInsidePoints(prevState => ({ ...prevState, [category]: insidePoints }));
    }catch (error){
      console.error(`Error fetching ${category}:`, error);
    }
  };
  
  useEffect(() => {
    autocomplete = new window.google.maps.places.Autocomplete(autocompleteInput.current,
      {types: ['geocode']});

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      setAddress(place.formatted_address);
    });
  }, []);

  const searchAddress = async () => {
    const addressUri = encodeURIComponent(address);
    //console.log("address", address, "addressUri", addressUri);
    console.log(apiKey);
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressUri}&key=AIzaSyAu05yaHnhqM-q45v0WsRj_mOgz_KGyS2s`; //to make secret later
    try {
      const geoResponse = await axios.get(geocodingUrl);
      const geoData = geoResponse.data;
      
      if (geoData.results && geoData.results.length > 0) {
        const { lat, lng } = geoData.results[0].geometry.location;
        //console.log(lat, lng);
        updatePosition(parseFloat(lat), parseFloat(lng));
        //console.log(lat, lon);
        // Ensure the time is correctly parsed as an integer

        const data = await getTravelTimeData(parseFloat(lat), parseFloat(lng), parseInt(time, 10));
 
          if (data && data.results && data.results[0].shapes) 
            {
              const isochroneShapes = data.results[0].shapes.map(shape => shape.shell);
              setIsochrone(isochroneShapes);

          
              if (isochroneShapes.length > 0) { // Ensure isochroneShapes is not empty
                try{
                  await fetchAndSetPointsForCategory('hospital', { lat, lng }, isochroneShapes[0]);
                  await fetchAndSetPointsForCategory('restaurant', { lat, lng }, isochroneShapes[0]);
                  await fetchAndSetPointsForCategory('supermarket', { lat, lng }, isochroneShapes[0]);
                  await fetchAndSetPointsForCategory('park', { lat, lng }, isochroneShapes[0]);
                  await fetchAndSetPointsForCategory('pharmacy', { lat, lng }, isochroneShapes[0]);
                  await fetchAndSetPointsForCategory('library', { lat, lng }, isochroneShapes[0]);
                } catch(error){
                  console.error('Error fetching points for category:', error);
                              }
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
        ref={autocompleteInput}
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
      
      {checkboxStates.Bibliotheques && insidePoints.library.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={comMarkerIcon}>
          <Popup>{point.name}</Popup>
        </Marker>
      ))}

      {checkboxStates.CentresMedicaux && insidePoints.hospital.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={medMarkerIcon}>
          <Popup>{point.name}</Popup>
        </Marker>
      ))}

      {checkboxStates.Parcs && insidePoints.park.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={parcMarkerIcon}>
          <Popup>{point.name}</Popup>
        </Marker>
      ))}

      {checkboxStates.Pharmacies && insidePoints.pharmacy.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={pharmMarkerIcon}>
          <Popup>{point.name}</Popup>
        </Marker>
      ))}

      {checkboxStates.Restaurants && insidePoints.restaurant.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={restoMarkerIcon}>
          <Popup>{point.name}<br /></Popup>
        </Marker>
      ))}

      {checkboxStates.Epiceries && insidePoints.supermarket.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]} icon={epiceMarkerIcon}>
          <Popup>{point.name}</Popup>
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