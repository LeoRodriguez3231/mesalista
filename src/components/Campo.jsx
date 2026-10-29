/** Campo de formulario reutilizable: etiqueta + control + mensaje de error accesible. */
export default function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && !error && <small className="campo__ayuda">{ayuda}</small>}
      {error && (
        <small id={`${id}-error`} className="campo__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
