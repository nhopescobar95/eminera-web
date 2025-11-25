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
  MessageSquare,
  Copy,
  Check,
  ArrowRight,
  Monitor,
  Phone, 
  Building, 
  User,
  MousePointerClick
} from 'lucide-react';

// --- Definición de Colores ---
const COLORS = {
  primary: '#0cc4b8', // Turquesa - Tecnología, Future
  secondary: '#fb6b31', // Naranja - Energía, Acción
  accent1: '#c881d3', // Morado - Liderazgo
  accent2: '#f8bd26', // Amarillo - Resalte
  dark: '#1e293b', // Azul oscuro (Texto general)
  light: '#ffffff',
  bg: '#f8fafc', // Fondo sutil
};

// --- Configuración de la API de Gemini ---
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=";
const apiKey = ""; // La clave se inyecta en tiempo de ejecución

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

// --- Componente de Animación al Scroll (Reveal) ---
const Reveal = ({ children, className = "", delay = 0 }) => {
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- Componentes UI ---

const SectionTitle = ({ children, color = COLORS.dark }) => (
  <Reveal>
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 text-center" style={{ color }}>
      {children}
    </h2>
  </Reveal>
);

const BoardMemberCard = ({ name, role, company, isSub, delay }) => (
  <Reveal delay={delay}>
    <div className={`relative p-6 rounded-2xl transition-all duration-500 border-t-4 group hover:-translate-y-2 bg-white overflow-hidden ${isSub ? 'border-gray-300 shadow-md' : 'border-brand-purple shadow-xl hover:shadow-2xl'}`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${isSub ? 'bg-gray-800' : 'bg-brand-purple'}`}></div>
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-xl shadow-lg transform group-hover:scale-110 transition-transform duration-500 ${isSub ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-brand-purple to-purple-600'}`}>
          {name.charAt(0)}
        </div>
        <h3 className="font-bold text-xl text-slate-900 group-hover:text-brand-purple transition-colors duration-300">{name}</h3>
        <div className={`h-0.5 w-12 my-3 rounded-full ${isSub ? 'bg-gray-300' : 'bg-brand-purple'}`}></div>
        <p className={`font-bold text-xs uppercase tracking-widest mb-4 ${isSub ? 'text-gray-500' : 'text-brand-purple'}`}>{role}</p>
        <div className="flex items-start text-gray-600 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-gray-200 transition-colors">
          <Briefcase size={16} className="mr-2 mt-0.5 flex-shrink-0 text-brand-orange" />
          <span className="leading-snug">{company}</span>
        </div>
      </div>
    </div>
  </Reveal>
);

// --- Componente Herramientas IA ---
const AITool = ({ type, title, description, promptGenerator, systemInstruction }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');

    try {
      const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptGenerator(input) }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error al generar respuesta.';
      setOutput(text);
    } catch (e) {
      setOutput("Error de conexión con la IA. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${type === 'pitch' ? 'bg-brand-purple/10 text-brand-purple' : 'bg-brand-teal/10 text-brand-teal'}`}>
          {type === 'pitch' ? <MessageSquare size={24} /> : <Mail size={24} />}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      
      <div className="relative mb-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={type === 'pitch' ? 'Describe tu empresa y servicios (Ej: Ofrecemos mantenimiento predictivo con sensores IoT para la minería...)' : 'Describe el objetivo del correo (Ej: Solicitar reunión con el gerente de planta de Codelco para presentar nuestros servicios de seguridad...)'}
          rows={5}
          className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none text-slate-700 placeholder-gray-400"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
          Potenciado por Gemini AI
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={isLoading || !input.trim()}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg
          ${isLoading || !input.trim() 
            ? 'bg-gray-300 cursor-not-allowed' 
            : `bg-brand-purple hover:bg-purple-700 active:scale-[0.99]`
          }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Generando...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" /> Generar Respuesta
          </>
        )}
      </button>

      {output && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Resultado Generado</span>
            <button 
              onClick={() => copyToClipboard(output, setCopied)} 
              className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-teal-700 transition-colors"
            >
              {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar texto</>}
            </button>
          </div>
          <div className="p-6 rounded-xl bg-slate-50 border border-gray-100 relative">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{output}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Componente Sección Herramientas IA (Con Flujo de Selección) ---
const IAToolsSection = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <section id="ia-tools" className="py-24 bg-slate-900 relative overflow-hidden min-h-[800px] flex flex-col justify-center">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-teal rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-purple rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle color="#fff">Herramientas Inteligentes</SectionTitle>
        
        {!selectedTool ? (
          // VISTA DE SELECCIÓN
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto text-lg">
              Selecciona el asistente virtual que necesitas hoy para potenciar tu negocio.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Opción Pitch */}
              <button 
                onClick={() => setSelectedTool('pitch')}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-brand-purple/50 hover:shadow-[0_0_30px_rgba(200,129,211,0.2)] flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-[#f8bd26] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(248,189,38,0.3)]">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Generador de Pitch</h3>
                <p className="text-gray-400 leading-relaxed flex-grow">
                  Crea un discurso persuasivo de 30 segundos ideal para ruedas de negocios. Convierte tu idea en una presentación de impacto.
                </p>
                <div className="mt-8 flex items-center font-bold text-sm group-hover:translate-x-2 transition-transform" style={{ color: '#c881d3', textShadow: '0 0 8px rgba(200, 129, 211, 0.8)' }}>
                  Comenzar <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </button>

              {/* Opción Email */}
              <button 
                onClick={() => setSelectedTool('email')}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-left hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-brand-teal/50 hover:shadow-[0_0_30px_rgba(12,196,184,0.2)] flex flex-col h-full"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-[#f8bd26] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(248,189,38,0.3)]">
                  <Mail size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Redactor de Correos</h3>
                <p className="text-gray-400 leading-relaxed flex-grow">
                  Transforma tus ideas en correos formales y técnicos. Perfecto para contactar gerentes y presentar servicios.
                </p>
                <div className="mt-8 flex items-center font-bold text-sm group-hover:translate-x-2 transition-transform" style={{ color: '#c881d3', textShadow: '0 0 8px rgba(200, 129, 211, 0.8)' }}>
                  Comenzar <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          // VISTA DE HERRAMIENTA
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <button 
              onClick={() => setSelectedTool(null)}
              className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Volver a la selección</span>
            </button>

            {selectedTool === 'pitch' && (
              <AITool 
                type="pitch" 
                title="Generador de Pitch Minero" 
                description="Describe tu empresa y servicios. La IA creará un discurso corto y persuasivo enfocado en el valor."
                promptGenerator={(input) => `Genera un elevator pitch para: ${input}`}
                systemInstruction="Eres experto en negocios mineros. Crea un pitch corto (max 40 seg) y persuasivo, estructura: Problema, Solución, Valor."
              />
            )}

            {selectedTool === 'email' && (
              <AITool 
                type="email" 
                title="Redactor de Correos Corporativos" 
                description="Indica el propósito del correo y el destinatario. La IA redactará un mensaje formal y efectivo."
                promptGenerator={(input) => `Redacta un correo formal para: ${input}`}
                systemInstruction="Eres un asistente ejecutivo experto en minería. Redacta correos formales, concisos y orientados a resultados."
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Modal de Noticias ---
const NewsModal = ({ news, onClose }) => {
  if (!news) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition z-10">
            <X className="w-5 h-5" />
          </button>

          <img
            src={news.imagePlaceholder}
            alt={news.title}
            className="w-full h-64 object-cover rounded-lg mb-6 shadow-sm"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=E+MINERAS"; }}
          />

          <div className="flex items-center gap-2 mb-2">
             <span className="px-2 py-1 rounded text-xs font-bold uppercase" style={{backgroundColor: COLORS.bg, color: COLORS.secondary}}>{news.category || 'Noticia'}</span>
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
              className="flex items-center px-6 py-3 text-sm font-bold rounded-full shadow-md transition duration-300 transform hover:scale-105 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Instagram className="w-5 h-5 mr-2" /> Ver en Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Registro Evento ---
const EventRegistration = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    organizacion: '',
    cargo: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Inscripción enviada:', formData);
    setSubmitted(true);
    // Aquí iría la lógica para enviar a backend
  };

  return (
    <section id="inscripcion" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange opacity-10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionTitle>Inscripción al Meet Up</SectionTitle>
        
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Info Panel */}
          <div className="lg:w-2/5 p-10 text-white flex flex-col justify-between relative bg-slate-900">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-purple opacity-90"></div>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
             
             <div className="relative z-10">
               <span className="inline-block px-3 py-1 bg-brand-orange text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">Evento Fin de Año</span>
               <h3 className="text-3xl font-black mb-4 leading-tight">Meet UP: Mujeres, Minería y Desarrollo</h3>
               <p className="text-gray-300 mb-8 leading-relaxed">
                 La Asociación Gremial Empresarias en Minería y Energía de la Región de Antofagasta E+MINERA AG le invita a nuestro evento exclusivo de cierre de año.
               </p>
               
               <div className="space-y-4 text-sm">
                 <div className="flex items-start">
                   <Calendar className="w-5 h-5 mr-3 text-brand-teal flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-white">Jueves 04 de Diciembre</p>
                     <p className="text-gray-400">A partir de las 08:30 hrs</p>
                   </div>
                 </div>
                 <div className="flex items-start">
                   <MapPin className="w-5 h-5 mr-3 text-brand-teal flex-shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-white">Hotel Antofagasta</p>
                     <p className="text-gray-400">Av. Balmaceda 2575, Antofagasta</p>
                   </div>
                 </div>
               </div>
             </div>

             <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
               <p className="text-xs text-gray-400">Cupos limitados. Se requiere confirmación previa mediante este formulario.</p>
             </div>
          </div>

          {/* Form Panel */}
          <div className="lg:w-3/5 p-10">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Inscripción Exitosa!</h3>
                <p className="text-gray-600 mb-8">Hemos recibido tus datos correctamente. Te enviaremos la confirmación a tu correo electrónico.</p>
                <button onClick={() => setSubmitted(false)} className="text-brand-primary font-semibold hover:underline">
                  Inscribir a otra persona
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h4 className="text-xl font-bold text-slate-800 mb-6">Completa tus datos</h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-brand-orange" /> Nombre y Apellido *
                    </label>
                    <input 
                      required
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                      placeholder="Ej: María Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-brand-orange" /> Correo Electrónico *
                    </label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                      placeholder="correo@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-brand-orange" /> Teléfono *
                  </label>
                  <input 
                    required
                    type="tel" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-brand-orange" /> Organización *
                    </label>
                    <input 
                      required
                      type="text" 
                      name="organizacion"
                      value={formData.organizacion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-brand-orange" /> Cargo *
                    </label>
                    <input 
                      required
                      type="text" 
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all outline-none"
                      placeholder="Ej: Gerenta General"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-brand-primary hover:shadow-lg transition-all transform hover:-translate-y-1 mt-4"
                >
                  Confirmar Asistencia
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Componente Principal APP ---
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [selectedNews, setSelectedNews] = useState(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    }
  };

  // Handle scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    // 'Inicio' removed from nav links text
    { id: 'quienes-somos', title: 'Quiénes Somos', color: COLORS.secondary },
    { id: 'objetivos', title: 'Objetivos', color: COLORS.accent2 },
    { id: 'directorio', title: 'Directorio', color: COLORS.accent1 },
    { id: 'programas', title: 'Programas', color: COLORS.primary },
    { id: 'ia-tools', title: 'Herramientas IA', color: COLORS.secondary },
    { id: 'inscripcion', title: 'Inscripción Evento', color: COLORS.primary }, // New Nav Link
    { id: 'noticias', title: 'Noticias', color: COLORS.accent2 },
    { id: 'contacto', title: 'Contacto', color: COLORS.accent1 },
  ];

  const boardMembers = [
    { name: 'Pamela Garrido Cisternas', role: 'Presidenta', company: 'Gerenta General EMESER Ltda', color: COLORS.accent1, isSub: false },
    { name: 'Rosa Ester Salazar Duarte', role: 'Vicepresidenta', company: 'Gerenta General Grupo ROES', color: COLORS.secondary, isSub: false },
    { name: 'Martha Aguilera Alderete', role: 'Secretaria', company: 'Gerenta Innovación de Electroram', color: COLORS.primary, isSub: false },
    { name: 'Cristina Araya Briones', role: 'Secretaria Subrogante', company: 'Gerenta General Araya Briones Ltda', color: COLORS.primary, isSub: true },
    { name: 'Georgina Kong Medero-Laferte', role: 'Tesorera', company: 'Gerenta General Servicios Generales Kong Ltda', color: COLORS.accent2, isSub: false },
    { name: 'Maria Alejandra Jimenez Uribe', role: 'Tesorera Subrogante', company: 'Gerenta General Novamine Ltda', color: COLORS.accent2, isSub: true },
    { name: 'Paola Quezada Quiñones', role: 'Comunicaciones', company: 'Gerenta General Agencia Redes', color: COLORS.secondary, isSub: false },
  ];

  const newsItems = [
    {
      id: 1,
      category: 'Webinar',
      title: '¿Cómo hacer negocios en Australia?',
      date: '24 Nov 2025',
      summary: 'Descubre las claves para expandir tu empresa al mercado australiano. Un evento imperdible para nuestras socias.',
      fullText: `🇦🇺✨ ¡Atención Socias E+mineras! ✨🇦🇺

¿Estás pensando en internacionalizar tu negocio? Australia ofrece oportunidades únicas para proveedores de minería y energía.

Te invitamos a participar en nuestro próximo webinar exclusivo: "¿Cómo hacer negocios en Australia?", donde expertas compartirán las claves culturales, legales y comerciales para entrar con éxito en este mercado competitivo.

📅 Fecha: Próximamente
📍 Modalidad: Online

No pierdas la oportunidad de conectar y aprender de las mejores. ¡El mundo es nuestro límite! 🌏💼

#Emineras #Internacionalizacion #Australia #MujeresEnMineria #NegociosGlobales`,
      instagramLink: 'https://www.instagram.com/p/DRUOn3gDSYH/?img_index=1',
      imagePlaceholder: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 2,
      category: 'Evento',
      title: 'Encuentro de Mujeres en Minera Centinela',
      date: '20 Nov 2025',
      summary: '¡Potencia femenina en acción! Fuimos parte del 2do Encuentro de Mujeres de Empresas Colaboradoras.',
      fullText: `¡Potencia femenina en acción! 👷‍♀️✨

Ayer fuimos parte del 2do Encuentro de Mujeres de Empresas Colaboradoras en Minera Centinela. Fue una jornada inspiradora donde más de 120 profesionales compartieron sus experiencias, desafíos y visiones para el futuro de la industria.

Como E+mineras, reafirmamos nuestro compromiso de abrir espacios donde el talento no tenga género. Instancias como esta nos demuestran que la colaboración es la clave para fortalecer el liderazgo femenino en faena. ¡Vamos por más! 💪⚒️

#MujeresEnMineria #Emineras #Antofagasta #LiderazgoFemenino #MineraCentinela`,
      instagramLink: 'https://www.instagram.com/p/DC8z1yOgv-L/', // Link simulado a post específico
      imagePlaceholder: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 3,
      category: 'Capacitación',
      title: 'Desafío Capital Humano 2030',
      date: '15 Nov 2025',
      summary: 'La industria necesitará 34.000 nuevos talentos. ¿Estamos preparadas? E+Mineras lidera la conversación.',
      fullText: `¿Sabías que la industria minera necesitará 34.000 nuevos talentos para la próxima década? 📉👩‍🎓

En el último seminario regional sobre Capital Humano, debatimos intensamente sobre la urgencia de la formación técnica especializada. El diagnóstico es claro: faltan manos y, sobre todo, faltan mujeres especialistas.

En E+mineras no nos quedamos en el diagnóstico. Estamos listas para cerrar esa brecha, capacitando a nuestras socias en las competencias del futuro: automatización, operación remota y gestión de datos. La minería 4.0 se escribe con "M" de Mujer. 🚀📚

#CapitalHumano #Mineria40 #Capacitacion #Antofagasta #TalentoFemenino`,
      instagramLink: 'https://www.instagram.com/p/DCt5a4rgqKj/', // Link simulado a post específico
      imagePlaceholder: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop'
    },
  ];

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white overflow-x-hidden">
      <style>{`
        .hover-glow-text:hover { text-shadow: 0 0 8px currentColor; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slower {
          animation: spin-slow 120s linear infinite;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <a 
            href="#inicio" 
            onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}
            className="flex items-center group cursor-pointer"
          >
            <img 
              src="https://i.ibb.co/5XpwKNZZ/315559131-189404626952035-3509888069968422434-n.jpg" 
              alt="Logo E+Mineras" 
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.id); }}
                className={`text-sm font-bold uppercase tracking-wider py-2 relative group transition-all duration-300 hover-glow-text
                  ${activeSection === link.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                `}
                style={{ color: link.color }}
              >
                {link.title}
                <span 
                  className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-300 
                    ${activeSection === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}
                ></span>
              </a>
            ))}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-slate-800">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t absolute w-full shadow-xl animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-6 py-4 text-sm font-bold uppercase border-b border-gray-50 hover:bg-gray-50"
                style={{ color: link.color }}
              >
                {link.title}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="inicio" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
        {/* Background Rotating Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden pointer-events-none">
            <img 
              src="https://i.ibb.co/SgBvQt4/logo-jpg.jpg" 
              alt="Background Logo" 
              className="w-[800px] h-[800px] object-contain opacity-25 animate-spin-slower" 
            />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Reveal>
            <div className="inline-block px-4 py-1 mb-6 border rounded-full bg-white/50 backdrop-blur-sm border-slate-200">
              <span className="text-xs font-bold tracking-widest uppercase" style={{color: COLORS.secondary}}>Asociación Gremial Antofagasta</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-slate-900 leading-tight tracking-tight">
              Impulsando la <br/>
              <span style={{color: COLORS.primary}}>Equidad</span> en <br/>
              Minería y Energía
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light">
              Conectamos el talento y liderazgo femenino con las oportunidades de la industria para transformar el futuro desde el norte de Chile.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="#contacto" className="bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-full hover:scale-105 hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center group">
                Únete a nosotras <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#ia-tools" className="bg-white/30 backdrop-blur-md border border-white/60 text-slate-900 font-bold py-4 px-10 rounded-full hover:bg-white/60 transition-all shadow-lg flex items-center justify-center group">
                <Sparkles className="w-5 h-5 mr-2 text-brand-purple group-hover:animate-pulse" /> Herramientas IA
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section id="quienes-somos" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle>Quiénes Somos</SectionTitle>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Reveal delay={100}>
              <div className="p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group h-full">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-teal-50 text-brand-teal">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Nuestra Misión</h3>
                <p className="text-gray-600 leading-relaxed">Promover la equidad de género y la participación activa de las mujeres en todos los ámbitos empresariales y empoderar a las mujeres empresarias.</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="p-10 rounded-3xl bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all group h-full">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-orange-50 text-brand-orange">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Nuestra Visión</h3>
                <p className="text-gray-600 leading-relaxed">Ser la asociación líder en la promoción del emprendimiento femenino, brindando herramientas para el desarrollo integral y representando sus intereses.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Objetivos */}
      <section id="objetivos" className="py-24 bg-slate-50 overflow-hidden relative">
        <div className="absolute -right-20 top-20 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <Reveal>
                <span className="text-sm font-bold tracking-widest uppercase text-brand-orange mb-2 block">Estrategia 2026–2028</span>
                <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight">
                  Elevando el <br/>
                  <span style={{ color: COLORS.primary }}>Estándar Técnico</span>
                </h2>
                <p className="text-xl text-slate-600 mb-8 font-light">Nuestro propósito es posicionar a la asociación como un actor influyente, técnico y articulador, alineado con la realidad minera de Antofagasta.</p>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-yellow-100 text-brand-orange"><Zap className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">Objetivo Principal</h4>
                    <p className="text-slate-600">Aumentar la tasa de adjudicación de contratos con compañías mineras y energéticas.</p>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="lg:w-1/2">
              <Reveal delay={200}>
                <img 
                  src="https://images.unsplash.com/photo-1591543620704-58a7a4a18c64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Ingeniera en obra" 
                  className="rounded-[2rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Directorio */}
      <section id="directorio" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle>Nuestro Directorio</SectionTitle>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {boardMembers.map((member, idx) => (
              <BoardMemberCard key={idx} {...member} delay={idx * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Programas */}
      <section id="programas" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <SectionTitle>Programas y Áreas de Trabajo</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: HardHat, title: "Capacitación Técnica", desc: "Talleres especializados en normativas mineras y estándares de seguridad.", color: "text-brand-teal", bg: "bg-teal-50" },
              { icon: Users, title: "Networking", desc: "Ruedas de negocios y encuentros estratégicos con mandantes de la industria.", color: "text-brand-orange", bg: "bg-orange-50" },
              { icon: Sparkles, title: "Innovación", desc: "Fomento a la digitalización y adopción de nuevas tecnologías.", color: "text-brand-purple", bg: "bg-purple-50" }
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform h-full">
                  <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Herramientas IA */}
      <IAToolsSection />

      {/* Inscripción Evento */}
      <EventRegistration />

      {/* Noticias */}
      <section id="noticias" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle>Noticias y Eventos</SectionTitle>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {newsItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 100}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
                  <div className="h-48 overflow-hidden relative">
                    <img src={item.imagePlaceholder} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-slate-900 shadow-sm">
                      {item.date}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-2">{item.category}</span>
                    <h4 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-brand-teal transition-colors">{item.title}</h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">{item.summary}</p>
                    <button 
                      onClick={() => setSelectedNews(item)}
                      className="text-slate-900 font-bold text-sm flex items-center mt-auto hover:text-brand-teal transition-colors"
                    >
                      Leer más <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden grid md:grid-cols-2">
            <div className="p-10 md:p-12 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 flex">
                <div className="w-1/4 bg-brand-yellow"></div><div className="w-1/4 bg-brand-teal"></div><div className="w-1/4 bg-brand-purple"></div><div className="w-1/4 bg-brand-orange"></div>
              </div>
              <h3 className="text-3xl font-bold mb-6">Contáctanos</h3>
              <p className="text-gray-400 mb-8">Estamos listas para responder tus dudas y darte la bienvenida.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 text-brand-orange"><Mail className="w-6 h-6" /></div>
                  <div>
                    <h5 className="font-bold mb-1">Correos</h5>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>presidenta@emineras.cl</p>
                      <p>secretaria@emineras.cl</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/10 text-brand-teal"><MapPin className="w-6 h-6" /></div>
                  <div>
                    <h5 className="font-bold mb-1">Ubicación</h5>
                    <p className="text-sm text-gray-400">Antofagasta, Chile</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <a href="#" className="p-3 rounded-full bg-white/10 hover:bg-brand-purple transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="https://www.instagram.com/eminera_afta/" className="p-3 rounded-full bg-white/10 hover:bg-brand-purple transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="p-10 md:p-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Envíanos un mensaje</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Nombre Completo" className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-orange transition-all outline-none" />
                <input type="email" placeholder="Correo Electrónico" className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-orange transition-all outline-none" />
                <textarea rows={4} placeholder="Mensaje" className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-orange transition-all outline-none resize-none"></textarea>
                <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-brand-orange transition-colors shadow-lg">Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-1 mb-4 opacity-50">
             <span className="text-white font-bold">E+MINERAS</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
