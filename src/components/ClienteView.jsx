import { useState, useEffect, useMemo } from 'react';
import { aISO, sumarDias, horariosDelDia, conteoPorFecha } from '../lib/reservas.js';
import SelectorFecha from './SelectorFecha.jsx';
import SelectorPersonas from './SelectorPersonas.jsx';
import SelectorHorarios from './SelectorHorarios.jsx';
import ReservaForm from './ReservaForm.jsx';
import Confirmacion from './Confirmacion.jsx';
import Hero from './Hero.jsx';
import Pasos from './Pasos.jsx';

export default function ClienteView({ reservas, agregar, onToast }) {
  const dias = useMemo(() => {
    const hoy = aISO(new Date());
    return Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i));
  }, []);

  const [fecha, setFecha] = useState(dias[0]);
  const [personas, setPersonas] = useState(2);
  const [hora, setHora] = useState(null);
  const [paso, setPaso] = useState('elegir'); // elegir -> datos -> ok
  const [confirmada, setConfirmada] = useState(null);

  const horarios = useMemo(() => horariosDelDia(reservas, fecha, personas), [reservas, fecha, personas]);
  const conteo = useMemo(() => conteoPorFecha(reservas), [reservas]);
  const reservasHoy = conteo[dias[0]] || 0;
  const escasos = horarios.find((h) => h.disponible && h.libres <= 3);

  // Tiempo real: si el horario elegido se ocupa (otra pestaña/persona), lo quitamos y avisamos.
  useEffect(() => {
    if (hora && !horarios.some((h) => h.hora === hora && h.disponible)) {
      setHora(null);
      if (paso === 'datos') {
        setPaso('elegir');
        onToast('Ese horario se acaba de ocupar. Elige otro.');
      }
    }
  }, [horarios, hora, paso, onToast]);

  const reiniciar = () => {
    setPaso('elegir');
    setHora(null);
    setConfirmada(null);
  };

  let contenido;
  if (paso === 'ok' && confirmada) {
    contenido = <Confirmacion reserva={confirmada} onNueva={reiniciar} />;
  } else if (paso === 'datos') {
    contenido = (
      <section aria-labelledby="titulo-datos">
        <h3 id="titulo-datos" className="etiqueta">Tus datos</h3>
        <ReservaForm
          modo="cliente"
          inicial={{ fecha, hora, personas }}
          reservas={reservas}
          textoCancelar="← Volver"
          onCancelar={() => setPaso('elegir')}
          onSubmit={(datos) => {
            const res = agregar(datos);
            if (res.ok) {
              setConfirmada(res.reserva);
              setPaso('ok');
              onToast(`Reserva ${res.reserva.codigo} confirmada`);
            }
            return res;
          }}
        />
      </section>
    );
  } else {
    contenido = (
      <section aria-label="Elige fecha, personas y horario">
        <div className="bloque">
          <h3 className="etiqueta">Fecha</h3>
          <SelectorFecha dias={dias} valor={fecha} onCambiar={setFecha} conteo={conteo} />
        </div>

        <div className="bloque">
          <h3 className="etiqueta">Personas</h3>
          <SelectorPersonas valor={personas} onCambiar={setPersonas} />
        </div>

        <div className="bloque">
          <h3 className="etiqueta">Horarios disponibles</h3>
          {escasos && (
            <div className="banner banner--aviso" role="status">
              Alta demanda — quedan {escasos.libres} {escasos.libres === 1 ? 'mesa' : 'mesas'} a las {escasos.hora}
            </div>
          )}
          <SelectorHorarios horarios={horarios} valor={hora} onCambiar={setHora} />
        </div>

        <button type="button" className="btn btn--primary btn--block" disabled={!hora} onClick={() => setPaso('datos')}>
          {hora ? `Continuar · ${hora}` : 'Elige un horario'}
        </button>
      </section>
    );
  }

  const titulos = { elegir: 'Reserva tu mesa', datos: 'Casi listo', ok: 'Hasta pronto' };
  const textos = {
    elegir: 'Elige fecha, personas y horario. Te asignamos la mejor mesa disponible.',
    datos: 'Solo necesitamos tu nombre y un teléfono de contacto.',
    ok: 'Tu mesa te está esperando.',
  };

  return (
    <div className="cliente">
      <Hero reservasHoy={reservasHoy} />
      <div className="starband" aria-hidden="true" />
      <section className="reserva" id="reserva" aria-label="Reserva en línea">
        <div className="reserva__intro">
          <p className="caption">Reservas en línea</p>
          <h2 className="titulo-seccion">{titulos[paso]}</h2>
          <p className="muted">{textos[paso]}</p>
          <Pasos actual={paso === 'elegir' ? 1 : paso === 'datos' ? 2 : 3} />
        </div>
        <div className="reserva__contenido">{contenido}</div>
      </section>
    </div>
  );
}
