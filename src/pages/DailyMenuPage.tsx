import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Check, 
  Eye,
  Utensils
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { menusDiaService } from '@/integrations/supabase/menus-dia';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentDate } from '@/lib/utils';
import { useAutoRefreshMenus } from '@/hooks/use-auto-refresh-menus';

type MenuDia = {
  id: string;
  dia: string;
  nombre_menu?: string;
  descripcion_menu?: string;
  precio_menu?: number;
  business_id?: string;
  user_id?: string;
  created_at: string;
  menu_date: string;
  allow_reservations?: boolean;
};
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price?: number;
  allowReservations?: boolean;
};

type SimpleMenuDia = {
  id: string;
  nombre_menu: string;
  descripcion_menu: string;
  precio_menu?: number;
  allow_reservations?: boolean;
  menu_date: string;
  dia: string;
  business_id: string;
  created_at: string;
};

const DailyMenuPage = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [currentMenu, setCurrentMenu] = useState<MenuItem>({
    id: '',
    name: '',
    description: '',
    price: undefined,
    allowReservations: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // const [cleaningMenus, setCleaningMenus] = useState(false); // Eliminado - ya no se necesita
  const [currentMenuDia, setCurrentMenuDia] = useState<MenuDia | null>(null);

  const handleAddMenu = async () => {
    if (!currentMenu.name.trim() || !currentMenu.description.trim()) {
      toast.error('Por favor completa el nombre y descripción del menú');
      return;
    }

    setSaving(true);
    try {
      let updatedMenus: MenuItem[];

      if (isEditing) {
        // Actualizar menú existente
        updatedMenus = menus.map(menu => 
          menu.id === editingId ? { ...currentMenu, id: editingId } : menu
        );
        setIsEditing(false);
        setEditingId('');
      } else {
        // Agregar nuevo menú
        const newMenu = {
          ...currentMenu,
          id: Date.now().toString()
        };
        updatedMenus = [...menus, newMenu];
      }

      // Guardar en Supabase
      await saveMenusToSupabase(updatedMenus);
      
      setMenus(updatedMenus);
      setCurrentMenu({
        id: '',
        name: '',
        description: '',
        price: undefined,
        allowReservations: false
      });
      
      toast.success(isEditing ? 'Menú actualizado' : 'Menú agregado');
    } catch (error) {
      console.error('Error al guardar menú:', error);
      toast.error('Error al guardar el menú');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMenu = (menu: MenuItem) => {
    setCurrentMenu(menu);
    setIsEditing(true);
    setEditingId(menu.id);
  };

  const handleDeleteMenu = async (id: string) => {
    setSaving(true);
    try {
      const updatedMenus = menus.filter(menu => menu.id !== id);
      
      // Guardar en Supabase
      await saveMenusToSupabase(updatedMenus);
      
      setMenus(updatedMenus);
      toast.success('Menú eliminado');
    } catch (error) {
      console.error('Error al eliminar menú:', error);
      toast.error('Error al eliminar el menú');
    } finally {
      setSaving(false);
    }
  };

  const saveMenusToSupabase = async (menusToSave: MenuItem[]) => {
    const currentDay = getCurrentDay();
    const today = getCurrentDate();
    
    try {
      // Si no hay menús, eliminar todos los registros existentes de la fecha actual
      if (menusToSave.length === 0) {
        // Obtener todos los menús existentes del día actual
        const { data: existingMenus } = await supabase
          .from('menus_dia')
          .select('id')
          .eq('business_id', user?.id)
          .eq('dia', currentDay)
          .eq('menu_date', today);

        // Eliminar todos los menús existentes
        if (existingMenus && existingMenus.length > 0) {
          for (const menu of existingMenus) {
            await menusDiaService.deleteMenuDia(menu.id);
          }
        }
        setCurrentMenuDia(null);
        return;
      }

      // Obtener menús existentes del día actual
      const { data: existingMenus } = await supabase
        .from('menus_dia')
        .select('id')
        .eq('business_id', user?.id)
        .eq('dia', currentDay)
        .eq('menu_date', today);

      // Eliminar menús existentes
      if (existingMenus && existingMenus.length > 0) {
        for (const menu of existingMenus) {
          await menusDiaService.deleteMenuDia(menu.id);
        }
      }

      // Crear nuevos menús individualmente
      const createdMenus = [];
      for (const menu of menusToSave) {
        const menuData: any = {
          dia: currentDay,
          nombre_menu: menu.name,
          descripcion_menu: menu.description,
          precio_menu: menu.price || null,
        };
        
        // Agregar allow_reservations del menú individual
        menuData.allow_reservations = menu.allowReservations || false;
        
        const newMenu = await menusDiaService.createMenuDia(menuData, user?.id || '');
        createdMenus.push(newMenu);
      }

      // Establecer el primer menú como el actual para compatibilidad
      if (createdMenus.length > 0) {
        setCurrentMenuDia(createdMenus[0]);
      }
    } catch (error) {
      console.error('Error saving menus to Supabase:', error);
      throw error;
    }
  };

  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[today.getDay()];
  };

  // Función para limpiar menús expirados manualmente - ELIMINADA

  const copyToClipboard = async () => {
    const currentDay = getCurrentDay();
    let menuText = `🍽️ *MENÚ DEL DÍA ${currentDay}* 🍽️\n\n`;
    
    menus.forEach((menu, index) => {
      menuText += `*${index + 1}. ${menu.name}*\n`;
      menuText += `${menu.description}\n`;
      if (menu.price) {
        menuText += `💰 *$${menu.price.toLocaleString()}*\n`;
      }
      if (index < menus.length - 1) {
        menuText += '\n';
      }
    });

    // Método más confiable usando textarea
    const textArea = document.createElement('textarea');
    textArea.value = menuText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-1';
    
    document.body.appendChild(textArea);
    
    try {
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Para dispositivos móviles
      
      const successful = document.execCommand('copy');
      
      if (successful) {
        toast.success('Menú copiado al portapapeles');
      } else {
        // Si execCommand falla, intentar con la API moderna
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(menuText);
          toast.success('Menú copiado al portapapeles');
        } else {
          throw new Error('No se pudo copiar');
        }
      }
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('No se pudo copiar automáticamente. El texto está seleccionado, puedes copiarlo manualmente (Ctrl+C)');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const shareToWhatsApp = () => {
    const currentDay = getCurrentDay();
    let menuText = `🍽️ *MENÚ DEL DÍA ${currentDay}* 🍽️\n\n`;
    
    menus.forEach((menu, index) => {
      menuText += `*${index + 1}. ${menu.name}*\n`;
      menuText += `${menu.description}\n`;
      if (menu.price) {
        menuText += `💰 *$${menu.price.toLocaleString()}*\n`;
      }
      if (index < menus.length - 1) {
        menuText += '\n';
      }
    });

    const encodedText = encodeURIComponent(menuText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    try {
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      toast.error('Error al abrir WhatsApp. Intenta copiar el texto y compartirlo manualmente.');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return `$${price.toLocaleString()}`;
  };

  // Cargar el menú del día actual al montar el componente
  const loadCurrentMenuDia = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Usar el servicio de menús del día que ya maneja el filtrado por fecha
      const menus = await menusDiaService.getMenusDia(user.id);
      
      if (menus && menus.length > 0) {
        setCurrentMenuDia(menus[0] as any);
        const menuItems: MenuItem[] = menus.map((menu: any) => ({
          id: menu.id,
          name: menu.nombre_menu ?? '',
          description: menu.descripcion_menu ?? '',
          price: menu.precio_menu ?? undefined,
          allowReservations: menu.allow_reservations ?? false
        }));
        setMenus(menuItems);
      } else {
        setMenus([]);
        setCurrentMenuDia(null);
      }
    } catch (error) {
      console.error('Error loading current menu del día:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCurrentMenuDia();
  }, [loadCurrentMenuDia]);

  // Usar el hook para actualización automática cuando cambie la fecha
  useAutoRefreshMenus(loadCurrentMenuDia, [loadCurrentMenuDia]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Menú del Día</h1>
          <p className="text-gray-600">Crea y gestiona los menús del día para tu negocio</p>
            </div>
            <div className="flex gap-2">
              {/* Botón de limpiar expirados eliminado */}
            </div>
          </div>
          

          
          {loading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">Cargando menú del día...</p>
            </div>
          )}
          {saving && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">Guardando cambios...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de creación */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {isEditing ? 'Editar Menú' : 'Agregar Nuevo Menú'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Menú 
                  </label>
                  <Input
                    placeholder="Ej: Menú Vegetariano, Menú Ejecutivo"
                    value={currentMenu.name}
                    onChange={(e) => setCurrentMenu({...currentMenu, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Detallada 
                  </label>
                  <Textarea
                    placeholder="Escribe todos los platos o componentes de tu menú, ejemplo: 
                    - Cazuela"
                    value={currentMenu.description}
                    onChange={(e) => setCurrentMenu({...currentMenu, description: e.target.value})}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Escribe cada plato o componente del menú en una línea separada, idealmente con guiones (-) para mejor presentación
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (Opcional)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ej: 12000"
                    value={currentMenu.price || ''}
                    onChange={(e) => setCurrentMenu({
                      ...currentMenu, 
                      price: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                  />
                </div>

                {/* Switch para permitir reservas */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-reservations"
                    checked={currentMenu.allowReservations || false}
                    onCheckedChange={(checked) => setCurrentMenu(prev => ({ ...prev, allowReservations: checked }))}
                  />
                  <Label htmlFor="allow-reservations" className="text-sm font-medium text-gray-700">
                    Permitir reservas para este menú
                  </Label>
                </div>
                <p className="text-xs text-gray-500">
                  Si activas esta opción, los clientes podrán reservar este menú del día
                </p>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddMenu}
                    disabled={saving}
                    className="flex-1 bg-fuddi-purple hover:bg-fuddi-purple-light"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : isEditing ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Actualizar Menú
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Menú
                      </>
                    )}
                  </Button>
                  
                  {isEditing && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditingId('');
                        setCurrentMenu({
                          id: '',
                          name: '',
                          description: '',
                          price: undefined,
                          allowReservations: false
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información de vigencia */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Información importante</h3>
                  <p className="text-blue-700 text-sm">
                    Los menús del día se eliminan automáticamente al finalizar el día.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Lista de menús creados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Menús Creados ({menus.length})</h2>
              {menus.length > 0 && (
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Vista Previa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-bold text-fuddi-purple">
                        🍽️ Menú del Día {getCurrentDay()} 🍽️
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Vista previa del texto que se copiará */}
                      <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                            <Copy className="h-4 w-4" />
                            Vista previa del texto que se copiará:
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-white p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {(() => {
                              const currentDay = getCurrentDay();
                              let previewText = `🍽️ *MENÚ DEL DÍA ${currentDay}* 🍽️\n\n`;
                              
                              menus.forEach((menu, index) => {
                                previewText += `*${index + 1}. ${menu.name}*\n`;
                                previewText += `${menu.description}\n`;
                                if (menu.price) {
                                  previewText += `💰 *$${menu.price.toLocaleString()}*\n`;
                                }
                                                              if (index < menus.length - 1) {
                                previewText += '\n';
                              }
                            });
                              
                              return previewText;
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Botones de acción */}
                      <div className="flex gap-3 pt-4">
                        <Button onClick={copyToClipboard} variant="outline" className="flex-1" size="lg">
                          <Copy className="mr-2 h-5 w-5" />
                          Copiar Menú Completo
                        </Button>
                        <Button onClick={shareToWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                          <Share2 className="mr-2 h-5 w-5" />
                          Compartir por WhatsApp
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {menus.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay menús creados aún</p>
                  <p className="text-sm">Comienza agregando tu primer menú</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {menus.map((menu) => (
                  <Card key={menu.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{menu.name}</h3>
                          {menu.price && (
                            <Badge variant="secondary" className="mt-1">
                              {formatPrice(menu.price)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            onClick={() => handleEditMenu(menu)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                        {menu.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DailyMenuPage;
