// Lógica de dominio pura (sin React): fácil de probar y de reutilizar.

export const DURACION_MIN = 120; // cada reserva ocupa la mesa 2 horas

export const MESAS = [
  { id: 1, capacidad: 2 },
  { id: 2, capacidad: 2 },
  { id: 3, capacidad: 4 },
  { id: 4, capacidad: 4 },
  { id: 5, capacidad: 4 },
  { id: 6, capacidad: 4 },
  { id: 7, capacidad: 6 },
  { id: 8, capacidad: 6 },
  { id: 9, capacidad: 8 },
  { id: 10, capacidad: 10 },
];

// Turnos del restaurante: almuerzo y cena, cada 30 minutos.
export const HORARIOS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

export const ALTA_DEMANDA = 8; // reservas/día a partir de las cuales se marca "alta demanda"

export const aMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export const aISO = (fecha) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const deISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const sumarDias = (iso, n) => {
  const f = deISO(iso);
  f.setDate(f.getDate() + n);
  return aISO(f);
};

/** ¿Dos reservas de la misma fecha se solapan en el tiempo? */
export const seSolapan = (horaA, horaB) => {
  const a = aMinutos(horaA);
  const b = aMinutos(horaB);
  return a < b + DURACION_MIN && b < a + DURACION_MIN;
};

/** Reserva activa que choca con la nueva (misma fecha, misma mesa, horarios solapados). */
export const buscarConflicto = (reservas, nueva, ignorarId = null) =>
  reservas.find(
    (r) =>
      r.id !== ignorarId &&
      r.estado !== 'cancelada' &&
      r.fecha === nueva.fecha &&
      Number(r.mesa) === Number(nueva.mesa) &&
      seSolapan(r.hora, nueva.hora)
  ) || null;

export const mesaLibre = (reservas, fecha, hora, mesa, ignorarId = null) =>
  !buscarConflicto(reservas, { fecha, hora, mesa }, ignorarId);

/** Mesas libres para una fecha/hora/personas, ordenadas de la que mejor se ajusta a la más grande. */
export const mesasLibres = (reservas, fecha, hora, personas, ignorarId = null) =>
  MESAS.filter(
    (m) => m.capacidad >= personas && mesaLibre(reservas, fecha, hora, m.id, ignorarId)
  ).sort((a, b) => a.capacidad - b.capacidad || a.id - b.id);

export const asignarMesa = (reservas, fecha, hora, personas) =>
  mesasLibres(reservas, fecha, hora, personas)[0] || null;

/** Horarios del día con la cantidad de mesas libres para ese número de personas. */
export const horariosDelDia = (reservas, fecha, personas, ahora = new Date()) => {
  const esHoy = fecha === aISO(ahora);
  const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
  return HORARIOS.map((hora) => {
    const libres = mesasLibres(reservas, fecha, hora, personas).length;
    const pasado = esHoy && aMinutos(hora) <= minAhora;
    return { hora, libres, disponible: libres > 0 && !pasado, pasado };
  });
};

export const reservasDelDia = (reservas, fecha) =>
  reservas
    .filter((r) => r.fecha === fecha && r.estado !== 'cancelada')
    .sort((a, b) => aMinutos(a.hora) - aMinutos(b.hora));

export const conteoPorFecha = (reservas) =>
  reservas.reduce((acc, r) => {
    if (r.estado !== 'cancelada') acc[r.fecha] = (acc[r.fecha] || 0) + 1;
    return acc;
  }, {});

export const nivelDemanda = (cantidad) =>
  cantidad >= ALTA_DEMANDA ? 'alta' : cantidad >= 4 ? 'media' : 'baja';

export const generarCodigo = (reservas) => {
  const max = reservas.reduce(
    (m, r) => Math.max(m, Number(String(r.codigo || '').replace(/\D/g, '')) || 0),
    2000
  );
  return `MR-${max + 1}`;
};

