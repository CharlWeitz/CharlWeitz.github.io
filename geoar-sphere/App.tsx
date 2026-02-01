import React, { useState, useEffect } from 'react';
import { XRExperience } from './components/XRExperience';
import { GeolocationStatus } from './types';
import { TARGET_COORDINATES } from './constants';
import { calculateDistance } from './utils/geoUtils';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>(GeolocationStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [distanceToTarget, setDistanceToTarget] = useState<number | null>(null);

  useEffect(() => {
    // Start fetching location immediately
    setStatus(GeolocationStatus.LOCATING);
    
    const success = (position: GeolocationPosition) => {
      setUserLocation(position.coords);
      
      const dist = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        TARGET_COORDINATES.latitude,
        TARGET_COORDINATES.longitude
      );
      setDistanceToTarget(dist);
      setStatus(GeolocationStatus.READY);
    };

    const error = (err: GeolocationPositionError) => {
      console.error(err);
      setStatus(GeolocationStatus.ERROR);
      setErrorMsg(err.message);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(success, error, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-900 text-white">
      {/* Background/Fallback for non-AR */}
      <div className="absolute inset-0 z-0">
        <XRExperience 
          userLocation={userLocation} 
          ready={status === GeolocationStatus.READY} 
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10">
        <div className="max-w-md mx-auto bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="text-red-500 w-5 h-5" />
              Target Tracker
            </h1>
            <div className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              status === GeolocationStatus.READY ? 'bg-green-500/20 text-green-400' :
              status === GeolocationStatus.ERROR ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status}
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            {status === GeolocationStatus.LOCATING && (
              <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Acquiring GPS Lock...</span>
              </div>
            )}
            
            {status === GeolocationStatus.ERROR && (
               <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-4 h-4" />
               <span>{errorMsg || 'GPS Error'}</span>
             </div>
            )}

            {status === GeolocationStatus.READY && distanceToTarget !== null && (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                   <span>Target:</span>
                   <span className="font-mono text-white">33.4357° S, 18.2614° E</span>
                </div>
                <div className="flex justify-between font-bold text-white text-base">
                   <span>Distance:</span>
                   <span>{distanceToTarget < 1000 
                     ? `${distanceToTarget.toFixed(1)} m` 
                     : `${(distanceToTarget / 1000).toFixed(2)} km`}
                   </span>
                </div>
                {distanceToTarget > 100 && (
                  <p className="text-xs text-yellow-500 mt-1">
                    Target is far away. You may not see the sphere until you get closer.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Instructions */}
      <div className="absolute bottom-12 left-0 w-full text-center p-4 pointer-events-none z-10 opacity-70">
        <p className="text-xs">Face North to align coordinates roughly.</p>
      </div>
    </div>
  );
};

export default App;