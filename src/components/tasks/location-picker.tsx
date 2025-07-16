
'use client';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';

export interface Location {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
    onLocationChange: (location: Location) => void;
}

const defaultPosition: Location = { lat: 25.09709041619391, lng: 55.18116614585842 };

export function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<Location>(defaultPosition);

  useEffect(() => {
    // Set initial location
    onLocationChange(defaultPosition);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        const newPosition = { lat, lng };
        setPosition(newPosition);
        onLocationChange(newPosition);
    }
  };

  return (
    <div className="space-y-2">
      <div style={{ height: '250px', borderRadius: 'var(--radius)' }} className="overflow-hidden">
        <Map
          mapId="task-location-map"
          defaultCenter={position}
          defaultZoom={9}
          center={position}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          onClick={handleMapClick}
        >
          <AdvancedMarker position={position} />
        </Map>
      </div>
      <p className="text-xs text-muted-foreground">Click on the map to select a location.</p>
    </div>
  );
}
