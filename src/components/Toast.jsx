export default function Toast({ toast }) {
  return (
    <div className="toast-zone" aria-live="polite" role="status">
      {toast && (
        <div className="toast" key={toast.id}>
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}
