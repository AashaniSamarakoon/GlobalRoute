import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CountryCard from './CountryCard';

export const SortableCountryItem = ({ id, country, index, list }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: { list } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="flex items-center">
          <span className="text-blue-600 font-medium mr-3">{index + 1}.</span>
          <img 
            src={country.flags.svg} 
            alt={country.name.common} 
            className="w-10 h-7 object-cover mr-3"
          />
          <span className="font-medium">{country.name.common}</span>
        </div>
      </div>
    </div>
  );
};

export const CountryItem = ({ id, country, isDragging, list }) => {
  return (
    <div data-id={id} data-list={list}>
      <CountryCard country={country} isDragging={isDragging} />
    </div>
  );
};