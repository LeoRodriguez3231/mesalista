import { diaCorto } from '../lib/formato.js';

export default function SelectorFecha({ dias, valor, onCambiar, conteo }) {
  return (
    <div className="fechas" role="group" aria-label="Elige la fecha">
      {dias.map((iso, i) => {
        const { nombre, numero } = diaCorto(iso);
        const activo = iso === valor;
        return (
          <button
            key={iso}
            type="button"
            className="fecha"
            aria-pressed={activo}
            onClick={() => onCambiar(iso)}
            aria-label={`${i === 0 ? 'Hoy, ' : ''}${nombre} ${numero}${(conteo[iso] || 0) >= 8 ? ', alta demanda' : ''}`}
          >
            <span className="fecha__dia">{i === 0 ? 'Hoy' : nombre}</span>
            <span className="fecha__num">{numero}</span>
            {(conteo[iso] || 0) >= 8 && <span className="fecha__punto" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}
