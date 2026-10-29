import { fechaLarga, plural } from '../lib/formato.js';

export default function ListaReservas({ fecha, reservas, libres20, onCancelar }) {
  return (
    <aside className="lista" aria-label="Reservas del día seleccionado">
      <h2>{fechaLarga(fecha)}</h2>
      <p className="muted">{plural(reservas.length, 'reserva', 'reservas')} · {plural(libres20, 'mesa libre', 'mesas libres')} a las 20:00</p>

      {reservas.length === 0 ? (
        <p className="vacio">No hay reservas para este día.</p>
      ) : (
        <ul className="lista__items">
          {reservas.map((r) => (
            <li key={r.id} className="item">
              <span className="item__hora">{r.hora}</span>
              <div className="item__info">
                <strong>{r.nombre}</strong>
                <span>{r.personas} pers · Mesa {r.mesa} · {r.codigo}</span>
                {r.notas && <em>{r.notas}</em>}
              </div>
              <button type="button" className="link link--sm" onClick={() => onCancelar(r)} aria-label={`Cancelar reserva de ${r.nombre}`}>Cancelar</button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
