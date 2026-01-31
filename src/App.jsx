// Archivo principal de la aplicación React para E+mineras
import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
  ChevronRight,
  ChevronLeft,
  HardHat,
  Zap,
  Users,
  Target,
  Briefcase,
  Calendar,
  Sparkles,
  Send,
  Check,
  ArrowRight,
  Phone,
  Building,
  User,
  Globe,
  TrendingUp,
  Award, // Corregido: Usando Award en lugar de Handshake para evitar error de compilación
  MessageSquare
} from 'lucide-react';

// --- Definición de Colores ---
const COLORS = {
  primary: '#08D6C6', // Turquesa
  secondary: '#FF5722', // Naranja
  accent1: '#B364C9', // Morado
  accent2: '#FFC107', // Amarillo
  dark: '#1e293b', // Azul oscuro
  light: '#ffffff',
  bg: '#f8fafc', // Fondo sutil
};

// --- Configuración de la API de Gemini ---
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=";
const apiKey = ""; // La clave se inyecta en tiempo de ejecución

// --- Hooks y Utilidades ---

// Función de utilidad para copiar al portapapeles
const copyToClipboard = (text, setCopied) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Error al copiar:", err));
  } else {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Error fallback copy:", e);
    }
  }
};

// Hook para Parallax
const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset * speed);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);
  return offset;
};

// Hook para contar números (Counter Animation)
const useCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration, start]);

  return { count, ref };
};

// Componente Reveal Avanzado (Slide-in, Fade-in, Clip-path)
const Reveal = ({ children, className = "", delay = 0, variant = "fade-up" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.disconnect(); };
  }, []);

  const getTransform = () => {
    if (isVisible) return "translate(0, 0) scale(1)";
    switch (variant) {
      case "fade-up": return "translateY(40px)";
      case "fade-left": return "translateX(-40px)";
      case "fade-right": return "translateX(40px)";
      case "zoom-in": return "scale(0.95)";
      case "clip-right": return "translate(0)";
      default: return "translateY(20px)";
    }
  };

  const getOpacity = () => (isVisible ? 1 : 0);

  const getClipPath = () => {
    if (variant === "clip-right") {
      return isVisible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)";
    }
    return "none";
  };

  const transition = `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: getTransform(),
        opacity: getOpacity(),
        clipPath: getClipPath(),
        transition: transition,
        willChange: "transform, opacity, clip-path"
      }}
    >
      {children}
    </div>
  );
};

// Componente Tilt 3D Leve
const TiltCard = ({ children, className = "" }) => {
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / 25) * -1;
    const rotateY = (x - centerX) / 25;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.1s ease-out" }}
    >
      {children}
    </div>
  );
};

// Componente Typewriter
const Typewriter = ({ text, speed = 50, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);

  return <span>{displayedText}</span>;
};

const SectionTitle = ({ children, color = COLORS.dark }) => (
  <Reveal variant="fade-up">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 text-center tracking-tight" style={{ color }}>
      {children}
    </h2>
  </Reveal>
);

// Componente Tarjeta del Directorio
const BoardMemberCard = ({ name, role, company, isSub, delay, image }) => (
  <Reveal delay={delay} variant="fade-up">
    <div className={`relative p-6 rounded-2xl transition-all duration-500 border-t-4 group hover:-translate-y-1 hover:shadow-xl bg-white overflow-hidden ${isSub ? 'border-gray-300 shadow-md' : 'border-brand-purple shadow-xl'}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${isSub ? 'bg-gray-800' : 'bg-brand-purple'}`}></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {image ? (
          <div className="mb-4 overflow-hidden w-24 h-24 rounded-full border-4 border-white shadow-lg group-hover:border-brand-purple transition-colors duration-300">
            <img src={image} alt={name} className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-500" />
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-white font-bold text-2xl shadow-lg ${isSub ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-brand-purple to-purple-600'}`}>
            {name.charAt(0)}
          </div>
        )}

        <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-purple transition-colors duration-300 mb-1">{name}</h3>
        <p className={`font-bold text-xs uppercase tracking-widest mb-3 ${isSub ? 'text-gray-500' : 'text-brand-purple'}`}>{role}</p>

        <div className="flex items-start text-left text-gray-600 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 transition-colors w-full group-hover:border-brand-purple/20">
          <Briefcase size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-orange" />
          <span className="leading-snug text-xs">{company}</span>
        </div>
      </div>
    </div>
  </Reveal>
);

