import { useState, useEffect, useCallback } from 'react';
import { useReservas } from './hooks/useReservas.js';
import ClienteView from './components/ClienteView.jsx';
import AdminView from './components/AdminView.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  const { reservas, agregar, cancelar, reiniciar } = useReservas();
  const [vista, setVista] = useState('cliente');
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensaje) => setToast({ mensaje, id: Date.now() }), []);

  useEffect(() => {
    document.title = vista === 'cliente' ? 'Reservar mesa · MesaLista' : 'Panel del restaurante · MesaLista';
  }, [vista]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="app" id="top">
      <div className="checker" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand__logo" aria-hidden="true">MR</span>
          <span className="brand__name">MesaLista</span>
          <span className="brand__sub">La Casona · Miraflores</span>
        </div>
        <nav className="tabs" aria-label="Cambiar de vista">
          <button type="button" className="tab" aria-pressed={vista === 'cliente'} onClick={() => setVista('cliente')}>
            Soy cliente
          </button>
          <button type="button" className="tab" aria-pressed={vista === 'admin'} onClick={() => setVista('admin')}>
            Soy administrador
          </button>
        </nav>
      </header>

      <main className={`main main--${vista}`} key={vista}>
        {vista === 'cliente' ? (
          <ClienteView reservas={reservas} agregar={agregar} onToast={mostrarToast} />
        ) : (
          <AdminView reservas={reservas} agregar={agregar} cancelar={cancelar} reiniciar={reiniciar} onToast={mostrarToast} />
        )}
      </main>

      <div className="checker" aria-hidden="true" />
      <section className="wall" aria-label="Despedida">
        <h2 className="wall__titulo">Te esperamos</h2>
        <p>La Casona · Miraflores, Lima · Todos los días de 12:00 a 22:30</p>
        <a className="btn btn--blanco" href="#top">Volver arriba</a>
      </section>
      <footer className="footer">MesaLista · Reservas sin duplicados, en tiempo real</footer>

      <Toast toast={toast} />
    </div>
  );
}
