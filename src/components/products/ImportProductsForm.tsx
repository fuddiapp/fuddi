import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createProduct, UpdateProduct, Product } from '@/integrations/supabase/products';
import { useAuth } from '@/contexts/AuthContext';

const ImportProductsForm = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { user } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (typeof text !== 'string') {
          setError('El archivo no es un texto válido');
          return;
        }
        const rows = text.split('\n').map(row => row.split(','));
        const products = rows.slice(1).map((cols, i) => ({
          id: Date.now() + i,
          name: cols[0],
          description: cols[1],
          price: Number(cols[2]),
          imageUrl: cols[3],
          categories: (cols[4] || '').split('|').slice(0,2),
          isFeatured: false,
        })).filter(p => p.name && p.price);
        setPreview(products);
        setError('');
      };
      reader.onerror = () => setError('Error al leer el archivo');
      reader.readAsText(file);
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const products = (rows as any[][]).slice(1).map((cols, i) => ({
          id: Date.now() + i,
          name: cols[0],
          description: cols[1],
          price: Number(cols[2]),
          imageUrl: cols[3],
          categories: (cols[4] || '').split('|').slice(0,2),
          isFeatured: false,
        })).filter(p => p.name && p.price);
        setPreview(products);
        setError('');
      };
      reader.onerror = () => setError('Error al leer el archivo');
      reader.readAsArrayBuffer(file);
    } else {
      setError('Formato de archivo no soportado. Usa .csv o .xlsx');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      for (const p of preview) {
        await createProduct({
          name: p.name,
          description: p.description,
          price: Number(p.price),
          image_url: p.imageUrl,
          categories: p.categories,
          is_featured: p.isFeatured || false,
          business_id: user?.id,
        });
      }
      if (onImport) onImport(preview);
      setSaving(false);
      setPreview([]);
    } catch (err) {
      setSaving(false);
      setSaveError('Error al guardar productos');
      console.error(err);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'imageUrl', 'categories'];
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      ['Café Americano', 'Café tradicional filtrado', 1800, 'https://ejemplo.com/cafe.jpg', 'Café|Desayunos'],
      ['Ensalada César', 'Lechuga, pollo, crutones y aderezo', 4500, 'https://ejemplo.com/ensalada.jpg', 'Ensaladas'],
      ['Brownie', 'Brownie de chocolate artesanal', 2500, '', 'Dulces|Repostería'],
    ]);
    // Ajustar ancho de columnas para mejor visualización
    ws['!cols'] = [
      { wch: 20 }, // name
      { wch: 35 }, // description
      { wch: 10 }, // price
      { wch: 40 }, // imageUrl
      { wch: 35 }, // categories
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Instrucciones detalladas */}
      <div className="bg-fuddi-purple/10 border-l-4 border-fuddi-purple p-4 rounded-md">
        <h2 className="font-bold text-fuddi-purple mb-2 text-lg">¿Cómo importar tus productos?</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Descarga la <b>plantilla de Excel</b> haciendo clic en <span className="font-semibold">"Descargar plantilla Excel"</span> más abajo.</li>
          <li>Abre la plantilla y completa los datos de tus productos siguiendo estos campos:<br/>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><b>name</b>: Nombre del producto (obligatorio).</li>
              <li><b>description</b>: Descripción breve del producto (opcional).</li>
              <li><b>price</b>: Precio en pesos chilenos, solo números (obligatorio).</li>
              <li><b>imageUrl</b>: URL de la imagen del producto (opcional, debe ser un enlace válido).</li>
              <li><b>categories</b>: Categorías separadas por <b>|</b> (máximo 2). Usa solo las siguientes opciones:<br/>
                <span className="block mt-1 text-xs text-fuddi-purple font-mono">Desayunos, Almuerzos, Snacks, Dulces, Bebidas, Vegetariano, Ensaladas, Repostería, Frutas/Naturales, Bajo en calorías, Café</span>
              </li>
            </ul>
          </li>
          <li>Guarda el archivo como <b>.xlsx</b> (Excel) o <b>.csv</b> (texto separado por comas).</li>
          <li>Haz clic en <span className="font-semibold">"Importar desde CSV o Excel"</span> y selecciona tu archivo.</li>
          <li>Revisa la vista previa y haz clic en <span className="font-semibold">"Guardar"</span> para finalizar la importación.</li>
        </ol>
        <div className="mt-2 text-xs text-gray-500">Si tienes dudas, descarga la plantilla y úsala como ejemplo. Todos los campos obligatorios deben estar completos para cada producto.</div>
      </div>
      {/* Botón de importación */}
      <input type="file" accept=".csv,.xlsx" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <Button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="flex items-center gap-2">
        <Upload className="h-4 w-4" /> Importar desde CSV o Excel
      </Button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {preview.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Vista previa ({preview.length} productos):</h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {preview.map((p, i) => (
              <li key={i} className="border-b py-1 text-sm">{p.name} - ${p.price} - {p.categories.join(', ')}</li>
            ))}
          </ul>
          <Button onClick={handleSave} className="mt-2" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          {saveError && <div className="text-red-500 text-sm mt-2">{saveError}</div>}
        </div>
      )}
      {/* Botón para descargar plantilla mejorada */}
      <Button onClick={handleDownloadTemplate} className="flex items-center gap-2" variant="outline">
        Descargar plantilla Excel
      </Button>
    </div>
  );
};

export default ImportProductsForm; 