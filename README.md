# MesaLista · Gestión de reservas de mesas

Aplicación web (React + Vite) para que un restaurante **registre reservas de forma centralizada, evite duplicados y vea un calendario interactivo**, usable desde celular y escritorio. Proyecto de la unidad *Desarrollo de Interfaces 2* (Zegel · Escuela de Tecnología).

- **Prototipo y wireframes en Figma:** https://www.figma.com/design/nsj6ADx8GHILr3BnjQcfjl
- **Integrantes:** Rodriguez Quito , Leo
                   Bermeo Curo, Dayana
                   Cerna Huamani, Richard

---

## 1. Requisitos

| Herramienta | Versión | Comprobar con |
|-------------|---------|---------------|
| Node.js     | 18 o superior (recomendado 20/22 LTS) | `node -v` |
| npm         | 9 o superior (viene con Node)          | `npm -v`  |
| Git         | cualquiera (para subir a GitHub)       | `git --version` |

Si no tienes Node: descárgalo desde https://nodejs.org (botón **LTS**) y reinicia la terminal.

## 2. Instalar y ejecutar

```bash
# 1) Entra a la carpeta del proyecto
cd mesalista

# 2) Instala las dependencias (solo la primera vez)
npm install

# 3) Levanta el servidor de desarrollo
npm run dev
```

Se abrirá el navegador en **http://localhost:5173**. Si no se abre solo, copia esa dirección.

Para verla en el celular (misma red Wi‑Fi): `npm run dev -- --host` y abre la dirección `Network` que muestra la terminal.

## 3. Probar la aplicación

**Pruebas automáticas** (lógica de reservas, conflictos y asignación de mesas):

```bash
npm test
```

**Prueba manual sugerida (2 minutos):**

1. Pestaña **Soy cliente** → elige fecha, 2 personas y el horario 20:00 → *Continuar* → llena nombre y teléfono → *Confirmar reserva*. Verás la pantalla con tu código.
2. Pestaña **Soy administrador** → el calendario marca en rojo los días de **alta demanda**. Haz clic en un día para ver sus reservas.
3. *+ Nueva reserva* → elige una mesa que ya esté ocupada a esa hora (ej. fecha de hoy, 20:00, **Mesa 4**) → aparece el **aviso de conflicto** con la mesa libre sugerida y el botón *Usar Mesa X*; mientras haya conflicto no se puede guardar.
4. **Tiempo real:** abre la app en **dos pestañas**. Reserva en una y mira cómo la otra actualiza horarios y calendario sin recargar.
5. Botón *Restaurar datos de ejemplo* (abajo del panel admin) para volver al estado inicial.

> Los datos se guardan en el `localStorage` del navegador (no hay servidor), para que el proyecto corra sin configurar nada.

**Otros comandos:** `npm run build` (genera `dist/`) · `npm run preview` (sirve el build).

## 4. Estructura del proyecto

```
mesalista/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                 # punto de entrada
   ├─ App.jsx                  # layout, cambio cliente/admin, toasts
   ├─ hooks/
   │  └─ useReservas.js        # estado + persistencia + sincronización entre pestañas
   ├─ lib/
   │  ├─ reservas.js           # lógica pura: conflictos, mesas libres, validación
   │  ├─ reservas.test.js      # pruebas (Vitest)
   │  └─ formato.js            # utilidades de fechas/textos
   ├─ components/              # componentes reutilizables en JSX
   │  ├─ ReservaForm.jsx       # formulario (modo cliente y modo admin)
   │  ├─ Calendario.jsx        # calendario mensual interactivo
   │  ├─ ListaReservas.jsx     # reservas del día seleccionado
   │  ├─ SelectorFecha / SelectorPersonas / SelectorHorarios .jsx
   │  ├─ Hero.jsx · Marquee.jsx · Pasos.jsx   # portada, letrero de platos, progreso
   │  ├─ Campo.jsx · Modal.jsx · Toast.jsx · Confirmacion.jsx
   │  └─ ClienteView.jsx · AdminView.jsx
   └─ styles/app.css           # sistema visual "cartel de restaurante" + responsive
```

## 5. Cómo se usan los hooks (para la sustentación)

| Hook | Dónde | Para qué |
|------|-------|----------|
| `useState` | `useReservas`, `ClienteView`, `AdminView`, `ReservaForm` | Lista de reservas, fecha/personas/hora elegidas, paso del flujo, campos del formulario, errores. |
| `useEffect` | `useReservas` | (1) Guardar en `localStorage` cada vez que cambian las reservas. (2) **Escuchar el evento `storage`** y actualizar al instante lo reservado en otra pestaña → evita conflictos en tiempo real. |
| `useEffect` | `ClienteView` | Si el horario elegido se ocupa mientras el cliente llena sus datos, lo quita y avisa. |
| `useEffect` | `ReservaForm`, `Modal`, `App` | Limpiar errores al cambiar datos, enfocar el primer campo, cerrar con *Escape*, bloquear scroll, temporizador del toast, título de la página. |
| `useMemo` / `useCallback` / `useRef` | varios | Evitar recálculos del calendario y de horarios, funciones estables, y una referencia a la última lista para que dos clics seguidos no dupliquen una reserva. |

**Regla de negocio:** cada reserva ocupa la mesa **2 horas**; dos reservas chocan si es la misma fecha, la misma mesa y sus rangos se solapan (`src/lib/reservas.js → seSolapan / buscarConflicto`). Para el cliente la mesa se asigna sola (la más ajustada al tamaño del grupo); el administrador puede forzar una mesa y recibe aviso + sugerencia si hay conflicto.

## 6. Sistema visual (cartel de restaurante)

Identidad visual del restaurante **La Casona**, con aire de cartel impreso: lienzo blanco, texto carbón `#2B2F36` y **un solo rojo** `#ED2023` para la acción principal y los momentos de marca. Títulos en fuente condensada tipo cartel (**Anton**) y texto en **Space Grotesk** con espaciado amplio. Diseño plano: sin degradados ni desenfoques, botones con radio 7.2 px y una única sombra dura de 4 px que solo aparece al pasar el cursor.

- **Motivos:** cinta de cuadros (arriba y antes del pie), banda roja de estrellas bajo la portada y pared roja "TE ESPERAMOS" al final.
- Las fuentes se cargan desde Google Fonts (necesita internet); sin conexión se usan fuentes del sistema.
- **Foto de portada (opcional):** guarda una imagen en `public/hero.jpg` y aparecerá de fondo con una capa carbón. Sin imagen se ve el fondo carbón liso.
- Los tokens son variables CSS al inicio de `src/styles/app.css`. Para cambiar el nombre del restaurante edita `Hero.jsx`, `App.jsx` y `ClienteView.jsx`.

## 7. Accesibilidad y diseño responsive

- Diseño *mobile‑first*; en pantallas ≥ 960 px el panel de administración pasa a dos columnas (calendario + lista del día).
- Botones y campos con tamaño táctil ≥ 40 px, etiquetas visibles, mensajes de error con `role="alert"`, estados con `aria-pressed`, foco visible y contraste suficiente.
- Se respeta `prefers-reduced-motion` (se desactivan animaciones).

## 8. Subir a GitHub 
```bash
git init
git add .
git commit -m "MesaLista: entrega parcial Desarrollo de Interfaces 2"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/mesalista.git
git push -u origin main
```

Luego, en GitHub: **Settings → Collaborators** (si es privado) y da acceso de **lectura** al docente.
