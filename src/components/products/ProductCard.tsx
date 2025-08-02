import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Edit, Trash } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, onToggleFeatured }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 flex flex-col relative border ${product.isFeatured ? 'border-yellow-400' : 'border-gray-200'} h-full`}>
      {/* Badge de destacado */}
      {product.isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Destacado
          </div>
        </div>
      )}
      
      {/* Contenedor de imagen con aspect ratio */}
      <div className="relative w-full mb-3 overflow-hidden rounded-md bg-gray-100">
        <div className="aspect-square w-full">
          <img 
            src={product.imageUrl || product.image_url || 'https://placehold.co/300x300/f3f4f6/9ca3af?text=Sin+imagen'} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/300x300/f3f4f6/9ca3af?text=Sin+imagen';
            }}
          />
        </div>
      </div>
      
      {/* Contenido */}
      <div className="flex flex-col flex-1">
        {/* Nombre del producto */}
        <h3 className="text-sm font-semibold mb-1 line-clamp-2 leading-tight text-gray-900">
          {product.name}
        </h3>
        
        {/* Descripción */}
        {product.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-tight">
            {product.description}
          </p>
        )}
        
        {/* Categorías */}
        {product.categories && product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.slice(0, 2).map(cat => (
              <span key={cat} className="bg-fuddi-purple text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {cat}
              </span>
            ))}
            {product.categories.length > 2 && (
              <span className="text-xs text-gray-500 px-1">
                +{product.categories.length - 2}
              </span>
            )}
          </div>
        )}
        
        {/* Precio */}
        <div className="text-lg font-bold text-gray-900 mb-3 mt-auto">
          ${product.price?.toLocaleString() || '0'}
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-1 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-8 text-xs"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onDelete(product.id)}
          >
            <Trash className="h-3 w-3" />
          </Button>
          <Button 
            variant={product.isFeatured ? 'default' : 'outline'} 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => onToggleFeatured(product.id)}
          >
            <Star className={`h-3 w-3 ${product.isFeatured ? 'fill-yellow-400 text-yellow-500' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 