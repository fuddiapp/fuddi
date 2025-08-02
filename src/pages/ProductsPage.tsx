import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Plus, Upload, Search, Filter, Package } from 'lucide-react';
import ProductForm from '../components/products/ProductForm';
import ProductCard from '../components/products/ProductCard';
import ImportProductsForm from '../components/products/ImportProductsForm';
import DashboardLayout from '../components/layout/DashboardLayout';
import { createProduct, updateProduct, deleteProduct, getProducts, Product as SupaProduct } from '@/integrations/supabase/products';
import { useAuth } from '@/contexts/AuthContext';

const initialProducts = [];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();


  useEffect(() => {
    async function fetchProducts() {
      try {
        if (!user?.id) return;
        const productos = await getProducts(user.id);
        
        // Mapear los productos para asegurar que isFeatured esté correctamente definido
        const mappedProducts = productos.map(product => ({
          ...product,
          isFeatured: product.is_featured || false
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        // Puedes mostrar un error si lo deseas
        console.error('Error al cargar productos desde Supabase', err);
      }
    }
    fetchProducts();
  }, [user]);

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Función helper para normalizar categorías
    const normalizeCategories = (categories) => {
      if (!categories) return [];
      if (typeof categories === 'string') {
        // Si es string, intentar parsear como JSON o dividir por comas
        try {
          const parsed = JSON.parse(categories);
          return Array.isArray(parsed) ? parsed.map(cat => cat.trim()) : [categories.trim()];
        } catch {
          return categories.split(',').map(cat => cat.trim()).filter(cat => cat);
        }
      }
      if (Array.isArray(categories)) {
        return categories.map(cat => cat.trim()).filter(cat => cat);
      }
      return [];
    };
    
    // Normalizar las categorías del producto
    const productCategories = normalizeCategories(product.categories);
    
    // Verificar si coincide con la categoría seleccionada
    const matchesCategory = !selectedCategory || 
      productCategories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Destacados
  const featuredProducts = filteredProducts.filter(p => p.is_featured);
  const regularProducts = filteredProducts.filter(p => !p.is_featured);

  // Handlers
  const handleAddProduct = async (product) => {
    try {
      // El producto ya se guardó en Supabase desde el formulario
      // Solo actualizamos el estado local
      setProducts(prev => [product, ...prev]);
      setFormOpen(false);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      alert('Error al agregar el producto');
    }
  };

  const handleEditProduct = async (product) => {
    try {
      // Actualizar en Supabase
      await updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url || product.imageUrl,
        categories: product.categories,
        is_featured: product.is_featured || product.isFeatured
      });
      
      // Actualizar estado local
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      setFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error al editar producto:', error);
      alert('Error al editar el producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        // Eliminar de Supabase
        await deleteProduct(id);
        
        // Actualizar estado local
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      // Encontrar el producto actual
      const currentProduct = products.find(p => p.id === id);
      if (!currentProduct) return;
      
      // Obtener el estado actual de is_featured
      const currentFeaturedStatus = currentProduct.is_featured;
      const newFeaturedStatus = !currentFeaturedStatus;
      
      // Verificar límite de productos destacados
      const featuredCount = products.filter(p => p.is_featured).length;
      
      if (newFeaturedStatus && featuredCount >= 10) {
        alert('Solo puedes tener máximo 10 productos destacados');
        return;
      }
      
      // Actualizar en Supabase
      await updateProduct(id, { is_featured: newFeaturedStatus });
      
      // Actualizar estado local
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return { 
            ...p, 
            is_featured: newFeaturedStatus,
            isFeatured: newFeaturedStatus 
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error al actualizar producto destacado:', error);
      alert('Error al actualizar el producto destacado');
    }
  };

  const handleImport = async (importedProducts) => {
    try {
      // Los productos ya se guardaron en Supabase desde el formulario de importación
      // Solo actualizamos el estado local
      setProducts(prev => [...importedProducts, ...prev]);
      setActiveTab('products');
    } catch (error) {
      console.error('Error al importar productos:', error);
      alert('Error al importar los productos');
    }
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };



  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gestiona el catálogo de productos de tu negocio
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button onClick={openAddForm} className="bg-fuddi-purple hover:bg-fuddi-purple-light w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            Todas las categorías
          </Button>
          {/* PRODUCT_CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          )) */}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Productos destacados */}
            {featuredProducts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  Productos Destacados
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {featuredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={openEditForm}
                      onDelete={handleDeleteProduct}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Todos los productos */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Todos los Productos ({regularProducts.length})
              </h2>
              {regularProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {regularProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={openEditForm}
                      onDelete={handleDeleteProduct}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'No hay productos aún. ¡Agrega tu primer producto!'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="import">
            <ImportProductsForm onImport={handleImport} />
          </TabsContent>
        </Tabs>

        {/* Modal para formulario */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              onCancel={() => {
                setFormOpen(false);
                setEditingProduct(null);
              }}
              isLoading={false}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage; 