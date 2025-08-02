import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  menuName: string;
  menuPrice: number;
  businessName: string;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  menuName,
  menuPrice,
  businessName
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Confirmar Reserva
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mensaje de responsabilidad */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 leading-relaxed">
              <strong>Reserva responsablemente.</strong> El negocio recibirá tu solicitud y preparará tu pedido en base a ella. 
              Haz la reserva solo si estás seguro.
            </p>
          </div>

          {/* Detalles de la reserva */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Menú:</span>
              <span className="font-medium">{menuName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Negocio:</span>
              <span className="font-medium">{businessName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="font-medium text-green-600">
                ${menuPrice.toLocaleString('es-CL')}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Reserva
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal; 