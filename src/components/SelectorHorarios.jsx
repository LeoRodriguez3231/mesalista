const turno = (h) => (Number(h.split(':')[0]) < 17 ? 'Almuerzo' : 'Cena');

export default function SelectorHorarios({ horarios, valor, onCambiar }) {
  const grupos = ['Almuerzo', 'Cena'].map((t) => ({ t, items: horarios.filter((h) => turno(h.hora) === t) }));
  return (
    <div className="horarios">
      {grupos.map(({ t, items }) => (
        <section key={t} aria-label={`Horarios de ${t.toLowerCase()}`}>
          <h4 className="horarios__turno">{t}</h4>
          <div className="horarios__grid">
            {items.map((h) => (
              <button
                key={h.hora}
                type="button"
                className={`slot${h.disponible ? '' : ' slot--ocupado'}`}
                aria-pressed={valor === h.hora}
                disabled={!h.disponible}
                onClick={() => onCambiar(h.hora)}
                aria-label={`${h.hora}, ${h.disponible ? `${h.libres} mesas libres` : h.pasado ? 'ya pasó' : 'sin mesas'}`}
              >
                {h.hora}
              </button>
            ))}
          </div>
        </section>
      ))}
      <p className="leyenda">Libre · Seleccionado · <s>Ocupado</s></p>
    </div>
  );
}
