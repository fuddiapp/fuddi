import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Tag, 
  Settings,
  LogOut,
  Menu,
  Utensils,
  Package,
  QrCode
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('fuddi-user');
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-fuddi-purple flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold">Fuddi Central</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`
              }
            >
              <LayoutDashboard className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/promotions"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors group ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 hover:text-yellow-300'}`
              }
            >
              <Tag className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Promociones
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/menu"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors group ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 hover:text-yellow-300'}`
              }
            >
              <Menu className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Menú del Día
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/products"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors group ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 hover:text-yellow-300'}`
              }
            >
              <Package className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/qr"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors group ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 hover:text-yellow-300'}`
              }
            >
              <QrCode className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Código QR
            </NavLink>
          </li>

          <li>
            <NavLink 
              to="/settings"
              className={({ isActive }) => 
                `flex items-center p-3 rounded-md text-white transition-colors group ${isActive ? 'bg-white/10 font-medium' : 'hover:bg-white/5 hover:text-yellow-300'}`
              }
            >
              <Settings className="mr-3 h-5 w-5 transition-colors group-hover:text-yellow-300" />
              Configuración
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <Button 
          onClick={handleLogout}
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10 hover:text-yellow-300 transition-colors group"
        >
          <LogOut className="mr-2 h-4 w-4 transition-colors group-hover:text-yellow-300" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
