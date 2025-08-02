import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: Coordinates;
}

interface MapSelectorProps {
  onAddressSelect: (address: Address) => void;
  initialAddress?: Address;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onAddressSelect, initialAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        // Default to a central location in India if no initial coordinates
        const defaultPosition = { lat: 20.5937, lng: 78.9629 }; // Center of India
        const initialPosition = initialAddress?.coordinates || defaultPosition;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialPosition,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Create marker
        const markerInstance = new google.maps.Marker({
          position: initialPosition,
          map: mapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });

        // If we have initial address, reverse geocode to get the address
        if (initialAddress?.coordinates) {
          reverseGeocode(initialAddress.coordinates, google);
        }

        // Add click event to map
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          
          const position = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          
          markerInstance.setPosition(position);
          reverseGeocode(position, google);
        });

        // Add dragend event to marker
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (!position) return;
          
          const coordinates = {
            lat: position.lat(),
            lng: position.lng()
          };
          
          reverseGeocode(coordinates, google);
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load Google Maps. Please try again later.');
        setLoading(false);
      }
    };

    initMap();
  }, [initialAddress]);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (coordinates: Coordinates, googleInstance: typeof google) => {
    try {
      const geocoder = new googleInstance.maps.Geocoder();
      const response = await geocoder.geocode({ location: coordinates });

      if (response.results.length > 0) {
        const result = response.results[0];
        const addressComponents = result.address_components;

        // Extract address components
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';

        for (const component of addressComponents) {
          const types = component.types;

          if (types.includes('street_number')) {
            street = component.long_name + ' ';
          }

          if (types.includes('route')) {
            street += component.long_name;
          }

          if (types.includes('locality')) {
            city = component.long_name;
          }

          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }

          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        }

        // If street is empty, use formatted_address
        if (!street) {
          const parts = result.formatted_address.split(',');
          street = parts[0] || '';
        }

        const address: Address = {
          street,
          city,
          state,
          zipCode,
          coordinates
        };

        onAddressSelect(address);
      }
    } catch (err) {
      console.error('Error in reverse geocoding:', err);
      setError('Failed to get address from selected location.');
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-300 relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Click on the map to set your exact location or drag the marker to adjust.
      </p>
    </div>
  );
};

export default MapSelector;