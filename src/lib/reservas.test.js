import { describe, it, expect } from 'vitest';
import {
  seSolapan, buscarConflicto, mesasLibres, asignarMesa, crearReserva, horariosDelDia,
  nivelDemanda, conteoPorFecha, validar, sumarDias,
} from './reservas.js';

const base = [
  { id: 'a', codigo: 'MR-2001', fecha: '2026-10-29', hora: '20:00', personas: 4, mesa: 4, nombre: 'R. Vega', telefono: '999888777', estado: 'confirmada' },
];

describe('solapamiento', () => {
  it('detecta horarios que se pisan (la reserva dura 2 h)', () => {
    expect(seSolapan('20:00', '21:30')).toBe(true);
    expect(seSolapan('20:00', '22:00')).toBe(false);
    expect(seSolapan('19:00', '20:30')).toBe(true);
  });
});

describe('conflictos', () => {
  it('encuentra conflicto en la misma mesa y fecha', () => {
    expect(buscarConflicto(base, { fecha: '2026-10-29', hora: '21:00', mesa: 4 })).toBeTruthy();
  });
  it('no hay conflicto en otra mesa, otra fecha, o si estaba cancelada', () => {
    expect(buscarConflicto(base, { fecha: '2026-10-29', hora: '20:00', mesa: 6 })).toBeNull();
    expect(buscarConflicto(base, { fecha: '2026-10-30', hora: '20:00', mesa: 4 })).toBeNull();
    const canceladas = [{ ...base[0], estado: 'cancelada' }];
    expect(buscarConflicto(canceladas, { fecha: '2026-10-29', hora: '20:00', mesa: 4 })).toBeNull();
  });
});

describe('asignación de mesas', () => {
  it('elige la mesa más ajustada al grupo', () => {
    expect(asignarMesa([], '2026-10-29', '20:00', 2).id).toBe(1);
    expect(asignarMesa([], '2026-10-29', '20:00', 5).id).toBe(7);
  });
  it('excluye mesas ocupadas', () => {
    const libres = mesasLibres(base, '2026-10-29', '20:00', 4).map((m) => m.id);
    expect(libres.includes(4)).toBe(false);
    expect(libres.includes(3)).toBe(true);
  });
});

describe('crearReserva', () => {
  const datos = { nombre: 'Ana Torres', telefono: '+51 999 888 777', personas: 4, fecha: '2026-10-29', hora: '20:00' };
  it('crea y asigna mesa automáticamente', () => {
    const r = crearReserva(base, datos);
    expect(r.ok).toBe(true);
    expect(r.reserva.mesa).not.toBe(4);
    expect(r.reservas.length).toBe(2);
  });
  it('rechaza duplicados con sugerencia de mesa libre', () => {
    const r = crearReserva(base, { ...datos, mesa: 4 });
    expect(r.ok).toBe(false);
    expect(r.conflicto.id).toBe('a');
    expect(r.sugerencia).toBeTruthy();
    expect(r.sugerencia.id).not.toBe(4);
  });
  it('valida campos obligatorios', () => {
    const claves = Object.keys(validar({ nombre: '', telefono: '1', personas: 0 }));
    ['nombre', 'telefono', 'personas', 'fecha', 'hora'].forEach((c) => expect(claves.includes(c)).toBe(true));
    expect(crearReserva(base, { ...datos, nombre: '' }).ok).toBe(false);
  });
  it('no pasa si la mesa es chica para el grupo', () => {
    expect(crearReserva([], { ...datos, personas: 6, mesa: 1 }).ok).toBe(false);
  });
});

describe('disponibilidad y demanda', () => {
  it('marca horarios sin mesas libres como no disponibles', () => {
    const llenas = Array.from({ length: 10 }, (_, i) => ({ id: `x${i}`, fecha: '2026-10-29', hora: '20:00', mesa: i + 1, estado: 'confirmada' }));
    const h = horariosDelDia(llenas, '2026-10-29', 2, new Date(2026, 9, 1, 8, 0)).find((x) => x.hora === '20:00');
    expect(h.disponible).toBe(false);
  });
  it('clasifica la demanda y cuenta por fecha', () => {
    expect(nivelDemanda(9)).toBe('alta');
    expect(nivelDemanda(5)).toBe('media');
    expect(nivelDemanda(1)).toBe('baja');
    expect(conteoPorFecha(base)['2026-10-29']).toBe(1);
  });
  it('suma días entre meses', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01');
  });
});
