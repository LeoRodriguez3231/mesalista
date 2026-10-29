import { deISO } from './reservas.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const fechaLarga = (iso) =>
  cap(deISO(iso).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }));

export const diaCorto = (iso) => {
  const d = deISO(iso);
  return { nombre: DIAS_CORTOS[(d.getDay() + 6) % 7], numero: d.getDate() };
};

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
