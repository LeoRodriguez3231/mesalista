import { useState, useEffect, useMemo, useRef } from 'react';
import { MESAS, HORARIOS, buscarConflicto, mesasLibres } from '../lib/reservas.js';
import { fechaLarga } from '../lib/formato.js';
import Campo from './Campo.jsx';

/**
 * Formulario de reservas reutilizable (cliente y administrador).
 * - modo "cliente": fecha, hora y personas vienen elegidos; la mesa se asigna sola.
 * - modo "admin": todo es editable y se puede forzar una mesa; el formulario avisa
 *   en tiempo real si hay conflicto y sugiere una mesa libre.
 */
export default function ReservaForm({ modo = 'cliente', inicial, reservas, onSubmit, onCancelar, textoCancelar = 'Volver' }) {
  const admin = modo === 'admin';
  const [form, setForm] = useState({
    nombre: '', telefono: '', notas: '',
    fecha: inicial.fecha, hora: inicial.hora, personas: inicial.personas, mesa: '',
  });
  const [errores, setErrores] = useState({});
  const primero = useRef(null);

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const conflicto = useMemo(
    () => (form.mesa && form.fecha && form.hora ? buscarConflicto(reservas, form, null) : null),
    [reservas, form]
  );
  const libres = useMemo(
    () => (form.fecha && form.hora ? mesasLibres(reservas, form.fecha, form.hora, Number(form.personas) || 1) : []),
    [reservas, form.fecha, form.hora, form.personas]
  );
  const sugerida = libres[0] || null;
  const mesaAuto = !admin ? sugerida : null;

  // Tiempo real: si cambia fecha/hora/personas/mesa, los errores anteriores ya no aplican.
  useEffect(() => {
    setErrores({});
  }, [form.fecha, form.hora, form.personas, form.mesa]);

  useEffect(() => {
    primero.current?.focus();
  }, []);

  const enviar = (e) => {
    e.preventDefault();
    const resultado = onSubmit({
      ...form,
      personas: Number(form.personas),
      mesa: form.mesa ? Number(form.mesa) : undefined,
    });
    if (!resultado.ok) setErrores(resultado.errores || {});
  };

  const errorGeneral = errores.hora || errores.fecha;

  return (
    <form className="form" onSubmit={enviar} noValidate>
      {!admin && (
        <div className="resumen" aria-label="Resumen de tu reserva">
          <strong>{fechaLarga(form.fecha)} · {form.hora}</strong>
          <span>
            {form.personas} {form.personas === 1 ? 'persona' : 'personas'} ·{' '}
            {mesaAuto ? `Mesa ${mesaAuto.id} asignada` : 'Sin mesa disponible'}
          </span>
        </div>
      )}

      {admin && (
        <div className="form__fila">
          <Campo id="rf-fecha" etiqueta="Fecha" error={errores.fecha}>
            <input id="rf-fecha" type="date" value={form.fecha} onChange={(e) => cambiar('fecha', e.target.value)} />
          </Campo>
          <Campo id="rf-hora" etiqueta="Hora" error={errores.hora}>
            <select id="rf-hora" value={form.hora} onChange={(e) => cambiar('hora', e.target.value)}>
              {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </Campo>
        </div>
      )}

      <Campo id="rf-nombre" etiqueta={admin ? 'Cliente' : 'Nombre completo'} error={errores.nombre}>
        <input
          id="rf-nombre" ref={primero} type="text" autoComplete="name" placeholder="Ej. Ana Torres"
          value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)}
          aria-invalid={!!errores.nombre} aria-describedby={errores.nombre ? 'rf-nombre-error' : undefined}
        />
      </Campo>

      <Campo id="rf-telefono" etiqueta="Teléfono" error={errores.telefono} ayuda="Te escribiremos si hay algún cambio.">
        <input
          id="rf-telefono" type="tel" inputMode="tel" autoComplete="tel" placeholder="+51 999 888 777"
          value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)}
          aria-invalid={!!errores.telefono} aria-describedby={errores.telefono ? 'rf-telefono-error' : undefined}
        />
      </Campo>

      {admin && (
        <div className="form__fila">
          <Campo id="rf-personas" etiqueta="Personas" error={errores.personas}>
            <input id="rf-personas" type="number" min="1" max="10" value={form.personas} onChange={(e) => cambiar('personas', e.target.value)} />
          </Campo>
          <Campo id="rf-mesa" etiqueta="Mesa" error={errores.mesa}>
            <select id="rf-mesa" value={form.mesa} onChange={(e) => cambiar('mesa', e.target.value)}>
              <option value="">Asignar automáticamente</option>
              {MESAS.map((m) => {
                const libre = libres.some((l) => l.id === m.id);
                return (
                  <option key={m.id} value={m.id}>
                    Mesa {m.id} · {m.capacidad} pers.{libre ? '' : ' (no disponible)'}
                  </option>
                );
              })}
            </select>
          </Campo>
        </div>
      )}

      <Campo id="rf-notas" etiqueta="Notas (opcional)">
        <textarea id="rf-notas" rows="2" placeholder="Alergias, cumpleaños…" value={form.notas} onChange={(e) => cambiar('notas', e.target.value)} />
      </Campo>

      {admin && conflicto && (
        <div className="banner banner--error" role="alert">
          <p>
            Conflicto — la Mesa {conflicto.mesa} ya está reservada a las {conflicto.hora} ({conflicto.nombre} · {conflicto.personas} pers.).
            {sugerida ? ` La Mesa ${sugerida.id} está libre.` : ' No quedan mesas libres en este horario.'}
          </p>
          {sugerida && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => cambiar('mesa', String(sugerida.id))}>
              Usar Mesa {sugerida.id}
            </button>
          )}
        </div>
      )}
      {admin && form.mesa && !conflicto && !errores.mesa && (
        <div className="banner banner--ok" role="status">Disponible — la Mesa {form.mesa} está disponible.</div>
      )}
      {errorGeneral && <div className="banner banner--error" role="alert">{errorGeneral}</div>}

      <div className="form__acciones">
        <button type="button" className="btn btn--ghost" onClick={onCancelar}>{textoCancelar}</button>
        <button type="submit" className="btn btn--primary" disabled={admin ? !!conflicto : !mesaAuto}>
          {admin ? 'Guardar reserva' : 'Confirmar reserva'}
        </button>
      </div>
    </form>
  );
}
