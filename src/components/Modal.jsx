import { useEffect, useRef } from 'react';

/** Diálogo accesible: cierra con Escape o clic fuera, bloquea el scroll del fondo y devuelve el foco. */
export default function Modal({ titulo, onCerrar, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const previo = document.activeElement;
    const alTeclear = (e) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', alTeclear);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, [onCerrar]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={ref}>
        <div className="modal__head">
          <h2>{titulo}</h2>
          <button type="button" className="icon-btn" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
