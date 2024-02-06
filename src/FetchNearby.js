const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const loadGoogleMapsScript = (callback) => {
    if (window.google && window.google.maps) {
      callback();
      return;
    }
  
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => callback();
    document.head.appendChild(script);
  };
  
  export const fetchNearbyUtilities = (lat, lng, radius, category) => {
    //console.log(category);

    return new Promise((resolve, reject) => {
      loadGoogleMapsScript(() => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
          location: new window.google.maps.LatLng(lat, lng),
          radius,
          type: category,
        };
  
        let utilities = [];
  
        const callback = (results, status, pagination) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            utilities = utilities.concat(results.map(utility => ({
              name: utility.name,
              lat: utility.geometry.location.lat(),
              lng: utility.geometry.location.lng(),
            })));
  
            // Check if there's a next page and if so, fetch more results
            if (pagination && pagination.hasNextPage) {
              // Wait a short time before making the next request to avoid errors
              setTimeout(() => pagination.nextPage(), 500);
            } else {
              resolve(utilities); // No more pages or not paginating further, resolve promise
            }
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]); // Resolve with an empty array for no results
          } else {
            reject('Failed to fetch nearby utilities');
          }
        };
  
        service.nearbySearch(request, callback);
      });
    });
  };
  