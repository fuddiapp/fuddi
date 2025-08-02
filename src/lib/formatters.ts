
/**
 * Formateadores de datos para la aplicación
 */

/**
 * Formatea un número como precio en pesos chilenos (CLP)
 * @param price - El precio a formatear
 * @returns Precio formateado como string (ej: "$3.500")
 */
export function formatPriceCLP(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return '$0';
  }
  return `$${price.toLocaleString('es-CL')}`;
}
