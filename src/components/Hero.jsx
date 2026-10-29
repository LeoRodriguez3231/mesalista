import Marquee from './Marquee.jsx';
import { plural } from '../lib/formato.js';

/**
 * Portada a pantalla completa (estilo editorial): fondo oscuro cálido, marca enorme y datos "vivos".
 * Si existe /public/hero.jpg se usa como fotografía de fondo con una capa oscura encima.
 */
export default function Hero({ reservasHoy }) {
  return (
    <section className="hero" aria-label="La Casona">
      <div className="hero__top">
        <span className="caption">Cocina peruana de autor</span>
        <span className="caption">★ 4.8 / 5</span>
        <span className="caption">Miraflores · Lima</span>
      </div>

      <div className="hero__centro">
        <h1 className="hero__marca">La Casona</h1>
        <div className="hero__fila">
          <p className="hero__lema">Reserva en treinta segundos. Sin llamadas, sin esperas.</p>
          <div className="hero__acciones">
            <p className="caption" role="status">
              <strong>{reservasHoy}</strong> {plural(reservasHoy, 'reserva', 'reservas').replace(/^\d+ /, '')} para hoy
            </p>
            <a className="btn btn--primary" href="#reserva">Reservar mesa</a>
          </div>
        </div>
      </div>

      <Marquee />
    </section>
  );
}
