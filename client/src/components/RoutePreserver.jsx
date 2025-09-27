import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RoutePreserver() {
  const location = useLocation();

  useEffect(() => {
    // Log the current location for debugging
    console.log('RoutePreserver - Current location:', location.pathname);
    
    // Ensure the URL in the browser matches the current route
    if (window.location.pathname !== location.pathname) {
      console.log('URL mismatch detected, correcting...');
      window.history.replaceState(null, '', location.pathname + location.search + location.hash);
    }
  }, [location]);

  return null; // This component doesn't render anything
}
