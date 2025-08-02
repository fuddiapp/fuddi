import React, { useState } from 'react';
import { Filter, X, DollarSign, MapPin, Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterOptions {
  priceRange: [number, number];
  maxDistance: number;
  minRating: number;
  availability: 'all' | 'available' | 'ending-soon';
  sortBy: 'popularity' | 'price' | 'distance' | 'rating';
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [value[0], value[1]]
    });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxDistance: value[0]
    });
  };

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minRating: value[0]
    });
  };

  const handleAvailabilityChange = (availability: FilterOptions['availability']) => {
    onFiltersChange({
      ...filters,
      availability
    });
  };

  const handleSortByChange = (sortBy: FilterOptions['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
    if (filters.maxDistance < 10) count++;
    if (filters.minRating > 0) count++;
    if (filters.availability !== 'all') count++;
    if (filters.sortBy !== 'popularity') count++;
    return count;
  };

  const clearAllFilters = () => {
    onClearFilters();
    setIsOpen(false);
  };

  const getActiveFiltersSummary = () => {
    const summaries = [];
    
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) {
      summaries.push(`Precio: $${filters.priceRange[0].toLocaleString()}-${filters.priceRange[1].toLocaleString()}`);
    }
    
    if (filters.maxDistance < 10) {
      summaries.push(`${filters.maxDistance} km`);
    }
    
    if (filters.minRating > 0) {
      summaries.push(`⭐ ${filters.minRating}+`);
    }
    
    if (filters.availability !== 'all') {
      const availabilityLabels = {
        'available': 'Disponibles',
        'ending-soon': 'Por terminar'
      };
      summaries.push(availabilityLabels[filters.availability]);
    }
    
    return summaries.slice(0, 2).join(' • ');
  };

  return (
    <div className="w-full">
      {/* Filtro compacto para desktop */}
      <div className="hidden lg:block">
        <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
          <div className="flex items-center gap-2 mb-4">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            {getActiveFiltersCount() > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
                <span className="text-sm text-muted-foreground">
                  {getActiveFiltersSummary()}
                </span>
              </>
            )}
          </div>

          <CollapsibleContent className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <FilterContent
                  filters={filters}
                  onPriceChange={handlePriceChange}
                  onDistanceChange={handleDistanceChange}
                  onRatingChange={handleRatingChange}
                  onAvailabilityChange={handleAvailabilityChange}
                  onSortByChange={handleSortByChange}
                  onClearFilters={onClearFilters}
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Filtro para móvil */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2 mb-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[350px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avanzados
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <FilterContent
                  filters={filters}
                  onPriceChange={handlePriceChange}
                  onDistanceChange={handleDistanceChange}
                  onRatingChange={handleRatingChange}
                  onAvailabilityChange={handleAvailabilityChange}
                  onSortByChange={handleSortByChange}
                  onClearFilters={clearAllFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {getActiveFiltersCount() > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {getActiveFiltersSummary()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterContentProps {
  filters: FilterOptions;
  onPriceChange: (value: number[]) => void;
  onDistanceChange: (value: number[]) => void;
  onRatingChange: (value: number[]) => void;
  onAvailabilityChange: (availability: FilterOptions['availability']) => void;
  onSortByChange: (sortBy: FilterOptions['sortBy']) => void;
  onClearFilters: () => void;
}

const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  onPriceChange,
  onDistanceChange,
  onRatingChange,
  onAvailabilityChange,
  onSortByChange,
  onClearFilters
}) => {
  return (
    <div className="space-y-4">
      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Ordenar por
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'popularity', label: 'Popularidad' },
            { value: 'price', label: 'Precio' },
            { value: 'distance', label: 'Distancia' },
            { value: 'rating', label: 'Rating' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={filters.sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortByChange(option.value as FilterOptions['sortBy'])}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Rango de Precio
        </h3>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={onPriceChange}
            max={50000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>${filters.priceRange[0].toLocaleString()}</span>
            <span>${filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Distancia Máxima: {filters.maxDistance} km
        </h3>
        <div className="px-2">
          <Slider
            value={[filters.maxDistance]}
            onValueChange={onDistanceChange}
            max={10}
            min={0.5}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Rating Mínimo: {filters.minRating}
        </h3>
        <div className="px-2">
          <Slider
            value={[filters.minRating]}
            onValueChange={onRatingChange}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Disponibilidad
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'available', label: 'Disponibles' },
            { value: 'ending-soon', label: 'Por terminar' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={filters.availability === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onAvailabilityChange(option.value as FilterOptions['availability'])}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" onClick={onClearFilters} className="w-full">
        <X className="h-4 w-4 mr-2" />
        Limpiar Filtros
      </Button>
    </div>
  );
};

export default AdvancedFilters; 