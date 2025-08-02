import React from 'react';
import { MapPin, CheckCircle, XCircle, Utensils } from 'lucide-react';
import { Business } from '@/data/mockClientData';
import { formatDistance } from '@/lib/utils';

interface BusinessCardProps {
  business: Business;
  onClick?: () => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onClick }) => {
  return (
    <div 
      className="business-card group overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-fuddi-purple/10 border-0 shadow-md cursor-pointer bg-white rounded-xl w-full mx-auto flex flex-col items-center p-2 sm:p-3 md:p-4 max-w-xs"
      style={{ minWidth: 0 }}
      onClick={onClick}
    >
      {/* Logo tamaño balanceado - ahora más grande y protagonista */}
      <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-2xl overflow-hidden border-2 border-fuddi-purple/10 bg-gray-50 mb-3 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105">
        <img 
          src={business.logo} 
          alt={business.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        {/* Modern status badge */}
        <div className="absolute top-2 left-2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm transition-colors duration-200 ${
            business.isOpen 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            <span className="w-2 h-2 rounded-full mr-1 inline-block" style={{ backgroundColor: business.isOpen ? '#22c55e' : '#ef4444' }}></span>
            {business.isOpen ? 'Abierto' : 'Cerrado'}
          </div>
        </div>
      </div>
      {/* Nombre y categoría */}
      <div className="w-full flex flex-col items-center text-center">
        <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 line-clamp-1 group-hover:text-fuddi-purple transition-colors mb-1">
          {business.name}
        </h3>
        <span className="text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-1">
          {business.category}
        </span>
      </div>
      {/* Distancia */}
      <div className="flex items-center justify-center gap-3 w-full mt-2">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>{business.distance > 0 ? formatDistance(business.distance) : 'N/A'}</span>
        </div>
      </div>
      

    </div>
  );
};

export default BusinessCard; 