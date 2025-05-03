import React, { useContext, useState, useEffect } from 'react';
import { CountryContext } from '../context/CountryContext';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import CountryCard from '../components/countries/CountryCard';
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Travel Route Planner</h1>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Back to Countries
        </Link>
      </div>
      
      <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Planned Route</h2>
        {routeCountries.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={routeCountries} strategy={horizontalListSortingStrategy}>
              <div className="flex flex-wrap gap-4">
                {routeCountries.map((country, index) => (
                  <div key={country.cca3} className="relative group">
                    <CountryCard country={country} draggable />
                    <span className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => removeFromRoute(country.cca3)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No countries added to your route yet</p>
            <p className="text-sm mt-2">Click on countries below to add them to your route</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {countries.map(country => (
          <div 
            key={country.cca3} 
            onClick={() => addToRoute(country)}
            className="cursor-pointer hover:scale-105 transition-transform"
          >
            <CountryCard country={country} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryRoutePlanner;