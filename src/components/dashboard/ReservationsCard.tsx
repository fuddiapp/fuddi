import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBusinessReservations, updateReservationStatus } from '@/integrations/supabase/menu-reservations';

interface Reservation {
  id: string;
  client_name: string;
  client_first_name?: string;
  client_last_name?: string;
  menu_name: string;
  menu_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

interface ReservationsCardProps {
  businessId: string;
}

const ReservationsCard: React.FC<ReservationsCardProps> = ({ businessId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar reservas
  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      try {
        const reservationsData = await getBusinessReservations(businessId);
        setReservations(reservationsData);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
        // Si hay error, probablemente la tabla no existe aún, mostrar array vacío
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [businessId]);

  const handleUpdateStatus = async (reservationId: string, newStatus: 'confirmed' | 'cancelled') => {
    setUpdatingStatus(reservationId);
    try {
      await updateReservationStatus(reservationId, newStatus);
      
      // Actualizar la lista local
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );

      toast({
        title: 'Estado actualizado',
        description: `Reserva ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} exitosamente`,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Completada</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservas de Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Cargando reservas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reservas de Hoy
          </span>
          <Badge variant="outline" className="text-lg px-3 py-1 bg-fuddi-purple/10 text-fuddi-purple border-fuddi-purple/30">
            {reservations.length} reservas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay reservas para hoy</p>
            <p className="text-sm text-gray-400 mt-1">
              Las reservas aparecerán aquí cuando los clientes reserven tus menús
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => {
              const nombre = reservation.client_first_name || reservation.client_name?.split(' ')[0] || '';
              const apellido = reservation.client_last_name || reservation.client_name?.split(' ')[1] || '';
              return (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between gap-4 border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <span className="font-semibold text-base text-fuddi-purple/90 truncate">{nombre} {apellido}</span>
                    <span className="font-bold text-lg text-gray-900 truncate">{reservation.menu_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm min-w-fit">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(reservation.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationsCard; 