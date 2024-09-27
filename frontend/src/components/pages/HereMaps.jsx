import React, { useEffect, useRef, useState } from 'react';

const HereMaps = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [destMarker, setDestMarker] = useState(null);
  const HERE_API_KEY = 'mMN6QckgeTEUXfQPmWvFOKgr9AiuefC4AZ8Lj-OGUJg'; // Replace with your actual API key

  useEffect(() => {
    // Load the HERE Maps script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
      script2.async = true;
      document.body.appendChild(script2);

      script2.onload = () => {
        const script3 = document.createElement('script');
        script3.type = 'text/javascript';
        script3.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
        script3.async = true;
        document.body.appendChild(script3);

        script3.onload = initMap;
      };
    };

    return () => {
      // Clean up scripts when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const initMap = () => {
    // Initialize the platform object
    const platform = new window.H.service.Platform({
      apikey: HERE_API_KEY // Replace with your actual API key
    });

    // Obtain the default map types from the platform object
    const defaultLayers = platform.createDefaultLayers();

    // Instantiate the map
    const newMap = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
        zoom: 7,
        pixelRatio: window.devicePixelRatio || 1
      }
    );

    // Create the behaviors
    const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(newMap));

    setMap(newMap);

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        console.log(User location: ${latitude}, ${longitude});

        // Log user location to backend
        fetch('/api/log-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude })
        });

        // Add a marker for user location
        const marker = new window.H.map.Marker({ lat: latitude, lng: longitude });
        newMap.addObject(marker);
        setUserMarker(marker);

        // Center the map on user's location
        newMap.setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  const handleDestinationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/get-destination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination })
      });

      if (!response.ok) {
        throw new Error(HTTP error! status: ${response.status});
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        console.log(Destination: ${destination});
        console.log(Destination coordinates: ${data.latitude}, ${data.longitude});

        // Remove previous route objects and markers
        map.removeObjects(map.getObjects());

        // Add markers for origin and destination
        const originMarker = new window.H.map.Marker(userLocation);
        const destMarker = new window.H.map.Marker({ lat: data.latitude, lng: data.longitude });
        map.addObjects([originMarker, destMarker]);

        // Calculate and display multiple routes
        calculateAndDisplayRoutes(userLocation, { lat: data.latitude, lng: data.longitude });
      } else {
        console.log('Destination not found');
      }
    } catch (error) {
      console.error('Error fetching destination coordinates:', error);
      // You might want to show this error to the user in some way
    }
  };

  const calculateAndDisplayRoutes = (origin, destination) => {
  const platform = new window.H.service.Platform({
    apikey: HERE_API_KEY
  });

  const router = platform.getRoutingService(null, 8);
  const routeRequestParams = {
    routingMode: 'fast',
    transportMode: 'car',
    origin: ${origin.lat},${origin.lng},
    destination: ${destination.lat},${destination.lng},
    alternatives: 3, // Request up to 3 alternative routes
    return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
  };

  router.calculateRoute(routeRequestParams, onSuccess, onError);
};

const onSuccess = (result) => {
  console.log('Route calculation result:', result);
  if (result.routes && result.routes.length > 0) {
    result.routes.forEach((route, index) => {
      addRouteShapeToMap(route, getRouteColor(index));
    });
    
    // Zoom to fit all routes
    map.getViewModel().setLookAtData({
      bounds: map.getObjects().reduce((bbox, obj) => {
        return bbox ? bbox.mergeLatLngBounds(obj.getBoundingBox()) : obj.getBoundingBox();
      }, null)
    });
  } else {
    console.error('No routes found in the result');
  }
};

const onError = (error) => {
  console.error('Error calculating routes:', error);
  alert('Can\'t calculate routes. Please try again.');
};

const addRouteShapeToMap = (route, color) => {
  if (route && route.sections) {
    route.sections.forEach((section) => {
      if (section.polyline) {
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
        let polyline = new window.H.map.Polyline(linestring, {
           style: {
            lineWidth: 6,  // Increased line width for better visibility
            strokeColor: color
          }
        });
        map.addObject(polyline);
      }
    });
  } else {
    console.error('Invalid route object:', route);
  }
};

const getRouteColor = (index) => {
    const colors = [
      'rgba(0, 100, 0, 0.8)',    // Dark Green
      'rgba(139, 0, 0, 0.8)',    // Dark Red
      'rgba(0, 0, 139, 0.8)',    // Dark Blue
      'rgba(184, 134, 11, 0.8)'  // Dark Goldenrod
    ];
    return colors[index % colors.length];
  };


  return (
    <div>
      <form onSubmit={handleDestinationSubmit}>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
        />
        <button type="submit">Submit</button>
      </form>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
    </div>
  );
};

export default HereMaps;