import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { formatPriceCLP } from '@/lib/formatters';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { uploadPromotionImage } from '@/integrations/supabase/promotions';
import { usePromotionsLimit } from '@/hooks/use-promotions-limit';
import type { AppPromotion } from '@/contexts/PromotionsContext';

interface PromotionFormProps {
  isEdit?: boolean;
  initialData?: Partial<AppPromotion>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const categories = [
  'Desayunos',
  'Almuerzos',
  'Snacks',
  'Dulces',
  'Bebidas',
  'Vegetariano',
  'Ensaladas',
  'Repostería',
  'Frutas/Naturales',
  'Bajo en calorías',
  'Café'
];

const PromotionForm = ({ 
  isEdit = false, 
  initialData, 
  onSubmit, 
  onCancel 
}: PromotionFormProps) => {
  const { toast } = useToast();
  const { limit, isLoading: limitLoading } = usePromotionsLimit();
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    originalPrice: initialData?.originalPrice || '',
    discountedPrice: initialData?.discountedPrice || '',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    category: initialData?.category || '',
    categories: initialData?.categories || [],
    image: initialData?.image || 'https://placehold.co/600x400?text=Upload+Image',
    isIndefinite: initialData?.isIndefinite || false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountedPrice: '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      category: '',
      categories: [],
      image: 'https://placehold.co/600x400?text=Upload+Image',
      isIndefinite: false,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleCategoriesChange = (category: string) => {
    setFormData(prev => {
      const currentCategories = prev.categories || [];
      const isSelected = currentCategories.includes(category);
      
      if (isSelected) {
        const newCategories = currentCategories.filter(c => c !== category);
        return { ...prev, categories: newCategories };
      } else {
        if (currentCategories.length < 2) {
          const newCategories = [...currentCategories, category];
          return { ...prev, categories: newCategories };
        }
        return prev;
      }
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  const handleIndefiniteChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      isIndefinite: checked,
      endDate: checked ? null : prev.endDate
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    
    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un título para la promoción",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar una descripción para la promoción",
        variant: "destructive",
      });
      return;
    }

    // Validación simplificada de categorías
    const hasCategories = (formData.categories && formData.categories.length > 0) || formData.category;
    
    if (!hasCategories) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una categoría",
        variant: "destructive",
      });
      return;
    }

    const originalPrice = parseFloat(formData.originalPrice as string) || 0;
    const discountedPrice = parseFloat(formData.discountedPrice as string) || 0;

    console.log('Precios:', { originalPrice, discountedPrice });

    if (originalPrice === 0) {
      console.log('Error: Precio original es 0');
      toast({
        title: "Error",
        description: "Debes ingresar un precio original",
        variant: "destructive",
      });
      return;
    }

    if (discountedPrice === 0) {
      toast({
        title: "Error",
        description: "Debes ingresar un precio con descuento",
        variant: "destructive",
      });
      return;
    }

    if (discountedPrice >= originalPrice) {
      toast({
        title: "Error",
        description: "El precio con descuento debe ser menor que el precio original",
        variant: "destructive",
      });
      return;
    }

    if (!formData.isIndefinite && formData.endDate && formData.startDate && formData.endDate <= formData.startDate) {
      toast({
        title: "Error",
        description: "La fecha de fin debe ser posterior a la fecha de inicio",
        variant: "destructive",
      });
      return;
    }

    try {
      // Subir imagen si se seleccionó un archivo
      let finalImageUrl = formData.image;
      
      if (imageFile) {
        toast({
          title: "Subiendo imagen",
          description: "Por favor espera mientras se sube la imagen...",
        });
        
        const fileName = `promotion_${Date.now()}_${imageFile.name}`;
        const uploadedImageUrl = await uploadPromotionImage(imageFile, fileName);
        
        if (!uploadedImageUrl) {
          toast({
            title: "Error",
            description: "No se pudo subir la imagen. Intenta de nuevo.",
            variant: "destructive",
          });
          return;
        }
        
        finalImageUrl = uploadedImageUrl;
        
        toast({
          title: "Imagen subida",
          description: "La imagen se subió correctamente",
        });
      }

      // Llamar a onSubmit con los datos procesados
      const processedData = {
        ...formData,
        originalPrice,
        discountedPrice,
        endDate: formData.isIndefinite ? null : formData.endDate,
        image: finalImageUrl,
      };
      
      onSubmit(processedData);

      // Limpiar el formulario después de enviar
      clearForm();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la promoción. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Editar Promoción' : 'Crear Nueva Promoción'}</CardTitle>
        <CardDescription>
          {isEdit 
            ? 'Actualiza los detalles de tu promoción existente'
            : 'Completa los detalles para crear una nueva promoción para tus clientes'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Promoción</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Oferta Especial de Fin de Semana"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe tu promoción de manera atractiva..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Imagen de la Promoción</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate as Date}
                        onSelect={(date) => handleDateChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={formData.isIndefinite}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          (!formData.endDate || formData.isIndefinite) && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.isIndefinite 
                          ? "Indefinida" 
                          : formData.endDate 
                            ? format(formData.endDate, "PPP") 
                            : "Seleccionar fecha"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate as Date}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIndefinite"
                  checked={formData.isIndefinite}
                  onCheckedChange={handleIndefiniteChange}
                />
                <Label htmlFor="isIndefinite" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Promoción indefinida (sin fecha de fin)
                </Label>
              </div>
              
              {formData.isIndefinite && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Promoción indefinida:</strong> Esta promoción estará activa hasta que decidas eliminarla manualmente.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="categories">Categorías (máximo 2)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => {
                    const isSelected = (formData.categories || []).includes(category);
                    const isDisabled = !isSelected && (formData.categories || []).length >= 2;
                    
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoriesChange(category)}
                        disabled={isDisabled}
                        className={`p-2 text-sm rounded-md border transition-colors ${
                          isSelected 
                            ? 'bg-fuddi-purple text-white border-fuddi-purple' 
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Seleccionadas: {(formData.categories || []).length}/2
                </p>
              </div>


            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Precio Original (CLP)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Precio con Descuento (CLP)</Label>
                <Input
                  id="discountedPrice"
                  name="discountedPrice"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.discountedPrice}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Imagen de la Promoción</Label>
                <div className="border rounded-md overflow-hidden">
                  <img 
                    src={imagePreview || formData.image} 
                    alt="Vista previa de la promoción" 
                    className="w-full h-64 object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Tamaño recomendado: 1200x800px. Tamaño máximo: 5MB.
                </p>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h4 className="font-medium mb-2">Vista Previa de la Promoción</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Descuento:</span>{' '}
                    {(() => {
                      const original = parseFloat(formData.originalPrice as string) || 0;
                      const discounted = parseFloat(formData.discountedPrice as string) || 0;
                      return original > 0 
                        ? Math.round(((original - discounted) / original) * 100) 
                        : 0;
                    })()}%
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Precio:</span>{' '}
                    <span className="line-through">{formatPriceCLP(parseFloat(formData.originalPrice as string) || 0)}</span>{' '}
                    <span className="text-fuddi-purple font-bold">{formatPriceCLP(parseFloat(formData.discountedPrice as string) || 0)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Categorías:</span>{' '}
                    {(formData.categories || []).length > 0 
                      ? (formData.categories || []).join(', ')
                      : 'Sin categorías seleccionadas'
                    }
                  </p>

                  <p className="text-sm">
                    <span className="font-medium">Duración:</span>{' '}
                    {formData.isIndefinite 
                      ? 'Indefinida (sin fecha de fin)'
                      : formData.startDate && formData.endDate
                        ? `${format(formData.startDate, "MMM d")} - ${format(formData.endDate, "MMM d, yyyy")}`
                        : 'Selecciona fechas'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-fuddi-purple hover:bg-fuddi-purple-light"
              disabled={!isEdit && (limitLoading || limit.isAtLimit || limit.isOverLimit)}
            >
              {isEdit ? 'Actualizar Promoción' : 'Crear Promoción'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromotionForm;
