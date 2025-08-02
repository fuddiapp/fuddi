import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menusDiaService } from '@/integrations/supabase/menus-dia';

interface CleanupStatus {
  date: string;
  menus: {
    current: number;
    expired: number;
    total: number;
  };
  reservations: {
    current: number;
    expired: number;
    total: number;
  };
  needs_cleanup: boolean;
  timestamp: string;
}

interface DailyMenuCleanupCardProps {
  businessId?: string;
}

export function DailyMenuCleanupCard({ businessId }: DailyMenuCleanupCardProps) {
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const { toast } = useToast();

  // Cargar estado de limpieza
  const loadCleanupStatus = async () => {
    try {
      setLoading(true);
      const status = await menusDiaService.getCleanupStatus();
      setCleanupStatus(status);
    } catch (error) {
      console.error('Error loading cleanup status:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el estado de limpieza",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar limpieza manual
  const executeCleanup = async () => {
    try {
      setCleaning(true);
      const result = await menusDiaService.executeCleanup();
      
      toast({
        title: "Limpieza completada",
        description: `Se eliminaron ${result.deleted_menus} menús y ${result.deleted_reservations} reservas expiradas`,
      });
      
      // Recargar estado
      await loadCleanupStatus();
    } catch (error) {
      console.error('Error executing cleanup:', error);
      toast({
        title: "Error",
        description: "No se pudo ejecutar la limpieza",
        variant: "destructive",
      });
    } finally {
      setCleaning(false);
    }
  };

  // Cargar estado al montar el componente
  useEffect(() => {
    loadCleanupStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Limpieza de Menús del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando estado...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cleanupStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Limpieza de Menús del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se pudo cargar el estado de limpieza
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpieza de Menús del Día
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado general */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Última verificación: {new Date(cleanupStatus.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCleanupStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Estadísticas de menús */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cleanupStatus.menus.current}
            </div>
            <div className="text-sm text-gray-600">Menús vigentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {cleanupStatus.menus.expired}
            </div>
            <div className="text-sm text-gray-600">Menús expirados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {cleanupStatus.menus.total}
            </div>
            <div className="text-sm text-gray-600">Total menús</div>
          </div>
        </div>

        {/* Estadísticas de reservas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cleanupStatus.reservations.current}
            </div>
            <div className="text-sm text-gray-600">Reservas vigentes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {cleanupStatus.reservations.expired}
            </div>
            <div className="text-sm text-gray-600">Reservas expiradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {cleanupStatus.reservations.total}
            </div>
            <div className="text-sm text-gray-600">Total reservas</div>
          </div>
        </div>

        {/* Estado de limpieza */}
        {cleanupStatus.needs_cleanup ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Hay {cleanupStatus.menus.expired} menús y {cleanupStatus.reservations.expired} reservas expiradas que pueden ser eliminadas.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No hay elementos expirados. Todo está actualizado.
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de limpieza */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>• Los menús se eliminan automáticamente al finalizar el día</p>
            <p>• Las reservas asociadas también se eliminan automáticamente</p>
            <p>• Puedes ejecutar limpieza manual si es necesario</p>
          </div>
          
          <Button
            onClick={executeCleanup}
            disabled={cleaning || !cleanupStatus.needs_cleanup}
            variant={cleanupStatus.needs_cleanup ? "destructive" : "outline"}
          >
            {cleaning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Limpiando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar expirados
              </>
            )}
          </Button>
        </div>

        {/* Badge de estado */}
        <div className="flex justify-center">
          <Badge variant={cleanupStatus.needs_cleanup ? "destructive" : "default"}>
            {cleanupStatus.needs_cleanup ? "Necesita limpieza" : "Todo actualizado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 