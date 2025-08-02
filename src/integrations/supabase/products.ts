import { supabase } from './client';
import type { Database } from './types';

export type Product = Database['public']['Tables']['products']['Row'];
export type NewProduct = Database['public']['Tables']['products']['Insert'];
export type UpdateProduct = Database['public']['Tables']['products']['Update'];

// Subir imagen de producto al bucket 'products'
export async function uploadProductImage(file: File, fileName: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir imagen:', error);
      throw new Error('Error al subir la imagen');
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadProductImage:', error);
    throw error;
  }
}

// Crear un nuevo producto
export async function createProduct(product: NewProduct): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error al crear producto:', error);
      throw new Error('Error al crear el producto');
    }

    return data;
  } catch (error) {
    console.error('Error en createProduct:', error);
    throw error;
  }
}

// Actualizar un producto existente
export async function updateProduct(id: string, updates: UpdateProduct): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error al actualizar producto:', error);
      throw new Error('Error al actualizar el producto');
    }
    
    return data;
  } catch (error) {
    console.error('Error en updateProduct:', error);
    throw error;
  }
}

// Eliminar un producto
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error al eliminar producto:', error);
      throw new Error('Error al eliminar el producto');
    }
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    throw error;
  }
}

// Obtener todos los productos
export async function getProducts(businessId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error al obtener productos:', error);
      throw new Error('Error al obtener los productos');
    }
    return data || [];
  } catch (error) {
    console.error('Error en getProducts:', error);
    throw error;
  }
} 