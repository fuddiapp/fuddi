import React from 'react';
import PromotionForm from '@/components/promotions/PromotionForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePromotions } from '@/contexts/PromotionsContext';
import { usePromotionsLimit } from '@/hooks/use-promotions-limit';
import { PromotionsLimitCounter } from '@/components/business/PromotionsLimitCounter';
import type { AppPromotion } from '@/contexts/PromotionsContext';

const NewPromotionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addPromotion } = usePromotions();
  const { checkCanCreatePromotion, showLimitReachedError, limit } = usePromotionsLimit();

  const handleSubmit = async (data: any) => {
    try {
      // Verificar límite de promociones antes de crear
      const canCreate = await checkCanCreatePromotion();
      if (!canCreate) {
        showLimitReachedError();
        return;
      }

      // Procesar categorías - asegurar que siempre sea un array válido
      let categories = [];
      if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
        categories = data.categories;
      } else if (data.category) {
        categories = [data.category];
      } else {
        throw new Error('Debe seleccionar al menos una categoría');
      }
      
      // Convertir las fechas a formato string para el contexto
      const promotionData: Omit<AppPromotion, 'id' | 'views' | 'redemptions' | 'createdAt'> = {
        title: data.title,
        description: data.description,
        image: data.image,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
        category: categories[0], // Usar la primera categoría como categoría principal
        categories: categories,
        isIndefinite: data.isIndefinite,
      };

      // Agregar la promoción al contexto (ahora es async)
      await addPromotion(promotionData);
      
      // Mostrar toast de confirmación
      toast({
        title: "¡Promoción creada!",
        description: "La promoción se ha creado exitosamente y ya está disponible.",
      });
      
      // Navegar al dashboard después de un breve delay para que se vea el toast
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
      
    } catch (error) {
      console.error('Error al crear la promoción:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un problema al crear la promoción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Crear Nueva Promoción</h1>
          <p className="text-muted-foreground">
            Completa el formulario para crear una nueva promoción
          </p>
        </div>

        {/* Contador de límite de promociones */}
        <div className="mb-6">
          <PromotionsLimitCounter showAlert={true} />
        </div>
        
        <PromotionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewPromotionPage;
