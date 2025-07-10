'use client';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const defaultPosition = { lat: 51.5072, lng: -0.1276 }; // London

export function LocationPicker() {
  const [position, setPosition] = useState(defaultPosition);
  const [lat, setLat] = useState(defaultPosition.lat.toString());
  const [lng, setLng] = useState(defaultPosition.lng.toString());

  useEffect(() => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      setPosition({ lat: latNum, lng: lngNum });
    }
  }, [lat, lng]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.detail.latLng) {
        const { lat, lng } = event.detail.latLng;
        setPosition({ lat, lng });
        setLat(lat.toString());
        setLng(lng.toString());
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
