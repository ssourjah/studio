
'use client';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [lat, setLat] = useState(defaultPosition.lat.toString());
  const [lng, setLng] = useState(defaultPosition.lng.toString());

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const newPosition = { lat: latNum, lng: lngNum };
      setPosition(newPosition);
      onLocationChange(newPosition);
    }
  }, [lat, lng, onLocationChange]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        const newPosition = { lat, lng };
        setPosition(newPosition);
        setLat(lat.toString());
        setLng(lng.toString());
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude" />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Click on the map to select a location or enter coordinates manually.</p>
    </div>
  );
}
