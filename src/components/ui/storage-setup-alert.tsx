import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StorageSetupAlertProps {
  onDismiss?: () => void;
}

const StorageSetupAlert = ({ onDismiss }: StorageSetupAlertProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "El comando se copió al portapapeles",
    });
  };

  const openSupabaseDashboard = () => {
    window.open("https://supabase.com/dashboard", "_blank");
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTitle className="text-orange-800">
        Configuración de Storage Requerida
      </AlertTitle>
      <AlertDescription className="text-orange-700 space-y-4">
        <p>
          Para que las promociones funcionen correctamente, necesitas configurar el bucket de storage en Supabase.
        </p>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Pasos para configurar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Ve al dashboard de Supabase</li>
            <li>Navega a Storage en el menú lateral</li>
            <li>Crea un nuevo bucket llamado "promotions"</li>
            <li>Configura el bucket como público</li>
            <li>Establece el límite de tamaño de archivo a 5MB</li>
            <li>Permite los tipos MIME: image/jpeg, image/png, image/webp, image/gif</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Políticas de Storage:</h4>
          <p className="text-sm">
            Después de crear el bucket, ejecuta la migración de políticas de storage:
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-orange-100 px-2 py-1 rounded text-sm flex-1">
              supabase db push
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard("supabase db push")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openSupabaseDashboard}
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Dashboard
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-orange-600 hover:bg-orange-100"
            >
              Entendido
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default StorageSetupAlert; 