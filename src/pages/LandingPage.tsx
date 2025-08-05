import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Smile, TrendingUp, Store } from "lucide-react";

const foodMockup = "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80";
const appMockup = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80";

const LandingPage = () => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-fuddi-purple/10 via-purple-100 to-white animate-fade-in font-sans relative overflow-x-hidden">
    {/* Header minimalista fijo */}
    <header className="w-full flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-fuddi-purple/10 fixed top-0 left-0 z-30 h-16">
      <Link to="/" className="text-3xl font-lobster text-fuddi-purple select-none">Fuddi</Link>
      <nav className="flex items-center gap-2">
        <Link to="/login" className="text-fuddi-purple font-semibold px-3 py-1 rounded-full hover:underline transition-colors text-base">Iniciar sesión</Link>
        <Link to="/register/type" className="text-fuddi-purple font-semibold px-3 py-1 rounded-full hover:bg-fuddi-purple/10 transition-colors text-base">Registrarse</Link>
      </nav>
    </header>
    {/* Espaciador para el header fijo */}
    <div className="h-16" />
    {/* Fondo decorativo superior */}
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-fuddi-purple/20 rounded-full blur-3xl z-0" />
    {/* Fondo decorativo inferior */}
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuddi-purple/10 rounded-full blur-2xl z-0" />
    {/* Hero Section */}
    <section className="w-full flex flex-col items-center justify-center text-center py-16 px-4 md:px-0 bg-white/90 border-b border-fuddi-purple/10 relative overflow-hidden z-10 shadow-md">
      <div className="max-w-2xl mx-auto z-10">
        <span className="text-5xl md:text-6xl font-lobster text-fuddi-purple mb-2 block drop-shadow-glow">Fuddi</span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight font-sans">
          Descubre descuentos y ofertas de comida cerca de ti
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 font-sans">
          Ahorra en tus comidas favoritas, encuentra promociones exclusivas y vive la experiencia Fuddi.
        </p>
        <Link to="/register/client">
          <Button size="lg" className="rounded-full font-bold text-lg bg-fuddi-purple hover:bg-fuddi-purple-dark shadow-glow px-10 py-4 transition-colors duration-200">
            Explorar ofertas
          </Button>
        </Link>
      </div>
      {/* Mockup de comida/app */}
      <div className="absolute right-0 bottom-0 w-1/2 max-w-lg hidden md:block opacity-30 pointer-events-none select-none">
        <img src={foodMockup} alt="Comida Fuddi" className="rounded-3xl shadow-2xl" />
      </div>
    </section>

    {/* Beneficios para clientes */}
    <section className="py-16 px-4 md:px-0 bg-fuddi-purple/5">
      <h2 className="text-2xl md:text-3xl font-bold text-fuddi-purple mb-10 text-center font-sans">¿Por qué usar Fuddi?</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center p-6 bg-white/80 border border-fuddi-purple/10 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <Star className="h-8 w-8 text-fuddi-purple mb-2" />
          <h4 className="font-bold text-lg mb-1">Descuentos diarios</h4>
          <p className="text-gray-700 text-sm">Promociones exclusivas todos los días en tus locales favoritos.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white/80 border border-fuddi-purple/10 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <MapPin className="h-8 w-8 text-fuddi-purple mb-2" />
          <h4 className="font-bold text-lg mb-1">Ofertas cerca de ti</h4>
          <p className="text-gray-700 text-sm">Encuentra menús y descuentos en tu zona, sin complicaciones.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white/80 border border-fuddi-purple/10 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <Clock className="h-8 w-8 text-fuddi-purple mb-2" />
          <h4 className="font-bold text-lg mb-1">Menús del día</h4>
          <p className="text-gray-700 text-sm">Descubre menús especiales y ahorra en cada comida.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-white/80 border border-fuddi-purple/10 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <Smile className="h-8 w-8 text-fuddi-purple mb-2" />
          <h4 className="font-bold text-lg mb-1">Sigue a tus favoritos</h4>
          <p className="text-gray-700 text-sm">Descubre y sigue tus locales preferidos para no perderte ninguna promoción.</p>
        </div>
      </div>
    </section>

    {/* Cómo funciona Fuddi */}
    <section className="py-16 px-4 md:px-0 bg-gradient-to-br from-fuddi-purple/10 via-white to-fuddi-purple/5">
      <h2 className="text-2xl md:text-3xl font-bold text-fuddi-purple mb-10 text-center font-sans">¿Cómo funciona?</h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-fuddi-purple/10 rounded-full p-4 mb-6 shadow-lg">
            <img src={appMockup} alt="App Fuddi" className="rounded-2xl shadow-xl w-60" />
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4">
            <span className="bg-fuddi-purple text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-md">1</span>
            <div>
              <h4 className="font-bold text-lg mb-1">Regístrate gratis</h4>
              <p className="text-gray-700 text-sm">Crea tu cuenta en segundos y accede a todas las ofertas.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-fuddi-purple text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-md">2</span>
            <div>
              <h4 className="font-bold text-lg mb-1">Explora promociones</h4>
              <p className="text-gray-700 text-sm">Busca menús del día y descuentos en tu zona.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-fuddi-purple text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-md">3</span>
            <div>
              <h4 className="font-bold text-lg mb-1">Canjea y ahorra</h4>
              <p className="text-gray-700 text-sm">Muestra tu oferta en el local y disfruta tu comida.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Sección para negocios */}
    <section className="py-16 px-4 md:px-0 bg-fuddi-purple/5 border-t border-fuddi-purple/10 mt-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center mb-6">
          <Store className="h-10 w-10 text-fuddi-purple mb-2" />
          <h2 className="text-2xl font-bold text-fuddi-purple mb-2 font-sans">¿Tienes un local?</h2>
        </div>
        <p className="text-gray-700 mb-4">Aumenta tu visibilidad, sube tus menús y promociones en minutos y llega a más clientes jóvenes.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
          <div className="flex-1 flex flex-col items-center bg-white/80 border border-fuddi-purple/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <TrendingUp className="h-8 w-8 text-fuddi-purple mb-2" />
            <h4 className="font-bold text-lg mb-1">Más visibilidad</h4>
            <p className="text-gray-700 text-sm">Llega a cientos de clientes nuevos cada semana.</p>
          </div>
          <div className="flex-1 flex flex-col items-center bg-white/80 border border-fuddi-purple/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <Star className="h-8 w-8 text-fuddi-purple mb-2" />
            <h4 className="font-bold text-lg mb-1">Más ventas</h4>
            <p className="text-gray-700 text-sm">Aumenta tus ingresos con promociones atractivas.</p>
          </div>
          <div className="flex-1 flex flex-col items-center bg-white/80 border border-fuddi-purple/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <Smile className="h-8 w-8 text-fuddi-purple mb-2" />
            <h4 className="font-bold text-lg mb-1">Gestión fácil</h4>
            <p className="text-gray-700 text-sm">Sube menús y ofertas desde cualquier dispositivo.</p>
          </div>
        </div>
        <Link to="/register/business">
          <Button size="lg" variant="outline" className="rounded-full font-bold text-fuddi-purple border-fuddi-purple hover:bg-fuddi-purple/20 px-8 py-3 transition-colors duration-200">Quiero vender en Fuddi</Button>
        </Link>
      </div>
    </section>

    <footer className="text-center py-6 text-fuddi-purple/50 text-sm bg-transparent font-sans z-10">
      © 2025 Fuddi. Todos los derechos reservados.
    </footer>

    <style>{`
      .font-lobster { font-family: 'Lobster', cursive; }
      .drop-shadow-glow { filter: drop-shadow(0 0 8px rgba(79,1,161,0.3)); }
      .animate-fade-in { animation: fade-in 1s cubic-bezier(0.4,0,0.6,1); }
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px);}
        to { opacity: 1; transform: translateY(0);}
      }
    `}</style>
  </div>
);

export default LandingPage;
