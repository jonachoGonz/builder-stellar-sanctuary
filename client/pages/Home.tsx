import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Vitrina } from "../components/home/Vitrina";
import { About } from "../components/home/About";
import { Servicios } from "../components/home/Servicios";
import { Planes } from "../components/home/Planes";
import { Contacto } from "../components/home/Contacto";
import { ComienzaAhora } from "../components/home/ComienzaAhora";

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Header Component */}
      <Header />
      
      {/* Vitrina Component (Hero Section) */}
      <Vitrina />
      
      {/* About Component */}
      <About />
      
      {/* Servicios Component */}
      <Servicios />
      
      {/* Planes Component */}
      <Planes />
      
      {/* Contacto Component (with map and teachers) */}
      <Contacto />
      
      {/* Comienza Ahora Component (Final CTA) */}
      <ComienzaAhora />
      
      {/* Footer Component */}
      <Footer />
    </div>
  );
}
