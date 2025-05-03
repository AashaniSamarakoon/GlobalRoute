// import React, { useContext, useEffect, useState } from 'react';
// import { CountryContext } from '../../context/CountryContext';
// import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import SearchBar from '../countries/SearchBar';
// import FilterOptions from '../countries/FilterOptions';
// // import Footer from '../layout/Footer';
// // import Navbar from '../layout/Navbar';

// const Map = () => {
//   const { filteredCountries, loading, error } = useContext(CountryContext);
//   const [mapData, setMapData] = useState(null);
//   const [selectedCountry, setSelectedCountry] = useState(null);

//   useEffect(() => {
//     const fetchMapData = async () => {
//       try {
//         const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
//         const data = await response.json();
//         setMapData(data);
//       } catch (err) {
//         console.error('Error fetching map data:', err);
//       }
//     };

//     fetchMapData();
//   }, []);

//   const countryStyle = (feature) => {
//     const countryCode = feature.properties.iso_a3;
//     const isHighlighted = filteredCountries.some(c => c.cca3 === countryCode);
    
//     return {
//       fillColor: isHighlighted ? '#3b82f6' : '#cccccc',
//       weight: 1,
//       opacity: 1,
//       color: 'white',
//       fillOpacity: 0.7,
//     };
//   };

//   const onEachCountry = (country, layer) => {
//     const countryCode = country.properties.iso_a3;
//     const matchedCountry = filteredCountries.find(c => c.cca3 === countryCode);
    
//     if (matchedCountry) {
//       layer.bindPopup(`
//         <div class="p-2">
//           <h3 class="font-bold">${matchedCountry.name.common}</h3>
//           <img src="${matchedCountry.flags.svg}" alt="${matchedCountry.name.common}" width="100" class="my-2"/>
//           <p>Capital: ${matchedCountry.capital ? matchedCountry.capital[0] : 'N/A'}</p>
//           <p>Population: ${matchedCountry.population.toLocaleString()}</p>
//           <a href="/country/${matchedCountry.cca3}" class="text-blue-600 hover:underline">More details</a>
//         </div>
//       `);
//     }

//     layer.on({
//       mouseover: (e) => {
//         const layer = e.target;
//         layer.setStyle({
//           weight: 2,
//           color: '#666',
//           fillOpacity: 0.9
//         });
//       },
//       mouseout: (e) => {
//         const layer = e.target;
//         layer.setStyle(countryStyle(country));
//       },
//       click: (e) => {
//         setSelectedCountry(matchedCountry || null);
//       }
//     });
//   };

//   if (loading || !mapData) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error!</strong>
//         <span className="block sm:inline"> {error}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       {/* Single Navbar - remove any other navbar instances */}
//       {/* <Navbar /> */}
      
//       {/* Main Content Area - takes remaining space */}
//       <main className="flex-1 relative">
//         {/* Search and Filter Controls */}
//         <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-4">
//           <SearchBar />
//           <FilterOptions />
//         </div>
        
//         {/* Map Container - fills available space */}
//         <MapContainer 
//           center={[20, 0]} 
//           zoom={2} 
//           style={{ height: '100%', width: '100%' }}
//           className="absolute inset-0 z-0"
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           />
//           <GeoJSON
//             data={mapData}
//             style={countryStyle}
//             onEachFeature={onEachCountry}
//           />
//         </MapContainer>

//         {/* Country Info Panel */}
//         {selectedCountry && (
//           <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
//             {/* ... your country info panel content ... */}
//           </div>
//         )}
//       </main>

//       {/* Single Footer at bottom */}
//       {/* <Footer /> */}
//     </div>
//   );
// };

// export default Map;




import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllCountries } from '../../services/api';
import SearchBar from '../countries/SearchBar';
import FilterOptions from '../countries/FilterOptions';
import L from 'leaflet';

const Map = () => {
  const [countriesGeoJSON, setCountriesGeoJSON] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchAllCountries();
        const geoJSON = {
          type: "FeatureCollection",
          features: countries.map(country => ({
            type: "Feature",
            properties: {
              name: country.name.common,
              iso_a3: country.cca3,
              capital: country.capital?.[0] || 'N/A',
              population: country.population,
              flag: country.flags.svg
            },
            geometry: {
              type: "Point",
              coordinates: [
                country.latlng?.[1] || 0, // longitude
                country.latlng?.[0] || 0  // latitude
              ]
            }
          }))
        };
        setCountriesGeoJSON(geoJSON);
      } catch (error) {
        console.error("Error loading countries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  const onEachCountry = (feature, layer) => {
    const { name, capital, population, flag } = feature.properties;
    layer.bindPopup(`
      <div style="padding: 8px; max-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${name}</h3>
        <img src="${flag}" alt="${name}" style="width: 100%; margin-bottom: 8px; border: 1px solid #ddd;"/>
        <p style="margin: 4px 0; font-size: 14px;">Capital: ${capital}</p>
        <p style="margin: 4px 0; font-size: 14px;">Population: ${population.toLocaleString()}</p>
      </div>
    `);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '64px', // Adjust this to match your header height
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white' // Ensures white background while loading
    }}>
      {!loading && (
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%' }}
          className="full-page-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {countriesGeoJSON && (
            <GeoJSON
              data={countriesGeoJSON}
              onEachFeature={onEachCountry}
              pointToLayer={(feature, latlng) => {
                return L.circleMarker(latlng, {
                  radius: 5,
                  fillColor: "#3b82f6",
                  color: "#ffffff",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.8
                });
              }}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default Map;