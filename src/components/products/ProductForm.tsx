import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Link, X } from 'lucide-react';
import { uploadProductImage, createProduct } from '@/integrations/supabase/products';
import { useAuth } from '@/contexts/AuthContext';

// Categorías para productos y promociones (unificadas)
const PRODUCT_CATEGORIES = [
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

const ProductForm = (props) => {
  const { initialData, onSubmit, onCancel, isLoading } = props;
  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    categories: [],
  });
  const [imageInputType, setImageInputType] = useState('url');
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCategoryClick = (cat) => {
    setForm(f => {
      const exists = f.categories.includes(cat);
      let newCats = exists ? f.categories.filter(c => c !== cat) : [...f.categories, cat];
      if (newCats.length > 2) newCats = newCats.slice(0, 2);
      return { ...f, categories: newCats };
    });
  };

  const handleImageUrlChange = (url) => {
    setForm(f => ({ ...f, imageUrl: url }));
    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        setForm(f => ({ ...f, imageUrl: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.price || form.categories.length === 0) return;
    setUploading(true);
    let imageUrl = form.imageUrl;
    try {
      if (file) {
        const ext = file.name.split('.').pop();
        const fileName = `product_${Date.now()}.${ext}`;
        imageUrl = await uploadProductImage(file, fileName);
      }
      const newProduct = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image_url: imageUrl,
        categories: form.categories,
        is_featured: false,
        business_id: user?.id,
      };
      const saved = await createProduct(newProduct);
      setUploading(false);
      if (onSubmit) onSubmit(saved);
    } catch (err) {
      setUploading(false);
      setError('Error al guardar el producto.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto *</Label>
        <Input id="name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" value={form.description} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Precio *</Label>
        <Input id="price" name="price" type="number" value={form.price} onChange={handleChange} required min={0} />
      </div>
      <div className="space-y-4">
        <Label>Imagen del producto</Label>
        <div className="flex gap-2">
          <Button type="button" variant={imageInputType === 'url' ? 'default' : 'outline'} size="sm" onClick={() => setImageInputType('url')}> <Link className="h-4 w-4" /> URL </Button>
          <Button type="button" variant={imageInputType === 'file' ? 'default' : 'outline'} size="sm" onClick={() => setImageInputType('file')}> <Upload className="h-4 w-4" /> Subir archivo </Button>
        </div>
        {imageInputType === 'url' && (
          <Input placeholder="https://ejemplo.com/imagen.jpg" value={form.imageUrl} onChange={e => handleImageUrlChange(e.target.value)} />
        )}
        {imageInputType === 'file' && (
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        )}
        {imagePreview && (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Vista previa" className="w-32 h-32 object-cover rounded-lg border" />
            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={clearImage}><X className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Categorías (máximo 2)</Label>
        <div className="flex gap-2 flex-wrap">
          {PRODUCT_CATEGORIES.map(cat => (
            <Button key={cat} type="button" variant={form.categories.includes(cat) ? 'default' : 'outline'} size="sm" className="mb-1" onClick={() => handleCategoryClick(cat)} disabled={!form.categories.includes(cat) && form.categories.length >= 2}>{cat}</Button>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isLoading || uploading}>Cancelar</Button>
        <Button type="submit" className="flex-1 bg-fuddi-purple hover:bg-fuddi-purple-light" disabled={isLoading || uploading}>{uploading ? 'Subiendo...' : (isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear'))}</Button>
      </div>
    </form>
  );
};

export default ProductForm; 