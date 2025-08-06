import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PromotionCard from '@/components/promotions/PromotionCard';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromotions } from '@/contexts/PromotionsContext';
import { PromotionsLimitMini } from '@/components/business/PromotionsLimitMini';

const categories = [
  'Todas',
  'Desayunos',
  'Almuerzos', 
  'Snacks',
  'Dulces',
  'Bebidas'
];

const PromotionsPage = () => {
  const navigate = useNavigate();
  const { promotions, deletePromotion } = usePromotions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const handleEditPromotion = (id: string) => {
    navigate(`/promotions/edit/${id}`);
  };

  const handleDeletePromotion = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      deletePromotion(id);
    }
  };

  // Filtrar promociones
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || 
                           promotion.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Filtrar promociones activas e inactivas
  const now = new Date();
  const activePromotions = filteredPromotions.filter(promotion => {
    const startDate = new Date(promotion.startDate);
    if (promotion.isIndefinite) return startDate <= now;
    if (!promotion.endDate) return startDate <= now;
    const endDate = new Date(promotion.endDate);
    return startDate <= now && endDate >= now;
  });
  const inactivePromotions = filteredPromotions.filter(promotion => {
    const startDate = new Date(promotion.startDate);
    if (promotion.isIndefinite) return startDate > now;
    if (!promotion.endDate) return startDate > now;
    const endDate = new Date(promotion.endDate);
    return endDate < now;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todas tus promociones y ofertas especiales
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Contador de límite de promociones */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <PromotionsLimitMini />
            </div>
            <Button 
              onClick={() => navigate('/promotions/new')}
              className="bg-fuddi-purple hover:bg-fuddi-purple/90 text-white px-6 py-2 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Promoción
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-fuddi-purple" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Buscar promociones</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por título o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-fuddi-purple focus:ring-fuddi-purple"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Categoría</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-gray-200 focus:border-fuddi-purple focus:ring-fuddi-purple">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promotions List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Promociones Activas ({activePromotions.length})</CardTitle>
                <CardDescription className="mt-1">
                  {activePromotions.length > 0 
                    ? `Mostrando ${activePromotions.length} promoción${activePromotions.length !== 1 ? 'es' : ''} activas`
                    : 'No hay promociones activas para mostrar'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activePromotions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activePromotions.map(promotion => (
                  <PromotionCard
                    key={promotion.id}
                    {...promotion}
                    onEdit={handleEditPromotion}
                    onDelete={handleDeletePromotion}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay promociones activas.
                  </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Promociones Inactivas ({inactivePromotions.length})</CardTitle>
                <CardDescription className="mt-1">
                  {inactivePromotions.length > 0 
                    ? `Mostrando ${inactivePromotions.length} promoción${inactivePromotions.length !== 1 ? 'es' : ''} inactivas`
                    : 'No hay promociones inactivas para mostrar'
                      }
                </CardDescription>
              </div>
                  </div>
          </CardHeader>
          <CardContent>
            {inactivePromotions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inactivePromotions.map(promotion => (
                  <PromotionCard
                    key={promotion.id}
                    {...promotion}
                    onEdit={handleEditPromotion}
                    onDelete={handleDeletePromotion}
                  />
                ))}
                </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay promociones inactivas.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PromotionsPage;
