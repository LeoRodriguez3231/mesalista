export default function SelectorPersonas({ valor, onCambiar, min = 1, max = 10 }) {
  return (
    <div className="stepper" role="group" aria-label="Número de personas">
      <button type="button" className="stepper__btn" onClick={() => onCambiar(Math.max(min, valor - 1))} disabled={valor <= min} aria-label="Menos personas">−</button>
      <output className="stepper__valor" aria-live="polite">{valor}</output>
      <button type="button" className="stepper__btn" onClick={() => onCambiar(Math.min(max, valor + 1))} disabled={valor >= max} aria-label="Más personas">+</button>
    </div>
  );
}
