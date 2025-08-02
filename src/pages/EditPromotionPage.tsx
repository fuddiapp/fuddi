import React from 'react';
import PromotionForm from '@/components/promotions/PromotionForm';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { usePromotions } from '@/contexts/PromotionsContext';

const EditPromotionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { promotions, updatePromotion } = usePromotions();

  // Encontrar la promoción a editar
  const promotion = promotions.find(p => p.id === id);

  if (!promotion) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Promoción no encontrada</h1>
            <p className="text-muted-foreground mt-2">
              La promoción que buscas no existe o ha sido eliminada.
            </p>
            <button 
              onClick={() => navigate('/promotions')}
              className="mt-4 px-4 py-2 bg-fuddi-purple text-white rounded-md hover:bg-fuddi-purple-light"
            >
              Volver a Promociones
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (data: any) => {
    // Convertir las fechas a formato string para el contexto
    const promotionData = {
      ...data,
      startDate: data.startDate.toISOString().split('T')[0],
      endDate: data.endDate ? data.endDate.toISOString().split('T')[0] : null,
    };

    // Actualizar la promoción en el contexto
    updatePromotion(id, promotionData);
    
    // Mostrar mensaje de éxito
    toast({
      title: "Promoción actualizada",
      description: "La promoción se ha actualizado exitosamente",
    });
    
    // Navegar de vuelta a promociones
    navigate('/promotions');
  };

  const handleCancel = () => {
    navigate('/promotions');
  };

  // Preparar los datos iniciales para el formulario
  const initialData = {
    ...promotion,
    startDate: new Date(promotion.startDate),
    endDate: promotion.endDate ? new Date(promotion.endDate) : null,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Editar Promoción</h1>
          <p className="text-muted-foreground">
            Modifica los detalles de tu promoción
          </p>
        </div>
        
        <PromotionForm
          isEdit={true}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </DashboardLayout>
  );
};

export default EditPromotionPage;