/** Valida el formulario. Devuelve un objeto { campo: 'mensaje' } (vacío si todo está bien). */
export const validar = ({ nombre, telefono, personas, fecha, hora }) => {
  const errores = {};
  if (!nombre || nombre.trim().length < 3) errores.nombre = 'Ingresa tu nombre completo (mínimo 3 letras).';
  const tel = (telefono || '').replace(/[\s()+-]/g, '');
  if (!/^\d{7,12}$/.test(tel)) errores.telefono = 'Ingresa un teléfono válido (7 a 12 dígitos).';
  if (!personas || personas < 1) errores.personas = 'Indica cuántas personas asistirán.';
  else if (personas > Math.max(...MESAS.map((m) => m.capacidad))) errores.personas = 'Para grupos grandes llama al restaurante.';
  if (!fecha) errores.fecha = 'Elige una fecha.';
  if (!hora) errores.hora = 'Elige un horario.';
  return errores;
};

const nuevoId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

/** Crea una reserva validando conflictos. Función pura: no modifica el arreglo recibido. */
export const crearReserva = (reservas, datos) => {
  const errores = validar(datos);
  if (Object.keys(errores).length) return { ok: false, errores };

  const mesa = datos.mesa
    ? Number(datos.mesa)
    : asignarMesa(reservas, datos.fecha, datos.hora, datos.personas)?.id;
  if (!mesa) {
    return { ok: false, errores: { hora: 'No quedan mesas libres en ese horario. Prueba con otro.' } };
  }
  const mesaInfo = MESAS.find((m) => m.id === mesa);
  if (mesaInfo && mesaInfo.capacidad < datos.personas) {
    return { ok: false, errores: { mesa: `La mesa ${mesa} es para ${mesaInfo.capacidad} personas como máximo.` } };
  }
  const conflicto = buscarConflicto(reservas, { ...datos, mesa });
  if (conflicto) {
    const sugerencia = mesasLibres(reservas, datos.fecha, datos.hora, datos.personas)[0] || null;
    return {
      ok: false,
      conflicto,
      sugerencia,
      errores: { mesa: `La mesa ${mesa} ya está reservada a las ${conflicto.hora}.` },
    };
  }
  const reserva = {
    id: nuevoId(),
    codigo: generarCodigo(reservas),
    fecha: datos.fecha,
    hora: datos.hora,
    personas: Number(datos.personas),
    mesa,
    nombre: datos.nombre.trim(),
    telefono: datos.telefono.trim(),
    notas: (datos.notas || '').trim(),
    estado: 'confirmada',
  };
  return { ok: true, reserva, reservas: [...reservas, reserva] };
};

/** Datos de ejemplo relativos a hoy para que el calendario no se vea vacío. */
export const reservasSemilla = (hoy = new Date()) => {
  const base = aISO(hoy);
  const nombres = ['Familia Rojas', 'M. Quispe', 'R. Vega', 'Empresa ACME', 'L. Paredes', 'A. Salas', 'J. Flores', 'P. Castro'];
  const plan = [
    [0, '13:00', 6, 7], [0, '20:00', 4, 4], [0, '20:30', 2, 1],
    [1, '19:30', 2, 2], [1, '20:00', 4, 3], [1, '20:00', 4, 4], [1, '21:00', 4, 5], [1, '13:00', 4, 6],
    [2, '12:30', 2, 1], [2, '20:00', 8, 9], [2, '20:00', 6, 7], [2, '20:00', 4, 3], [2, '20:30', 4, 4],
    [2, '19:30', 4, 5], [2, '21:30', 2, 2], [2, '13:00', 10, 10],
    [3, '19:00', 2, 1], [3, '20:30', 4, 3],
    [5, '14:00', 6, 8], [5, '20:00', 4, 4],
  ];
  return plan.map(([dia, hora, personas, mesa], i) => ({
    id: `seed-${i}`,
    codigo: `MR-${2000 - i}`,
    fecha: sumarDias(base, dia),
    hora,
    personas,
    mesa,
    nombre: nombres[i % nombres.length],
    telefono: '999888777',
    notas: '',
    estado: 'confirmada',
  }));
};