// Componente Modal de Noticias
const NewsModal = ({ news, onClose }) => {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition z-10 hover:rotate-90 duration-300">
            <X className="w-5 h-5" />
          </button>

          <img
            src={news.imagePlaceholder}
            alt={news.title}
            className="w-full h-auto max-h-96 object-contain rounded-lg mb-6 shadow-sm bg-gray-50"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=E+MINERAS"; }}
          />

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-bold uppercase" style={{ backgroundColor: COLORS.bg, color: COLORS.secondary }}>{news.category || 'Noticia'}</span>
            <p className="text-sm font-semibold text-gray-500">{news.date}</p>
          </div>

          <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.dark }}>
            {news.title}
          </h2>

          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
            {news.fullText}
          </div>

          <div className="flex justify-end items-center border-t pt-6 mt-4 gap-4">
            <button onClick={onClose} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition">
              Cerrar
            </button>
            <a
              href={news.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-3 text-sm font-bold rounded-full shadow-md transition duration-300 hover:scale-105 text-white bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Instagram className="w-5 h-5 mr-2" /> Ver en Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};


// Componente Aviso Próximamente
const JoinForm = () => (
  <section id="unete" className="py-24 bg-slate-50 relative overflow-hidden">
    <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 15%, 0 0%)', zIndex: 0 }}></div>
    <div className="container mx-auto px-4 relative z-10">
      <SectionTitle>Únete a nosotras</SectionTitle>
      <Reveal variant="fade-up">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}20` }}>
            <Sparkles className="w-10 h-10" style={{ color: COLORS.primary }} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            ¡Próximamente!
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Estamos preparando un nuevo formulario de inscripción para que puedas unirte a nuestra comunidad de mujeres líderes en minería y energía.
          </p>
          <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: `${COLORS.secondary}15`, color: COLORS.secondary }}>
            <Calendar className="w-5 h-5 mr-2" />
            Disponible muy pronto
          </div>
          <p className="mt-8 text-sm text-gray-500">
            Mientras tanto, puedes contactarnos en{' '}
            <a href="mailto:presidenta@emineras.cl" className="font-semibold hover:underline" style={{ color: COLORS.primary }}>
              presidenta@emineras.cl
            </a>
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

// --- Main App ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedNews, setSelectedNews] = useState(null);
  const parallaxOffset = useParallax(0.3);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: 'quienes-somos', title: 'Quiénes Somos', color: COLORS.secondary },
    { id: 'directorio', title: 'Directorio', color: COLORS.accent1 },
    { id: 'objetivos', title: 'Objetivos', color: COLORS.accent2 },
    { id: 'programas', title: 'Programas', color: COLORS.primary },
    { id: 'unete', title: 'Únete a nosotras', color: COLORS.secondary },
    { id: 'inscripcion-evento', title: 'Inscripción Evento', color: COLORS.primary },
    { id: 'noticias', title: 'Noticias', color: COLORS.accent2 },
    { id: 'contacto', title: 'Contacto', color: COLORS.accent1 },
  ];

  const boardMembers = [
    { name: 'Pamela Garrido Cisternas', role: 'Presidenta', company: 'Gerenta General EMESER Ltda', color: COLORS.accent1, isSub: false, image: 'https://i.ibb.co/bjzNBYXz/Whats-App-Image-2023-03-08-at-09-45-51.jpg' },
    { name: 'Rosa Ester Salazar Duarte', role: 'Vicepresidenta', company: 'Gerenta General Grupo ROES', color: COLORS.secondary, isSub: false, image: 'https://i.ibb.co/rfvfdmpV/Dise-o-sin-t-tulo.jpg' },
    { name: 'Martha Aguilera Alderete', role: 'Secretaria', company: 'Gerenta Innovación de Electroram', color: COLORS.primary, isSub: false, image: 'https://i.ibb.co/5g9YdMKn/images-q-tbn-ANd9-Gc-STeab27-W6x-Nz48-Rw-Iq-C-o-Y0c-RV6u1-F1-Mt-NAg-s.jpg' },
    { name: 'Cristina Araya Briones', role: 'Secretaria Subrogante', company: 'Gerenta General Araya Briones Ltda', color: COLORS.primary, isSub: true, image: 'https://i.ibb.co/jk4LJF1s/cristina-araya-briones-pdta-cchc-calama.jpg' },
    { name: 'Georgina Kong Medero-Laferte', role: 'Tesorera', company: 'Gerenta General Servicios Generales Kong Ltda', color: COLORS.accent2, isSub: false, image: 'https://i.ibb.co/7JkxDsHz/Captura-de-pantalla-2025-12-01-193535.png' },
    { name: 'Maria Alejandra Jimenez Uribe', role: 'Tesorera Subrogante', company: 'Gerenta General Novamine Ltda', color: COLORS.accent2, isSub: true, image: 'https://i.ibb.co/j9NpM466/images-q-tbn-ANd9-Gc-RCD3v-Ekbk-Dldbb-Xfmf47-Us-WMhd-L2m-XV4cog-s.jpg' },
    { name: 'Paola Quezada Quiñones', role: 'Comunicaciones', company: 'Gerenta General Agencia Redes', color: COLORS.secondary, isSub: false, image: 'https://i.ibb.co/sJQqH1wd/Paola.png' },
  ];

  const stats = [
    { number: 30, label: "Socias Activas", icon: Users, color: COLORS.primary },
    { number: 15, label: "Años de Experiencia", icon: Briefcase, color: COLORS.secondary },
    { number: 50, label: "Seminarios Realizados", icon: Calendar, color: COLORS.accent1 },
    { number: 100, label: "% Compromiso Regional", icon: Building, color: COLORS.accent2 },
  ];

  const newsItems = [
    {
      id: 1,
      category: 'Internacionalización',
      title: '¿Cómo hacer negocios en Australia?',
      date: '21 Nov 2025',
      summary: 'Una instancia de networking clave para abrir la mente sobre las oportunidades comerciales entre Chile y Australia.',
      fullText: '¡Estamos muy felices y agradecidas! 🙌\n\nGracias @prochileantofagasta por la invitación al evento “¿Cómo hacer negocios en Australia?”. Una instancia de networking que nos ayuda a abrir la mente sobre las oportunidades comerciales que existen entre Chile y Australia 🇨🇱🇦🇺.\n\nConversamos con el agregado comercial de ProChile Australia y aprendimos sobre los tratados que facilitan el comercio entre ambos países. Este tipo de espacios son clave para seguir creciendo y expandiendo horizontes 🌏✨.\n\nLa minería no tiene fronteras, y nosotras tampoco 💎.',
      instagramLink: 'https://www.instagram.com/p/DRUOn3gDSYH/?img_index=1',
      imagePlaceholder: 'https://i.ibb.co/yn7tqVvG/Imagen-de-Whats-App-2025-11-20-a-las-20-27-49-99b2d2f2.jpg'
    },
    {
      id: 2,
      category: 'Alianzas Estratégicas',
      title: 'Firma de Convenio con BHP y CChC',
      date: '24 Sept 2025',
      summary: 'Anunciamos la firma de un convenio histórico con BHP y la Cámara Chilena de la Construcción, fortaleciendo el sector minero de Antofagasta.',
      fullText: '¡Estamos profundamente felices y agradecidas! 🙌\n\nNos complace anunciar la firma del convenio con BHP y la Cámara Chile de la Construcción (@camarachilenadelaconstruccion), marcando un hito importante en nuestro crecimiento como asociación.\n\nEsta alianza representa mucho más que un acuerdo: es el comienzo de nuevos desafíos que enfrentaremos juntos, fortaleciendo el sector minero de Antofagasta.\n\nSabemos que el camino es largo y queda mucho por recorrer, pero con socios como estos, estamos seguras de que lograremos grandes cosas para nuestra región y nuestra industria.\n\n¡Gracias BHP y CChC por confiar en nosotras! 💪\n\nEn la fotografía están presentes (entre otros): Jorge Maturana Presidente CChC de Antofagasta, Giorgina Kong tesorera de E+minera, Paola Quezada directora E+minera, Marta Aguilera directora E+minera, Pablo Pissani VP de asuntos corporativos y operaciones | BHP, Pamela Garrido Presidenta E+minera, Gobernador Regional Ricardo Díaz, Rosa Ester Salazar Vicepresidenta E+minera, Sacha Razmilic Alcalde de Antofagasta y Carolina Gonzalez Relaciones laborales | BHP.',
      instagramLink: 'https://www.instagram.com/p/DPAV3ugDU0p/?img_index=1',
      imagePlaceholder: 'https://i.ibb.co/YB5PxPr1/Imagen-de-Whats-App-2025-12-02-a-las-20-30-34-c0a9d598.jpg'
    },
    {
      id: 3,
      category: 'Comunidad',
      title: 'Reunión clave en Liceo Politécnico de Taltal',
      date: '02 Dic 2025',
      summary: 'El encuentro permitió avanzar en los preparativos del Seminario E+Minera y consolidar el vínculo educativo.',
      fullText: 'El alcalde de Taltal, junto a Pamela Garrido Cisternas, presidenta de E+Minera, y Rosa Ester Salazar Duarte, vicepresidenta de la organización, sostuvieron una reunión con el Liceo Politécnico de Taltal en el marco de la coordinación para el Seminario E+Minera.\n\nEl encuentro permitió avanzar en los preparativos del evento, fortalecer el trabajo colaborativo con la comunidad educativa y consolidar el vínculo entre la municipalidad, el establecimiento y E+Minera en torno al impulso de nuevas oportunidades formativas y de desarrollo para la región.',
      instagramLink: 'https://www.instagram.com/p/DCt5a4rgqKj/',
      imagePlaceholder: 'https://i.ibb.co/BVKSkj8V/Imagen-de-Whats-App-2025-12-02-a-las-20-31-28-f2cadce5.jpg'
    },
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white overflow-x-hidden">
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slower { animation: spin-slow 120s linear infinite; }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes glow-pulse-primary { 0%, 100% { box-shadow: 0 0 0 0 rgba(8, 214, 198, 0.5); } 50% { box-shadow: 0 0 0 10px rgba(8, 214, 198, 0); } }
        @keyframes glow-pulse-secondary { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.5); } 50% { box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); } }
        @keyframes glow-pulse-accent1 { 0%, 100% { box-shadow: 0 0 0 0 rgba(179, 100, 201, 0.5); } 50% { box-shadow: 0 0 0 10px rgba(179, 100, 201, 0); } }
        
        .glow-pulse-primary { animation: glow-pulse-primary 2s infinite; }
        .glow-pulse-secondary { animation: glow-pulse-secondary 2s infinite; }
        .glow-pulse-accent1 { animation: glow-pulse-accent1 2s infinite; }

        .hover-glow-text:hover { text-shadow: 0 0 8px currentColor; }
      `}</style>

      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }} className="flex items-center group cursor-pointer">
            <img src="https://i.ibb.co/5XpwKNZZ/315559131-189404626952035-3509888069968422434-n.jpg" alt="Logo E+Mineras" className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105" />
          </a>
          <div className="hidden lg:flex space-x-6">
            {navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }} className={`text-sm font-bold uppercase tracking-wider py-2 relative group transition-all duration-300 hover-glow-text ${activeSection === link.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`} style={{ color: activeSection === link.id ? link.color : COLORS.dark }}>
                {link.title}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 ${activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`} style={{ backgroundColor: link.color }}></span>
              </a>
            ))}
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-800">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t absolute w-full shadow-xl">
            {navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={() => { scrollToSection(link.id); setIsMenuOpen(false); }} className="block px-6 py-4 text-sm font-bold uppercase border-b border-gray-50 hover:bg-gray-50" style={{ color: link.color }}>{link.title}</a>
            ))}
          </div>
        )}
      </nav>

      <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
        <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden pointer-events-none">
          <img src="https://i.ibb.co/SgBvQt4/logo-jpg.jpg" alt="Background Logo" className="w-[800px] h-[800px] object-contain opacity-25 animate-spin-slower" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Reveal delay={200}>
            <div className="inline-block px-4 py-1 mb-6 border rounded-full bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: COLORS.secondary }}>Asociación Gremial Antofagasta</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-slate-900 leading-tight tracking-tight">
              Impulsando la <br />
              <span className="text-brand-primary" style={{ color: COLORS.primary }}>Equidad</span> en <br /> Minería y Energía
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light">Conectamos el talento y liderazgo femenino con las oportunidades de la industria para transformar el futuro desde el norte de Chile.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="#unete" className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-full transition-all shadow-xl flex items-center justify-center group overflow-hidden relative hover:shadow-2xl hover:-translate-y-1">
                <span className="relative z-10 flex items-center">Únete a nosotras <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 group-hover:from-brand-purple group-hover:to-brand-primary transition-colors duration-500 opacity-0 group-hover:opacity-100 z-0"></div>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="bg-slate-900 py-12 border-y border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => {
              const { count, ref } = useCounter(stat.number);
              return (
                <div key={index} ref={ref} className="group hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-center mb-3 text-white/20 group-hover:text-white/80 transition-colors">
                    <stat.icon size={32} style={{ color: stat.color }} />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-1">{count}{index === 3 ? '%' : index === 0 ? '' : '+'}</h3>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section id="quienes-somos" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <SectionTitle>Quiénes Somos</SectionTitle>
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <Reveal variant="fade-right" delay={100}>
              <TiltCard className="h-full p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-teal-400"></div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-teal-50 text-brand-teal" style={{ backgroundColor: `${COLORS.primary}1A`, color: COLORS.primary }}>
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Nuestra Misión</h3>
                <p className="text-gray-600 leading-relaxed">Promover la equidad de género y la participación activa de las mujeres en todos los ámbitos empresariales y empoderar a las mujeres empresarias.</p>
              </TiltCard>
            </Reveal>

            <Reveal variant="fade-left" delay={200}>
              <TiltCard className="h-full p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-orange-50 text-brand-orange" style={{ backgroundColor: `${COLORS.secondary}1A`, color: COLORS.secondary }}>
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Nuestra Visión</h3>
                <p className="text-gray-600 leading-relaxed">Ser la asociación líder en la promoción del emprendimiento femenino, brindando herramientas para el desarrollo integral y representando sus intereses.</p>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="directorio" className="py-24 bg-slate-50 relative">
        <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle>Nuestro Directorio</SectionTitle>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {boardMembers.map((member, idx) => (
              <BoardMemberCard key={idx} {...member} delay={idx * 50} />
            ))}
          </div>
        </div>
      </section>

      <section id="objetivos" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src="https://i.ibb.co/whtcKSch/Sociales-Primer-Seminario-E-Mineras-2.jpg"
            alt="Background"
            className="w-full h-full object-cover object-center blur-lg scale-110"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=EVENTO+E+MINERAS"; }}
          />
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle>Estrategia 2026–2028</SectionTitle>
          <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid lg:grid-cols-12 border border-gray-100">
            <div className="p-10 md:p-12 lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
              <Reveal delay={100} variant="fade-right">
                <span className="text-sm font-bold tracking-widest uppercase mb-3 block" style={{ color: COLORS.secondary }}>Hoja de Ruta</span>
                <h2 className="text-3xl font-black text-slate-900 mb-6 leading-snug" style={{ color: COLORS.primary }}>
                  Elevando el Estándar Técnico
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">Nuestro propósito es posicionar a la asociación como un actor influyente, técnico y articulador. Buscamos fortalecer a nuestras socias para aumentar la **tasa de adjudicación de contratos**.</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: `${COLORS.primary}20`, color: COLORS.primary }}><Zap className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">Técnico</h4>
                      <p className="text-slate-600 text-sm">Normativas, seguridad y excelencia operacional.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: `${COLORS.secondary}20`, color: COLORS.secondary }}><TrendingUp className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">Comercial</h4>
                      <p className="text-slate-600 text-sm">Aumento en la tasa de adjudicación de contratos.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-full flex-shrink-0 shadow-md" style={{ backgroundColor: `${COLORS.accent1}20`, color: COLORS.accent1 }}><Award className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 mb-1">Relacional</h4>
                      <p className="text-slate-600 text-sm">Alianzas estratégicas con actores clave de la industria.</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="relative lg:col-span-7 min-h-[400px] lg:min-h-full order-1 lg:order-2 overflow-hidden bg-gray-100 flex items-center justify-center">
              <Reveal delay={300} className="h-full w-full">
                <div className="h-full w-full group flex items-center justify-center">
                  <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                      src="https://i.ibb.co/1YGvTLj6/Imagen-de-Whats-App-2025-12-03-a-las-12-04-19-9e49bbc2.jpg"
                      alt="Primer Seminario E+Mineras"
                      className="object-contain object-center w-full h-full transform hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/1e293b/ffffff?text=FOTO+GRUPO"; }}
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="programas" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle>Programas y Áreas de Trabajo</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: HardHat, title: "Capacitación Técnica", desc: "Talleres especializados en normativas mineras y estándares de seguridad.", color: COLORS.primary, bg: `${COLORS.primary}1A`, pulseClass: "glow-pulse-primary" },
              { icon: Users, title: "Networking", desc: "Ruedas de negocios y encuentros estratégicos con mandantes de la industria.", color: COLORS.secondary, bg: `${COLORS.secondary}1A`, pulseClass: "glow-pulse-secondary" },
              { icon: Sparkles, title: "Innovación", desc: "Fomento a la digitalización y adopción de nuevas tecnologías.", color: COLORS.accent1, bg: `${COLORS.accent1}1A`, pulseClass: "glow-pulse-accent1" }
            ].map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <TiltCard className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col items-start hover:border-gray-200 transition-colors">
                  <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 ${item.pulseClass} shadow-sm`} style={{ backgroundColor: item.bg, color: item.color }}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <JoinForm />

      <section id="inscripcion-evento" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange opacity-10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <SectionTitle>Inscripción al Evento</SectionTitle>
          <Reveal variant="fade-up">
            <div className="w-full h-[700px] md:h-[900px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <iframe
                src="https://forms.cloud.microsoft/e/UnmXf3wKtX"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Formulario de Inscripción al Evento E+Mineras"
                allowFullScreen
              ></iframe>
            </div>
          </Reveal>
        </div>
      </section>


      <section id="noticias" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <SectionTitle>Noticias y Eventos</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {newsItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 150}>
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-2">
                  <div className="h-52 overflow-hidden relative">
                    <img
                      src={item.imagePlaceholder}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900 shadow-sm">{item.date}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: COLORS.secondary }}>{item.category}</span>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-brand-teal transition-colors" style={{ color: COLORS.dark }}>{item.title}</h4>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{item.summary}</p>
                    <button onClick={() => setSelectedNews(item)} className="text-slate-900 font-bold text-sm flex items-center mt-auto transition-colors group-hover:underline decoration-2 underline-offset-4" style={{ color: COLORS.primary }}>Leer más <ArrowRight className="ml-2 w-4 h-4" /></button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      </section>

      <section id="contacto" className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid md:grid-cols-2 border border-gray-100">
            <div className="p-10 md:p-12 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-purple rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-teal rounded-full blur-3xl opacity-20"></div>

              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-6">Contáctanos</h3>
                <p className="text-gray-400 mb-10 text-lg">Estamos listas para responder tus dudas y darte la bienvenida.</p>

                <div className="space-y-8">
                  <div className="flex items-start gap-5 group">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: COLORS.secondary }}><Mail className="w-6 h-6" /></div>
                    <div>
                      <h5 className="font-bold mb-1 text-lg">Correos</h5>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>presidenta@emineras.cl</p>
                        <p>secretaria@emineras.cl</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: COLORS.primary }}><MapPin className="w-6 h-6" /></div>
                    <div>
                      <h5 className="font-bold mb-1 text-lg">Ubicación</h5>
                      <p className="text-sm text-gray-400">Antofagasta, Chile</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <a href="https://www.linkedin.com/company/eminera_afta" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-white/5 hover:bg-brand-purple transition-all hover:scale-110"><Linkedin className="w-5 h-5" /></a>
                  <a href="https://www.instagram.com/eminera_afta/" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-white/5 hover:bg-brand-purple transition-all hover:scale-110"><Instagram className="w-5 h-5" /></a>
                </div>
              </div>
            </div>

            <div className="p-10 md:p-12 bg-gray-50">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Envíanos un mensaje</h3>
              <form className="space-y-5">
                <div className="group">
                  <input type="text" placeholder="Nombre Completo" className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 transition-all outline-none group-hover:border-gray-300" style={{ '--tw-ring-color': COLORS.secondary }} />
                </div>
                <div className="group">
                  <input type="email" placeholder="Correo Electrónico" className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 transition-all outline-none group-hover:border-gray-300" style={{ '--tw-ring-color': COLORS.secondary }} />
                </div>
                <div className="group">
                  <textarea rows={4} placeholder="Mensaje" className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 transition-all outline-none resize-none group-hover:border-gray-300" style={{ '--tw-ring-color': COLORS.secondary }}></textarea>
                </div>
                <button className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95" style={{ backgroundColor: COLORS.secondary }}>Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-10 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-opacity">
            <Globe size={20} className="text-white" />
            <span className="text-white font-bold text-xl tracking-wider">E+MINERAS</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div >
  );
}