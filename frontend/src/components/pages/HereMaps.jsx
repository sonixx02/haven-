import React, { useEffect, useRef, useState } from "react";
import Navbar from "../shared/Navbar";

const HereMaps = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [destMarker, setDestMarker] = useState(null);
  const [routes, setRoutes] = useState([]); // State to store routes
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null); // State for selected route
  const [navigationInstructions, setNavigationInstructions] = useState([]); // State for navigation instructions
  const HERE_API_KEY = "mMN6QckgeTEUXfQPmWvFOKgr9AiuefC4AZ8Lj-OGUJg"; // Replace with your actual API key

  

  useEffect(() => {
    // Load the HERE Maps script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://js.api.here.com/v3/3.1/mapsjs-core.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const script2 = document.createElement("script");
      script2.type = "text/javascript";
      script2.src = "https://js.api.here.com/v3/3.1/mapsjs-service.js";
      script2.async = true;
      document.body.appendChild(script2);

      script2.onload = () => {
        const script3 = document.createElement("script");
        script3.type = "text/javascript";
        script3.src = "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js";
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
      apikey: HERE_API_KEY, // Replace with your actual API key
    });

    // Obtain the default map types from the platform object
    const defaultLayers = platform.createDefaultLayers();

    // Instantiate the map
    const newMap = new window.H.Map(
      mapRef.current,
      defaultLayers.vector.normal.map,
      {
        center: { lat: 19.076, lng: 72.8777 }, // Mumbai coordinates
        zoom: 7,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    // Create the behaviors
    const behavior = new window.H.mapevents.Behavior(
      new window.H.mapevents.MapEvents(newMap)
    );

    setMap(newMap);

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        console.log(`User location: ${latitude}, ${longitude}`);

        // Log user location to backend
        fetch("/api/log-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });

        // Add a marker for user location
        const marker = new window.H.map.Marker({
          lat: latitude,
          lng: longitude,
        });
        newMap.addObject(marker);
        setUserMarker(marker);

        // Center the map on user's location
        newMap.setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
    // Add static markers for predefined locations
    addStaticMarkers(newMap);
  };

  const addStaticMarkers = (map) => {
    const staticLocations = [
      { lat: 19.1627725, lng: 74.8580243, name: "AHMEDNAGAR" },
      { lat: 20.76181225, lng: 77.1921157, name: "AKOLA" },
      { lat: 20.9316219, lng: 77.7588455, name: "AMRAVATI CITY" },
      { lat: 21.1435696, lng: 78.9633643, name: "AMRAVATI RURAL" },
      { lat: 18.9918442, lng: 75.9097840, name: "BEED" },
      { lat: 21.1225869, lng: 79.7945090, name: "BHANDARA" },
      { lat: 20.5628450, lng: 76.4086986, name: "BULDHANA" },
      { lat: 20.0967555, lng: 79.5045475, name: "CHANDRAPUR" },
      { lat: 19.8772630, lng: 75.3390241, name: "CHHATRAPATI SAMBHAJINAGAR CITY" },
      { lat: 18.1698439, lng: 76.1179632, name: "DHARASHIV" },
      { lat: 21.1305215, lng: 74.4900614, name: "DHULE" },
      { lat: 19.7590704, lng: 80.1622807, name: "GADCHIROLI" },
      { lat: 21.4552280, lng: 80.1962729, name: "GONDIA" },
      { lat: 19.5431164, lng: 77.1739432, name: "HINGOLI" },
      { lat: 20.8428827, lng: 75.5261246, name: "JALGAON" },
      { lat: 19.9188330, lng: 75.8708599, name: "JALNA" },
      { lat: 16.7028412, lng: 74.2405329, name: "KOLHAPUR" },
      { lat: 18.3515908, lng: 76.7554236, name: "LATUR" },
      { lat: 21.1498134, lng: 79.0820556, name: "NAGPUR CITY" },
      { lat: 21.1382070, lng: 78.8107311, name: "NAGPUR RURAL" },
      { lat: 19.0940088, lng: 77.4831922, name: "NANDED" },
      { lat: 21.5141622, lng: 74.5405513, name: "NANDURBAR" },
      { lat: 20.0112475, lng: 73.7902364, name: "NASHIK CITY" },
      { lat: 20.4344190, lng: 73.5236340, name: "NASHIK RURAL" },
      { lat: 19.0308262, lng: 73.0198537, name: "NAVI MUMBAI" },
      { lat: 19.7572490, lng: 73.0931199, name: "PALGHAR" },
      { lat: 19.2901981, lng: 76.6026443, name: "PARBHANI" },
      { lat: 18.6279288, lng: 73.8009829, name: "PIMPRI-CHINCHWAD" },
      { lat: 18.5213738, lng: 73.8545071, name: "PUNE CITY" },
      { lat: 18.5431042, lng: 73.8222985, name: "PUNE RURAL" },
      { lat: 18.4928092, lng: 73.1380710, name: "RAIGAD" },
      { lat: 17.2826079, lng: 73.4569787, name: "RATNAGIRI" },
      { lat: 16.8502534, lng: 74.5948885, name: "SANGLI" },
      { lat: 17.6361289, lng: 74.2982781, name: "SATARA" },
      { lat: 16.1357193, lng: 73.6522086, name: "SINDHUDURG" },
      { lat: 17.6699734, lng: 75.9008118, name: "SOLAPUR CITY" },
      { lat: 19.1761469, lng: 72.9683889, name: "THANE CITY" },
      { lat: 20.8256232, lng: 78.6131455, name: "WARDHA" },
      { lat: 20.2874178, lng: 77.2369655, name: "WASHIM" },
      { lat: 20.3270469, lng: 78.1186870, name: "YAVATMAL" },
    ];
    
    
  
    // Custom icon for static markers
    const customIcon = {
      iconUrl: 
        'data:image/svg+xml;utf-8,\
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">\
          <circle cx="12" cy="12" r="10" fill="red" />\
          <circle cx="12" cy="12" r="5" fill="orange" />\
        </svg>',
      iconSize: { w: 24, h: 24 },
    };
    
  
    staticLocations.forEach((location) => {
      const icon = new window.H.map.Icon(customIcon.iconUrl, customIcon.iconSize); // Create icon using custom size
      const marker = new window.H.map.Marker({ lat: location.lat, lng: location.lng }, { icon }); // Use custom icon
  
      marker.setData(location.name);
      marker.addEventListener("tap", (evt) => {
        alert(`You clicked on: ${evt.target.getData()}`);
      });
      map.addObject(marker);
    });
  };
  

  const handleDestinationSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3001/api/get-destination",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.latitude && data.longitude) {
        console.log(`Destination: ${destination}`);
        console.log(
          `Destination coordinates: ${data.latitude}, ${data.longitude}`
        );

        // Remove previous route objects and markers
        map.removeObjects(map.getObjects());

        // Add markers for origin and destination
        const originMarker = new window.H.map.Marker(userLocation);
        const destMarker = new window.H.map.Marker({
          lat: data.latitude,
          lng: data.longitude,
        });
        map.addObjects([originMarker, destMarker]);

        // Calculate and display multiple routes
        calculateAndDisplayRoutes(userLocation, {
          lat: data.latitude,
          lng: data.longitude,
        });
      } else {
        console.log("Destination not found");
      }
    } catch (error) {
      console.error("Error fetching destination coordinates:", error);
      // You might want to show this error to the user in some way
    }
  };

  const calculateAndDisplayRoutes = (origin, destination) => {
    const platform = new window.H.service.Platform({
      apikey: HERE_API_KEY,
    });

    const router = platform.getRoutingService(null, 8);
    const routeRequestParams = {
      routingMode: "fast",
      transportMode: "car",
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      alternatives: 3, // Request up to 3 alternative routes
      return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
    };

    router.calculateRoute(routeRequestParams, onSuccess, onError);
  };

  const onSuccess = (result) => {
    console.log("Route calculation result:", result);
    if (result.routes && result.routes.length > 0) {
      // Store routes in state
      setRoutes(result.routes);
      

      // Clear previous route markers from the map
      map.removeObjects(
        map.getObjects().filter((obj) => !(obj instanceof window.H.map.Marker))
      );

      // Add routes to the map
      result.routes.forEach((route, index) => {
        addRouteShapeToMap(route, getRouteColor(index));
      });

      // Zoom to fit all routes
      map.getViewModel().setLookAtData({
        bounds: map.getObjects().reduce((bbox, obj) => {
          return bbox
            ? bbox.mergeLatLngBounds(obj.getBoundingBox())
            : obj.getBoundingBox();
        }, null),
      });
    } else {
      console.error("No routes found in the result");
    }
  };

  const onError = (error) => {
    console.error("Error calculating routes:", error);
    alert("Can't calculate routes. Please try again.");
  };

  const addRouteShapeToMap = (route, color) => {
    if (route && route.sections) {
      route.sections.forEach((section) => {
        if (section.polyline) {
          let linestring = H.geo.LineString.fromFlexiblePolyline(
            section.polyline
          );
          let polyline = new window.H.map.Polyline(linestring, {
            style: {
              lineWidth: 6, // Increased line width for better visibility
              strokeColor: color,
            },
          });
          map.addObject(polyline);
        }
      });
    } else {
      console.error("Invalid route object:", route);
    }
  };

  const getRouteColor = (index) => {
    const colors = [
      "rgba(0, 100, 0, 0.8)", // Dark Green for safest route
      "rgba(139, 0, 0, 0.8)", // Dark Red for less safe route
      "rgba(0, 0, 139, 0.8)", // Dark Blue for alternate routes
      "rgba(184, 134, 11, 0.8)", // Dark Goldenrod for alternate routes
    ];
    return colors[index % colors.length];
  };

  // Function to handle route selection
  const handleRouteSelection = (index) => {
    // Remove all objects that are not markers from the map (clearing routes)
    map.removeObjects(
      map.getObjects().filter((obj) => !(obj instanceof window.H.map.Marker))
    );

    // Add the selected route to the map
    const selectedRoute = routes[index];
    addRouteShapeToMap(selectedRoute, getRouteColor(index));

    // Populate navigation instructions for the selected route
    setSelectedRouteIndex(index);

    // Ensure correct instructions are mapped
    const instructions = selectedRoute.sections.flatMap(
      (section) => section.actions
    );
    setNavigationInstructions(instructions);

    // Zoom to fit the selected route on the map
    map.getViewModel().setLookAtData({
      bounds: selectedRoute.sections.reduce((bbox, section) => {
        const sectionLine = window.H.geo.LineString.fromFlexiblePolyline(
          section.polyline
        );
        const sectionBBox = sectionLine.getBoundingBox();
        return bbox ? bbox.mergeLatLngBounds(sectionBBox) : sectionBBox;
      }, null),
    });
  };

  return (
    <>
    <Navbar />
   
    <div className="flex">
      {/* Left Panel */}
      <div className="w-[40%] h-screen p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Your Location</h2>
        {userLocation ? (
          <div>
            <p>Latitude: {userLocation.lat}</p>
            <p>Longitude: {userLocation.lng}</p>
          </div>
        ) : (
          <p>Loading your location...</p>
        )}
        <form
          onSubmit={handleDestinationSubmit}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <h3 className="text-xl font-bold mb-4">Destination</h3>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Get Route
          </button>
        </form>
        {routes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Available Routes</h3>
            <p className="mb-2">
              Routes are color-coded based on their safety levels:
              <span className="text-green-600 ml-1">Green = Safest</span>,
              <span className="text-red-600 ml-1">Red = Less Safe</span>,
              <span className="text-blue-600 ml-1">Blue = Alternate</span>,
              <span className="text-yellow-600 ml-1">
                Goldenrod = Alternate
              </span>
              .
            </p>
            <ul>
              {routes.map((route, index) => {
                // Determine route safety message and color
                let safetyMessage = "";
                let textColor = "";

                if (index === 0) {
                  safetyMessage = "This route is the safest (green).";
                  textColor = "text-green-600"; // Dark Green for safest route
                } else if (index === 1) {
                  safetyMessage = "This route is moderately safe (blue).";
                  textColor = "text-blue-600"; // Dark Blue for moderately safe route
                } else if (index === 2) {
                  safetyMessage = "This route is less safe (dark golden).";
                  textColor = "text-yellow-700"; // Dark Goldenrod for alternate routes
                } else {
                  safetyMessage = "This route is not as safe (red).";
                  textColor = "text-red-600"; // Dark Red for less safe route
                }

                return (
                  <li key={index} className="mb-2">
                    <button
                      onClick={() => handleRouteSelection(index)}
                      className={`text-blue-500 hover:underline ${
                        index === 0 ? "font-bold" : ""
                      }`}
                    >
                      Route {index + 1}
                    </button>
                    <span className={`ml-2 text-sm ${textColor}`}>
                      {safetyMessage}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Navigation Instructions Card */}
        {selectedRouteIndex !== null && (
          <div className="mt-4 bg-white shadow-md rounded-lg p-4 max-h-60 overflow-y-scroll">
            <h3 className="text-xl font-bold mb-2">Navigation Instructions</h3>
            <ul>
              {navigationInstructions.map((action, index) => (
                <li key={index} className="mb-2">
                  {action.instruction}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right Map Section */}
      <div className="w-[60%] h-screen" ref={mapRef}></div>
    </div>
    </>
  );
};

export default HereMaps;
