const PLATOS = ['Ceviche clásico', 'Lomo saltado', 'Ají de gallina', 'Tiradito nikkei', 'Causa limeña', 'Anticuchos', 'Arroz con mariscos', 'Suspiro limeño'];

/** Letrero de platos que se desplaza: único elemento con movimiento continuo del diseño. */
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copia) =>
          PLATOS.map((p) => (
            <span key={`${copia}-${p}`} className="marquee__item">{p}</span>
          ))
        )}
      </div>
    </div>
  );
}
