import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Utensils, Calendar } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
}

interface MenuCardProps {
  menu: MenuItem;
  onEdit?: (menu: MenuItem) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  onReserve?: (menu: MenuItem) => void;
  showReserveButton?: boolean;
  businessName?: string;
}

export const MenuCard: React.FC<MenuCardProps> = ({ 
  menu, 
  onEdit, 
  onDelete, 
  showActions = false,
  onReserve,
  showReserveButton = false,
  businessName
}) => {
  const formatPrice = (price?: number) => {
    if (!price) return null;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDescriptionAsList = (description: string) => {
    if (!description) return null;

    // Dividir la descripción por diferentes separadores comunes
    const items = description
      .split(/[,.\n-]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length > 2); // Filtrar items muy cortos

    if (items.length === 0) {
      return <p className="text-gray-600 text-sm leading-relaxed">{description}</p>;
    }

    if (items.length === 1) {
      return <p className="text-gray-600 text-sm leading-relaxed">{description}</p>;
    }

  return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Incluye:</h4>
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-600 text-sm">
              <div className="flex-shrink-0 w-2 h-2 bg-fuddi-purple rounded-full mt-2"></div>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
    </div>
  );
};

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-fuddi-purple bg-gradient-to-br from-white to-purple-50">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-white rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-2 bg-fuddi-purple rounded-full">
              <Utensils className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
              {menu.name}
            </CardTitle>
          </div>
          {menu.price && (
            <Badge variant="secondary" className="bg-green-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-sm">
              {formatPrice(menu.price)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          {formatDescriptionAsList(menu.description)}
        </div>
        
        {/* Botón de reserva para clientes */}
        {showReserveButton && onReserve && (
          <div className="pt-3 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <Button
              onClick={() => onReserve(menu)}
              className="w-full bg-fuddi-purple hover:bg-fuddi-purple/90 text-white font-medium py-2.5 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Reservar
            </Button>
          </div>
        )}

        {/* Botones de acción para negocios */}
        {showActions && onEdit && onDelete && (
          <div className="flex gap-2 pt-3 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(menu)}
              className="flex-1 text-fuddi-purple border-fuddi-purple hover:bg-fuddi-purple hover:text-white transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(menu.id)}
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 