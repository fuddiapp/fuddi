-- Agregar campos de nombre y apellido del cliente a la tabla menu_reservations
ALTER TABLE menu_reservations 
ADD COLUMN IF NOT EXISTS client_first_name TEXT,
ADD COLUMN IF NOT EXISTS client_last_name TEXT;

-- Crear un índice para mejorar el rendimiento de búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_menu_reservations_client_names ON menu_reservations(client_first_name, client_last_name);

-- Función para actualizar automáticamente los nombres del cliente cuando se crea una reserva
CREATE OR REPLACE FUNCTION update_client_names_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
    -- Obtener nombre y apellido del cliente desde la tabla clients
    SELECT first_name, last_name 
    INTO NEW.client_first_name, NEW.client_last_name
    FROM clients 
    WHERE id = NEW.client_id;
    
    -- Si no se encontró en clients, usar el client_name como respaldo
    IF NEW.client_first_name IS NULL AND NEW.client_last_name IS NULL THEN
        -- Intentar separar el client_name en nombre y apellido
        NEW.client_first_name = split_part(NEW.client_name, ' ', 1);
        NEW.client_last_name = split_part(NEW.client_name, ' ', 2);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente los nombres
DROP TRIGGER IF EXISTS trigger_update_client_names ON menu_reservations;
CREATE TRIGGER trigger_update_client_names
    BEFORE INSERT OR UPDATE ON menu_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_client_names_on_reservation();

-- Actualizar registros existentes con los nombres de los clientes
UPDATE menu_reservations 
SET 
    client_first_name = clients.first_name,
    client_last_name = clients.last_name
FROM clients 
WHERE menu_reservations.client_id = clients.id 
AND (menu_reservations.client_first_name IS NULL OR menu_reservations.client_last_name IS NULL); 