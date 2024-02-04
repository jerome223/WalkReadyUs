import axios from 'axios';

// Function to get reachable area (isochrone) based on walking time
export const getTravelTimeData = async (lat, lng, time) => {
   // console.log("getTravelTimeData called", { lat, lng, time });
    const url = 'https://api.traveltimeapp.com/v4/time-map';
    const config = {
        headers: {
        'X-Application-Id': '26a91fc8',
        'X-Api-Key': '61dc709a75f4921509709916664fa4ba',
        'Content-Type': 'application/json',
      },
    };
    const body = {
        "departure_searches": [{
          "id": "isochrone-0",
          "coords": {
            "lat": lat,
            "lng": lng
          },
          "departure_time": "2023-10-10T08:00:00Z",
          "travel_time": time * 60, // Convert minutes to seconds
          "transportation": {
            "type": "walking"
          }
         

        }]
    };
  
    try {
        const response = await axios.post(url, body, config);
        //console.log(JSON.stringify(response.data, null, 2)); // This will give you a formatted view of the response

        return response.data; // This will include the isochrone information
      } catch (error) {
        console.error('Error fetching walking area data:', error);
        throw error;
      }
  };