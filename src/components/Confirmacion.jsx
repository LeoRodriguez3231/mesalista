import { fechaLarga } from '../lib/formato.js';

export default function Confirmacion({ reserva, onNueva }) {
  return (
    <section className="confirmacion" aria-labelledby="conf-titulo">
      <div className="check" aria-hidden="true">✓</div>
      <h3 id="conf-titulo" className="confirmacion__titulo">Reserva confirmada</h3>
      <p className="caption">Código {reserva.codigo}</p>
      <dl className="ticket">
        <div><dt>Restaurante</dt><dd>La Casona · Miraflores</dd></div>
        <div><dt>Fecha</dt><dd>{fechaLarga(reserva.fecha)} · {reserva.hora}</dd></div>
        <div><dt>Mesa</dt><dd>{reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'} · Mesa {reserva.mesa}</dd></div>
        <div><dt>A nombre de</dt><dd>{reserva.nombre}</dd></div>
      </dl>
      <p className="muted">Muestra tu código al llegar.</p>
      <button type="button" className="btn" onClick={onNueva}>Hacer otra reserva</button>
    </section>
  );
}
