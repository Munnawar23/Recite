import { useMemo } from 'react';
import { LocationData, MECCA_COORDS } from '@/features/home/hooks/useUserLocation';

export function useQiblaDirection(userCoords: LocationData['coords']) {
  const qiblaAngle = useMemo(() => {
    if (!userCoords) {
      return 0;
    }

    const phi1 = userCoords.latitude * (Math.PI / 180);
    const phi2 = MECCA_COORDS.latitude * (Math.PI / 180);
    const deltaLambda = (MECCA_COORDS.longitude - userCoords.longitude) * (Math.PI / 180);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    
    // Normalize to 0-360
    return (bearing + 360) % 360;
  }, [userCoords.latitude, userCoords.longitude]);

  return qiblaAngle;
}
