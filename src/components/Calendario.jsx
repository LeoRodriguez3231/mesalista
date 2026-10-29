import { useMemo } from 'react';
import { aISO, nivelDemanda } from '../lib/reservas.js';
import { MESES, DIAS_CORTOS, plural } from '../lib/formato.js';

export default function Calendario({ mes, onMes, conteo, seleccionada, onSelect }) {
  const hoy = aISO(new Date());

  const celdas = useMemo(() => {
    const primero = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const desfase = (primero.getDay() + 6) % 7; // semana empieza en lunes
    const inicio = new Date(primero);
    inicio.setDate(1 - desfase);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return { iso: aISO(d), dia: d.getDate(), fuera: d.getMonth() !== mes.getMonth() };
    });
  }, [mes]);

  const moverMes = (delta) => onMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

  return (
    <section className="calendario" aria-label="Calendario de reservas">
      <div className="calendario__head">
        <h2 aria-live="polite">{MESES[mes.getMonth()]} {mes.getFullYear()}</h2>
        <div className="calendario__nav">
          <button type="button" className="icon-btn" onClick={() => moverMes(-1)} aria-label="Mes anterior">‹</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onMes(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Hoy</button>
          <button type="button" className="icon-btn" onClick={() => moverMes(1)} aria-label="Mes siguiente">›</button>
        </div>
      </div>

      <div className="calendario__grid">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="calendario__dow">{d}</div>
        ))}
        {celdas.map((c) => {
          const n = conteo[c.iso] || 0;
          const nivel = nivelDemanda(n);
          return (
            <button
              key={c.iso}
              type="button"
              className={`celda celda--${nivel}${c.fuera ? ' celda--fuera' : ''}${c.iso === hoy ? ' celda--hoy' : ''}`}
              aria-pressed={c.iso === seleccionada}
              aria-label={`${c.dia} de ${MESES[Number(c.iso.slice(5, 7)) - 1]}: ${plural(n, 'reserva', 'reservas')}${nivel === 'alta' ? ', alta demanda' : ''}`}
              onClick={() => onSelect(c.iso)}
            >
              <span className="celda__num">{c.dia}</span>
              {n > 0 && <span className="celda__tag">{n}<span className="celda__txt"> {n === 1 ? 'reserva' : 'reservas'}</span></span>}
            </button>
          );
        })}
      </div>

      <div className="leyenda-cal" aria-hidden="true">
        <span className="chip chip--baja">Normal</span>
        <span className="chip chip--media">Movido (4+)</span>
        <span className="chip chip--alta">Alta demanda (8+)</span>
      </div>
    </section>
  );
}
