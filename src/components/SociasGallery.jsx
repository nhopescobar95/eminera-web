import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import socias from '../content/socias.json';
import './SociasGallery.css';

export default function SociasGallery() {
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);
  const [position, setPosition] = useState({ first: 0, last: 0, atEnd: false });
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const track = trackRef.current;
    const update = () => {
      const cards = [...track.children];
      const bounds = track.getBoundingClientRect();
      const visible = cards.map((card, index) => ({ index, rect: card.getBoundingClientRect() }))
        .filter(({ rect }) => rect.left < bounds.right - 2 && rect.right > bounds.left + 2);
      setPosition({ first: visible[0]?.index ?? 0, last: visible.at(-1)?.index ?? 0,
        atEnd: track.scrollLeft >= track.scrollWidth - track.clientWidth - 2 });
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => { observer.disconnect(); track.removeEventListener('scroll', update); };
  }, []);

  const navigate = (direction) => {
    const track = trackRef.current;
    const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
    const index = Math.round(track.scrollLeft / step);
    track.scrollTo({ left: (index + direction) * step, behavior: reducedMotion() ? 'instant' : 'smooth' });
  };
  const startDrag = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick.current = false;
    dragRef.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
  };
  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (!drag.moved && Math.abs(delta) > 6) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add('is-dragging');
    }
    if (drag.moved) { event.preventDefault(); event.currentTarget.scrollLeft = drag.scroll - delta; }
  };
  const endDrag = (event) => {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (drag?.moved) {
      suppressClick.current = true;
      const track = event.currentTarget;
      const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
      track.scrollTo({ left: Math.round(track.scrollLeft / step) * step, behavior: reducedMotion() ? 'instant' : 'smooth' });
      setTimeout(() => { suppressClick.current = false; }, 0);
    }
  };

  return (
    <section id="socias" className="socias-gallery" aria-labelledby="socias-heading" aria-roledescription="carrusel">
      <div className="socias-inner">
        <header className="socias-header">
          <p className="socias-eyebrow">Mujeres que mueven la minería</p>
          <h2 id="socias-heading">Conoce a nuestras <span>socias</span></h2>
          <p>Talento, experiencia y liderazgo que conectan nuestra red. Descubre a las mujeres y empresas que forman E+Minera.</p>
        </header>
        <div className="socias-toolbar">
          <p aria-live="polite" aria-atomic="true">{position.first + 1}{position.last > position.first ? `–${position.last + 1}` : ''} <span>de {socias.length} socias</span></p>
          <div className="socias-arrows">
            <button type="button" aria-label="Ver socia anterior" aria-controls="socias-track" disabled={position.first === 0} onClick={() => navigate(-1)}><ChevronLeft aria-hidden="true" /></button>
            <button type="button" aria-label="Ver siguiente socia" aria-controls="socias-track" disabled={position.atEnd} onClick={() => navigate(1)}><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div id="socias-track" ref={trackRef} className="socias-track" tabIndex={0} aria-label="Fichas de socias. Usa las flechas del teclado o desliza para explorar."
          onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
          onClickCapture={(event) => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}
          onKeyDown={(event) => { if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1); } }}>
          {socias.map((socia, index) => (
            <article key={socia.id} className="socia-card" aria-label={`${index + 1} de ${socias.length}: ${socia.name}`}>
              <img src={`/socias/${socia.id}.webp`} width="1080" height="1920" alt={`Ficha de ${socia.name}, ${socia.company}, con fotografía y datos de contacto.`}
                loading={index < 3 ? 'eager' : 'lazy'} decoding="async" draggable="false" />
              <a className="socia-hotspot" style={socia.hotspot} href={socia.url} target="_blank" rel="noopener noreferrer"
                aria-label={`Conocer a ${socia.name} – visitar ${socia.company}${socia.id === 12 ? ' en Instagram' : ''} (abre en una nueva pestaña)`} />
            </article>
          ))}
        </div>
        <p className="socias-hint">Desliza para explorar · Selecciona «¡Conócela!» para visitar cada empresa</p>
      </div>
    </section>
  );
}
