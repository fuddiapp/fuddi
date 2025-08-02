import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DatabaseSetupAlertProps {
  onDismiss?: () => void;
}

const DatabaseSetupAlert = ({ onDismiss }: DatabaseSetupAlertProps) => {
  const sqlScript = `
-- Crear tabla de promociones
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_price INTEGER NOT NULL,
  discounted_price INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  category TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  redemptions INTEGER NOT NULL DEFAULT 0,
  is_indefinite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_promotions_business_id ON public.promotions(business_id);
CREATE INDEX IF NOT EXISTS idx_promotions_start_date ON public.promotions(start_date);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON public.promotions(end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_category ON public.promotions(category);
CREATE INDEX IF NOT EXISTS idx_promotions_is_indefinite ON public.promotions(is_indefinite);
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON public.promotions(created_at);

-- Habilitar RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Businesses can view their own promotions" 
  ON public.promotions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Businesses can create their own promotions" 
  ON public.promotions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Businesses can update their own promotions" 
  ON public.promotions 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Businesses can delete their own promotions" 
  ON public.promotions 
  FOR DELETE 
  USING (true);
`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      toast({
        title: "SQL copiado",
        description: "El script SQL se ha copiado al portapapeles",
      });
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/dhenyvmpcxeoqournewp/sql', '_blank');
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTitle className="text-orange-800">
        ⚠️ Configuración de Base de Datos Requerida
      </AlertTitle>
      <AlertDescription className="text-orange-700 space-y-4">
        <p>
          La tabla de promociones no existe en tu base de datos de Supabase. 
          Para usar las promociones, necesitas crear la tabla manualmente.
        </p>
        
        <div className="space-y-2">
          <p className="font-medium">Pasos para configurar:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Ve al dashboard de Supabase</li>
            <li>Navega a la sección SQL Editor</li>
            <li>Copia y pega el siguiente script SQL</li>
            <li>Ejecuta el script</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={copyToClipboard}
            variant="outline" 
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar SQL
          </Button>
          
          <Button 
            onClick={openSupabaseDashboard}
            variant="outline" 
            size="sm"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Supabase
          </Button>
          
          {onDismiss && (
            <Button 
              onClick={onDismiss}
              variant="ghost" 
              size="sm"
              className="text-orange-600 hover:bg-orange-100"
            >
              Cerrar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DatabaseSetupAlert; 