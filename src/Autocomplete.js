// Autocomplete.js
import React, { useEffect, useRef, useState } from 'react';

function AutocompleteInput() {
  const [address, setAddress] = useState('');
  const autocompleteInput = useRef(null);
  let autocomplete = null;

  useEffect(() => {
    autocomplete = new window.google.maps.places.Autocomplete(autocompleteInput.current,
      {types: ['geocode']});

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      setAddress(place.formatted_address);
    });
  }, []);

  return (
    <input
      ref={autocompleteInput}
      onChange={(e) => setAddress(e.target.value)}
      value={address}
      placeholder="Entre ton adresse ici"
    />
  );
}

export default AutocompleteInput;