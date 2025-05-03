import React, { useContext, useState, useEffect } from 'react';
import { CountryContext } from '../context/CountryContext';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { fetchAllCountries } from '../services/api';

const CountryRoutePlanner = () => {
  const [countries, setCountries] = useState([]);
  const [routeCountries, setRouteCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchAllCountries();
        setCountries(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadCountries();
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setRouteCountries((items) => {
        const oldIndex = items.findIndex(item => item.cca3 === active.id);
        const newIndex = items.findIndex(item => item.cca3 === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addToRoute = (country) => {
    if (!routeCountries.some(c => c.cca3 === country.cca3)) {
      setRouteCountries([...routeCountries, country]);
    }
  };

  const removeFromRoute = (countryCode) => {
    setRouteCountries(routeCountries.filter(c => c.cca3 !== countryCode));
  };

  if (loading) return <div className="text-center py-8">Loading countries...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Travel Route Planner</h1>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Back to Countries
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Countries List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Countries ({countries.length})</h2>
          <ul className="divide-y divide-gray-200">
            {countries.map(country => (
              <li 
                key={country.cca3} 
                onClick={() => addToRoute(country)}
                className="py-3 px-4 hover:bg-gray-50 cursor-pointer flex items-center"
              >
                <img 
                  src={country.flags.svg} 
                  alt={`Flag of ${country.name.common}`} 
                  className="w-8 h-6 mr-3 object-cover"
                />
                <span className="font-medium">{country.name.common}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Planned Route List */}
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-2 border-dashed border-blue-200">
          <h2 className="text-xl font-semibold mb-4">Your Planned Route ({routeCountries.length})</h2>
          {routeCountries.length > 0 ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={routeCountries} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-blue-200">
                  {routeCountries.map((country, index) => (
                    <li 
                      key={country.cca3}
                      className="py-3 px-4 bg-white mb-2 rounded shadow-sm flex items-center"
                    >
                      <span className="text-blue-600 font-medium mr-3">{index + 1}.</span>
                      <img 
                        src={country.flags.svg} 
                        alt={country.name.common} 
                        className="w-8 h-6 mr-3 object-cover"
                      />
                      <span className="flex-grow">{country.name.common}</span>
                      <button
                        onClick={() => removeFromRoute(country.cca3)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No countries added to your route yet</p>
              <p className="text-sm mt-2">Click on countries to add them to your route</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryRoutePlanner;