const PASOS = ['Elige', 'Tus datos', 'Listo'];

/** Indicador de progreso del flujo de reserva (1 · 2 · 3). */
export default function Pasos({ actual }) {
  return (
    <ol className="pasos" aria-label="Progreso de la reserva">
      {PASOS.map((nombre, i) => {
        const n = i + 1;
        const estado = n < actual ? 'hecho' : n === actual ? 'actual' : 'pendiente';
        return (
          <li key={nombre} className={`paso paso--${estado}`} aria-current={estado === 'actual' ? 'step' : undefined}>
            <span className="paso__num">{estado === 'hecho' ? '✓' : `0${n}`}</span>
            <span className="paso__txt">{nombre}</span>
          </li>
        );
      })}
    </ol>
  );
}
