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
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllCountries } from '../../services/api';
import L from 'leaflet';

const MapViewUpdater = ({ filteredCountries }) => {
  const map = useMap();

  useEffect(() => {
    if (filteredCountries?.features?.length > 0) {
      const bounds = L.geoJSON(filteredCountries).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [filteredCountries, map]);

  return null;
};

const Map = () => {
  const [countriesGeoJSON, setCountriesGeoJSON] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredCountries, setFilteredCountries] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(null);

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
              flag: country.flags.svg,
              region: country.region
            },
            geometry: {
              type: "Point",
              coordinates: [
                country.latlng?.[1] || 0,
                country.latlng?.[0] || 0
              ]
            }
          }))
        };
        setCountriesGeoJSON(geoJSON);
        setFilteredCountries(geoJSON);
      } catch (error) {
        console.error("Error loading countries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  useEffect(() => {
    if (countriesGeoJSON) {
      let filtered = countriesGeoJSON.features;
      
      if (searchQuery) {
        filtered = filtered.filter(country => 
          country.properties.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (regionFilter !== 'All') {
        filtered = filtered.filter(country => 
          country.properties.region === regionFilter
        );
      }
      
      setFilteredCountries({
        ...countriesGeoJSON,
        features: filtered
      });
    }
  }, [searchQuery, regionFilter, countriesGeoJSON]);

  const onEachCountry = (feature, layer) => {
    const countryData = feature.properties;
    
    layer.bindPopup(`
      <div class="p-2 max-w-[200px]">
        <h3 class="font-bold text-lg mb-2">${countryData.name}</h3>
        <img src="${countryData.flag}" alt="${countryData.name}" class="w-full h-auto mb-2 border border-gray-200"/>
        <p class="text-sm"><strong>Capital:</strong> ${countryData.capital}</p>
        <p class="text-sm"><strong>Population:</strong> ${countryData.population.toLocaleString()}</p>
      </div>
    `);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          radius: 8,
          fillColor: "#2563eb",
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          radius: 5,
          fillColor: "#3b82f6",
          color: "#ffffff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      click: (e) => {
        setSelectedCountry(feature.properties);
      }
    });
  };

  return (
    <div className="relative w-full h-screen" style={{ margin: 0, padding: 0 }}>
      {/* Gray header bar with search controls */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gray-100/90 backdrop-blur-sm px-4 py-3 shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 transition-all"
            />
          </div>
          
          {/* Region Filter */}
          <div className="relative w-full sm:w-48 min-w-[160px]">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none"
            >
              <option value="All">All Regions</option>
              <option value="Africa">Africa</option>
              <option value="Americas">Americas</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="Oceania">Oceania</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Map */}
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ 
          height: '100vh',
          width: '100%',
          margin: 0,
          padding: 0,
          position: 'absolute',
          top: 0
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapViewUpdater filteredCountries={filteredCountries} />
        {filteredCountries && (
          <GeoJSON
            data={filteredCountries}
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

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-[1001]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Country Info Panel */}
      {selectedCountry && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg shadow-xl overflow-hidden w-64 border border-gray-200">
          <div className="bg-blue-600 p-3 text-white">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg truncate">{selectedCountry.name}</h3>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="text-white hover:text-gray-200 focus:outline-none text-lg"
              >
                &times;
              </button>
            </div>
          </div>
          <div className="p-4">
            <img 
              src={selectedCountry.flag} 
              alt={selectedCountry.name} 
              className="w-full h-24 object-contain border border-gray-200 rounded mb-3"
            />
            <div className="space-y-2 text-sm">
              <p className="truncate">
                <span className="font-semibold">Capital:</span> {selectedCountry.capital}
              </p>
              <p>
                <span className="font-semibold">Population:</span> {selectedCountry.population.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;