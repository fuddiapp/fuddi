import React, { useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

interface FallbackAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectAddress?: (address: string, lat: number, lng: number, placeId?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

export const FallbackAddressInput: React.FC<FallbackAddressInputProps> = ({
  value,
  onChange,
  onSelectAddress,
  placeholder = 'Ingresa tu dirección manualmente',
  className,
  disabled,
  showIcon = true,
  variant = 'default'
}) => {
  const { toast } = useToast();
  const [isManualMode, setIsManualMode] = useState(false);

  const handleManualSave = () => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una dirección válida.",
        variant: "destructive",
      });
      return;
    }

    // En modo manual, no tenemos coordenadas precisas
    // Usamos coordenadas aproximadas de Santiago como fallback
    const fallbackCoords = {
      lat: -33.4489,
      lng: -70.6693,
    };

    if (onSelectAddress) {
      onSelectAddress(value.trim(), fallbackCoords.lat, fallbackCoords.lng);
    }

    toast({
      title: "Dirección guardada",
      description: "Tu dirección se ha guardado. Ten en cuenta que la precisión puede ser limitada sin el servicio de mapas.",
    });
  };

  const baseInputClasses = "w-full border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-fuddi-purple focus:border-transparent";
  const variantClasses = variant === 'compact' 
    ? "px-3 py-2 text-sm" 
    : "px-4 py-3 text-base";

  if (isManualMode) {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <div className="flex items-center gap-2 text-yellow-600 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Modo manual activado</span>
        </div>
        <div className="relative">
          {showIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <MapPin className="h-4 w-4" />
            </div>
          )}
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseInputClasses} ${variantClasses} ${showIcon ? 'pl-10' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            disabled={disabled}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleManualSave}
            size="sm"
            className="bg-fuddi-purple hover:bg-fuddi-purple-light"
            disabled={!value.trim() || disabled}
          >
            Guardar dirección
          </Button>
          <Button
            onClick={() => setIsManualMode(false)}
            variant="outline"
            size="sm"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-2 text-yellow-600 text-sm">
        <AlertTriangle className="h-4 w-4" />
        <span>Servicio de mapas no disponible</span>
      </div>
      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MapPin className="h-4 w-4" />
          </div>
        )}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ingresa tu dirección"
          className={`${baseInputClasses} ${variantClasses} ${showIcon ? 'pl-10' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          disabled={disabled}
        />
      </div>
      <Button
        onClick={() => setIsManualMode(true)}
        variant="outline"
        size="sm"
        className="w-full"
      >
        Continuar sin autocompletado
      </Button>
    </div>
  );
}; 