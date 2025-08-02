import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Utensils, Star, Heart } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface RedemptionSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  promotionName: string;
  businessName: string;
  redemptionAmount: number;
}

const RedemptionSuccess: React.FC<RedemptionSuccessProps> = ({
  isOpen,
  onClose,
  promotionName,
  businessName,
  redemptionAmount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center p-6">
          {/* Icono de éxito animado */}
          <div className="mb-6">
            <div className="relative inline-block">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Star className="h-8 w-8 text-yellow-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Título principal */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 ¡Promoción Canjeada!
          </h2>

          {/* Mensaje motivacional */}
          <p className="text-lg text-gray-700 mb-4">
            ¡Disfruta tu pedido! 🍕🍔🍟
          </p>

          {/* Información de la promoción */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
            <div className="flex items-center justify-center mb-2">
              <Utensils className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">{promotionName}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              en <span className="font-medium">{businessName}</span>
            </p>
            <p className="text-lg font-bold text-green-600">
              ${redemptionAmount.toLocaleString('es-CL')}
            </p>
          </div>

          {/* Mensaje para la cajera */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">📋</span>
              <p className="text-sm text-blue-800 font-bold">
                MUESTRA EN CAJA
              </p>
            </div>
            <p className="text-xs text-blue-700 text-center">
              Para verificar que tu promoción fue canjeada correctamente
            </p>
          </div>

          {/* Emojis de comida decorativos */}
          <div className="flex justify-center space-x-2 mb-6 text-2xl">
            <span>🍕</span>
            <span>🍔</span>
            <span>🍟</span>
            <span>🥤</span>
            <span>🍰</span>
          </div>

          {/* Botón para continuar */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
          >
            <Heart className="h-4 w-4 mr-2" />
            ¡Seguir explorando ofertas!
          </Button>

          {/* Mensaje adicional */}
          <p className="text-xs text-gray-500 mt-4">
            ¡Gracias por usar Fuddi! 💜
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionSuccess; 