import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// --- CONFIGURA TU SUPABASE ---
const supabaseUrl = "https://dbhzwjgfknkyiesudnji.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiaHp3amdma25reWllc3VkbmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTIxMjYsImV4cCI6MjA3NjYyODEyNn0.-_SubqCHNLF5QfbqOFAl7jJuemyAOrwLp9WkbbEx5MM"; // Usa la anon key de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);
// Funcionalidad básica para el modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const cancelBooking = document.getElementById("cancel-booking");
const timeSlots = document.querySelectorAll(".time-slot:not(.booked)");
const bookingForm = document.getElementById("booking-form");
const bookingMsg = document.getElementById("booking-msg");
const weekGrid = document.getElementById("week-grid");
const weekRange = document.getElementById("week-range");
const prevWeekBtn = document.getElementById("prev-week");
const nextWeekBtn = document.getElementById("next-week");

let selectedDate = null;
let selectedTime = null;
let currentWeek = 0;
const today = new Date();
today.setHours(0, 0, 0, 0);
// Abrir modal al hacer clic en un horario disponible
timeSlots.forEach((slot) => {
  slot.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});
// --- FUNCIONES PARA GENERAR SEMANA ---
function getWeekDates(weekOffset = 0) {
  const start = new Date(today);
  const dayOfWeek = start.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  start.setDate(start.getDate() - diffToMonday + weekOffset * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d) {
  return d.toLocaleDateString("es-CO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
// Función para verificar si un horario ya pasó
function isTimePassed(date, time) {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);

  return slotDateTime < now;
}

// --- RENDERIZAR SEMANA ---
async function renderWeek() {
  const weekDates = getWeekDates(currentWeek);
  const startDate = weekDates[0];
  const endDate = weekDates[6];
  weekRange.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

  weekGrid.innerHTML = "";
  const horarios = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  // --- CONSULTAR CITAS OCUPADAS EN ESTA SEMANA ---
  const { data: citas, error } = await supabase
    .from("citas")
    .select("*")
    .gte("fecha", startDate.toISOString().split("T")[0])
    .lte("fecha", endDate.toISOString().split("T")[0]);

  if (error) {
    console.error("Error cargando citas:", error.message);
  }

  weekDates.forEach((date) => {
    if (date < today) return;

    const dayCol = document.createElement("div");
    dayCol.className = "day-column";

    const header = document.createElement("div");
    header.className = "day-header";
    header.textContent = formatDate(date);
    dayCol.appendChild(header);

    horarios.forEach((h) => {
      const slot = document.createElement("div");
      slot.className = "time-slot";
      slot.textContent = h;

      const dateStr = date.toISOString().split("T")[0];
      const ocupado = citas?.some((c) => c.fecha === dateStr && c.hora === h);
      const tiempoPasado = isTimePassed(date, h);

      if (ocupado) {
        slot.classList.add("ocupado");
        slot.textContent = h + " (Ocupado)";
      } else if (tiempoPasado) {
        slot.classList.add("pasado");
        slot.textContent = h + " (Pasado)";
      } else {
        slot.addEventListener("click", () => openBookingModal(date, h));
      }

      dayCol.appendChild(slot);
    });

    weekGrid.appendChild(dayCol);
  });
}

// --- NAVEGACIÓN ENTRE SEMANAS ---
prevWeekBtn.addEventListener("click", () => {
  if (currentWeek > 0) {
    currentWeek--;
    renderWeek();
  }
});
nextWeekBtn.addEventListener("click", () => {
  currentWeek++;
  renderWeek();
});

renderWeek();

function openBookingModal(date, time) {
  selectedDate = date;
  selectedTime = time;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Cerrar modal
function closeModalFunc() {
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
}

closeModal.addEventListener("click", closeModalFunc);
cancelBooking.addEventListener("click", closeModalFunc);
// Cerrar modal al hacer clic fuera del contenido
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFunc();
});

// --- GUARDAR EN SUPABASE ---
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  bookingMsg.textContent = "Guardando reserva...";

  const { nombre, email, telefono, servicio, mensaje } = bookingForm.elements;

  const { error } = await supabase.from("citas").insert([
    {
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      servicio: servicio.value,
      motivo: mensaje.value,
      fecha: selectedDate.toISOString().split("T")[0],
      hora: selectedTime,
    },
  ]);

  if (error) {
    bookingMsg.textContent = "❌ Error al guardar: " + error.message;
  } else {
    bookingMsg.textContent =
      "✅ Reserva confirmada ¡ PRONTO TE CONTACTAREMOS !";
    bookingForm.reset();
    setTimeout(() => {
      closeModalFunc();
      renderWeek(); // 🔄 Recargar semana para que aparezca como ocupado
    }, 1500);
  }
});
