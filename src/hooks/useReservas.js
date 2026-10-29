import { useState, useEffect, useCallback, useRef } from 'react';
import { crearReserva, reservasSemilla } from '../lib/reservas.js';

const KEY = 'mesalista:reservas:v1';

const cargar = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* almacenamiento no disponible: usamos datos de ejemplo */
  }
  return reservasSemilla();
};

/**
 * Hook central de estado: reservas + persistencia + sincronización entre pestañas.
 * - useState: guarda la lista de reservas.
 * - useEffect (1): persiste en localStorage cada vez que cambian.
 * - useEffect (2): escucha cambios hechos desde OTRA pestaña/ventana (tiempo real),
 *   así dos personas no pueden reservar la misma mesa sin enterarse.
 */
export function useReservas() {
  const [reservas, setReservas] = useState(cargar);
  const ultimas = useRef(reservas); // siempre apunta a la lista más reciente (evita carreras)
  ultimas.current = reservas;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(reservas));
    } catch {
      /* sin persistencia */
    }
  }, [reservas]);

  useEffect(() => {
    const alCambiarAlmacenamiento = (e) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        setReservas(JSON.parse(e.newValue));
      } catch {
        /* ignorar datos corruptos */
      }
    };
    window.addEventListener('storage', alCambiarAlmacenamiento);
    return () => window.removeEventListener('storage', alCambiarAlmacenamiento);
  }, []);

  const agregar = useCallback((datos) => {
    const resultado = crearReserva(ultimas.current, datos);
    if (resultado.ok) {
      ultimas.current = resultado.reservas;
      setReservas(resultado.reservas);
    }
    return resultado;
  }, []);

  const cancelar = useCallback((id) => {
    const siguiente = ultimas.current.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r));
    ultimas.current = siguiente;
    setReservas(siguiente);
  }, []);

  const reiniciar = useCallback(() => {
    const datos = reservasSemilla();
    ultimas.current = datos;
    setReservas(datos);
  }, []);

  return { reservas, agregar, cancelar, reiniciar };
}
