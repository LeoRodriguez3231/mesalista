import { useState, useMemo, useCallback } from 'react';
import { aISO, deISO, conteoPorFecha, reservasDelDia, mesasLibres } from '../lib/reservas.js';
import Calendario from './Calendario.jsx';
import ListaReservas from './ListaReservas.jsx';
import ReservaForm from './ReservaForm.jsx';
import Modal from './Modal.jsx';

export default function AdminView({ reservas, agregar, cancelar, reiniciar, onToast }) {
  const hoy = aISO(new Date());
  const [fecha, setFecha] = useState(hoy);
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [modal, setModal] = useState(false);

  const conteo = useMemo(() => conteoPorFecha(reservas), [reservas]);
  const delDia = useMemo(() => reservasDelDia(reservas, fecha), [reservas, fecha]);
  const libres20 = useMemo(() => mesasLibres(reservas, fecha, '20:00', 1).length, [reservas, fecha]);
  const altas = useMemo(() => Object.values(conteo).filter((n) => n >= 8).length, [conteo]);

  const seleccionar = useCallback((iso) => {
    setFecha(iso);
    const d = deISO(iso);
    setMes((m) => (d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() ? m : new Date(d.getFullYear(), d.getMonth(), 1)));
  }, []);

  const cerrar = useCallback(() => setModal(false), []);

  const pedirCancelacion = (r) => {
    if (window.confirm(`¿Cancelar la reserva de ${r.nombre} (${r.hora})?`)) {
      cancelar(r.id);
      onToast(`Reserva ${r.codigo} cancelada`);
    }
  };

  return (
    <div className="admin">
      <div className="admin__head">
        <div>
          <p className="caption">Panel del restaurante</p>
          <h1 className="admin__titulo">Calendario de reservas</h1>
          <p className="muted">Selecciona un día para ver y gestionar sus reservas.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}>+ Nueva reserva</button>
      </div>

      <div className="stats">
        <div className="stat"><div><strong>{delDia.length}</strong><span>reservas del día</span></div></div>
        <div className="stat"><div><strong>{libres20}</strong><span>mesas libres 20:00</span></div></div>
        <div className="stat stat--alta"><div><strong>{altas}</strong><span>días de alta demanda</span></div></div>
      </div>

      <div className="admin__cuerpo">
        <Calendario mes={mes} onMes={setMes} conteo={conteo} seleccionada={fecha} onSelect={seleccionar} />
        <ListaReservas fecha={fecha} reservas={delDia} libres20={libres20} onCancelar={pedirCancelacion} />
      </div>

      <button type="button" className="link" onClick={() => { reiniciar(); onToast('Datos de ejemplo restaurados'); }}>
        Restaurar datos de ejemplo
      </button>

      {modal && (
        <Modal titulo="Nueva reserva" onCerrar={cerrar}>
          <ReservaForm
            modo="admin"
            inicial={{ fecha, hora: '20:00', personas: 2 }}
            reservas={reservas}
            textoCancelar="Cancelar"
            onCancelar={cerrar}
            onSubmit={(datos) => {
              const res = agregar(datos);
              if (res.ok) {
                cerrar();
                seleccionar(datos.fecha);
                onToast(`Reserva ${res.reserva.codigo} guardada · Mesa ${res.reserva.mesa}`);
              }
              return res;
            }}
          />
        </Modal>
      )}
    </div>
  );
}
