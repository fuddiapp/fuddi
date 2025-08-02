import { supabase } from './client';
import { getCurrentDate } from '@/lib/utils';

export interface MenuReservation {
  id: string;
  menu_id: string;
  client_id: string;
  business_id: string;
  client_name: string;
  menu_name: string;
  menu_price: number;
  reservation_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateReservationData {
  menu_id: string;
  client_id: string;
  business_id: string;
  client_name: string;
  menu_name: string;
  menu_price: number;
}

// Crear una nueva reserva
export async function createReservation(data: CreateReservationData): Promise<MenuReservation> {
  // Usar any para evitar errores de tipos hasta que la tabla esté creada
  const { data: reservation, error } = await (supabase as any)
    .from('menu_reservations')
    .insert({
      ...data,
      reservation_date: getCurrentDate(),
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear la reserva: ${error.message}`);
  }

  return reservation;
}

// Obtener reservas de un cliente
export async function getClientReservations(clientId: string): Promise<MenuReservation[]> {
  const { data: reservations, error } = await (supabase as any)
    .from('menu_reservations')
    .select('*')
    .eq('client_id', clientId)
    .eq('reservation_date', getCurrentDate())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener las reservas: ${error.message}`);
  }

  return (reservations || []) as MenuReservation[];
}

// Obtener reservas de un negocio para hoy
export async function getBusinessReservations(businessId: string): Promise<MenuReservation[]> {
  // Primero obtener las reservas
  const { data: reservations, error } = await (supabase as any)
    .from('menu_reservations')
    .select('*')
    .eq('business_id', businessId)
    .eq('reservation_date', getCurrentDate())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener las reservas del negocio: ${error.message}`);
  }

  if (!reservations || reservations.length === 0) {
    return [];
  }

  // Obtener los IDs únicos de clientes
  const clientIds = [...new Set(reservations.map((r: any) => r.client_id))];

  // Obtener datos de los clientes
  const { data: clients, error: clientsError } = await (supabase as any)
    .from('clients')
    .select('id, first_name, last_name')
    .in('id', clientIds);

  if (clientsError) {
    console.warn('No se pudieron obtener datos de clientes:', clientsError);
  }

  // Crear un mapa de clientes por ID
  const clientsMap = new Map();
  if (clients) {
    clients.forEach((client: any) => {
      clientsMap.set(client.id, client);
    });
  }

  // Combinar reservas con datos de clientes
  return reservations.map((reservation: any) => {
    const client = clientsMap.get(reservation.client_id);
    return {
      ...reservation,
      client_first_name: client?.first_name || '',
      client_last_name: client?.last_name || ''
    };
  }) as MenuReservation[];
}

// Obtener el conteo de reservas de un negocio para hoy
export async function getBusinessReservationsCount(businessId: string): Promise<number> {
  const { data, error } = await (supabase as any)
    .rpc('get_business_reservations_count', {
      business_uuid: businessId,
      reservation_date: getCurrentDate()
    });

  if (error) {
    throw new Error(`Error al obtener el conteo de reservas: ${error.message}`);
  }

  return data || 0;
}

// Actualizar el estado de una reserva
export async function updateReservationStatus(
  reservationId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  const { error } = await (supabase as any)
    .from('menu_reservations')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', reservationId);

  if (error) {
    throw new Error(`Error al actualizar el estado de la reserva: ${error.message}`);
  }
}

// Verificar si un cliente ya tiene una reserva para un menú específico
export async function checkExistingReservation(
  clientId: string, 
  menuId: string
): Promise<boolean> {
  const { data, error } = await (supabase as any)
    .from('menu_reservations')
    .select('id')
    .eq('client_id', clientId)
    .eq('menu_id', menuId)
    .eq('reservation_date', getCurrentDate())
    .eq('status', 'pending')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Error al verificar reserva existente: ${error.message}`);
  }

  return !!data;
}

// Limpiar reservas antiguas (para uso administrativo)
export async function cleanupOldReservations(): Promise<void> {
  const { error } = await (supabase as any)
    .rpc('cleanup_old_reservations');

  if (error) {
    throw new Error(`Error al limpiar reservas antiguas: ${error.message}`);
  }
} 