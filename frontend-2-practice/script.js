// ============================================================
// 1. ДАННЫЕ
// ============================================================

const SERVER_DATA = {
  today: { day: 17, month: 9, year: 2026 },
  slots: [
    { time: "09:00", available: true },
    { time: "10:30", available: false },
    { time: "12:00", available: true },
    { time: "13:30", available: false },
    { time: "15:00", available: true },
    { time: "16:30", available: false },
    { time: "18:00", available: true },
    { time: "19:30", available: false },
  ],
};

const SLOTS_EVEN_DAY = [
  { time: "09:00", available: true },
  { time: "10:30", available: false },
  { time: "12:00", available: true },
  { time: "13:30", available: true },
  { time: "15:00", available: true },
  { time: "16:30", available: false },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

const SLOTS_ODD_DAY = [
  { time: "09:00", available: true },
  { time: "10:30", available: true },
  { time: "12:00", available: false },
  { time: "13:30", available: false },
  { time: "15:00", available: true },
  { time: "16:30", available: true },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

// ============================================================
// 2. СОСТОЯНИЕ
// ============================================================

const BOOKING_STATE = {
  currentMonth: 9,
  currentYear: 2026,
  selectedDay: 17,
  selectedTime: null,
  slots: [],
};

// ============================================================
// 3. ЧИСТЫЕ ФУНКЦИИ
// ============================================================

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const DAYS_OF_WEEK = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота",
];

function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

function isDateSelectable(day, month, year) {
  const today = SERVER_DATA.today;
  return compareDates({ day: day, month: month, year: year }, today) >= 0;
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getSlotsForDay(day, month, year) {
  const isEven = day % 2 === 0;
  const slots = isEven ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
  return { day: day, month: month, year: year, slots: slots };
}

function saveSelectedDate(date, time) {
  const raw = localStorage.getItem("atelier-booking");
  let booking = {};
  if (raw) {
    try {
      booking = JSON.parse(raw);
    } catch (e) {
      booking = {};
    }
  }
  booking.date = date;
  booking.time = time;
  localStorage.setItem("atelier-booking", JSON.stringify(booking));
}

// ============================================================
// 4. ОТРИСОВКА И ОБРАБОТЧИКИ
// ============================================================

function renderCalendar() {
  const monthYearEl = document.getElementById("calendarTitle");
  const calendarGrid = document.getElementById("calendarGrid");

  const year = BOOKING_STATE.currentYear;
  const month = BOOKING_STATE.currentMonth;

  monthYearEl.textContent = MONTHS_NOMINATIVE[month] + " " + year;

  const weeks = buildCalendarGrid(year, month);
  const today = SERVER_DATA.today;

  const oldDays = calendarGrid.querySelectorAll(".day");
  oldDays.forEach(function (el) {
    el.remove();
  });

  weeks.forEach(function (week) {
    week.forEach(function (cell) {
      let classes = "day";
      if (cell.otherMonth) classes += " other-month";

      const isToday =
        !cell.otherMonth &&
        cell.day === today.day &&
        month === today.month &&
        year === today.year;
      if (isToday) classes += " today";

      const isSelected =
        !cell.otherMonth &&
        cell.day === BOOKING_STATE.selectedDay &&
        month === BOOKING_STATE.currentMonth;
      if (isSelected) classes += " selected";

      const selectable = isDateSelectable(cell.day, month, year);
      const isDisabled = !cell.otherMonth && !selectable;
      if (isDisabled) classes += " disabled";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = classes;
      btn.textContent = cell.day;
      btn.dataset.day = cell.day;
      btn.dataset.other = cell.otherMonth;

      if (isDisabled || cell.otherMonth) {
        btn.disabled = true;
      }

      calendarGrid.appendChild(btn);
    });
  });

  const dayCells = calendarGrid.querySelectorAll(
    ".day:not(.other-month):not(.disabled)"
  );
  dayCells.forEach(function (cell) {
    cell.addEventListener("click", onDayClick);
  });
}

function onDayClick(event) {
  const cell = event.currentTarget;
  const day = parseInt(cell.dataset.day);

  BOOKING_STATE.selectedDay = day;
  BOOKING_STATE.selectedTime = null;

  const response = getSlotsForDay(
    day,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.currentYear
  );
  BOOKING_STATE.slots = response.slots;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

function renderTimeSlots() {
  const timeGrid = document.getElementById("slotsGrid");
  const slotsDate = document.getElementById("slotsDate");
  const slots = BOOKING_STATE.slots;

  const dateObj = new Date(
    BOOKING_STATE.currentYear,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.selectedDay
  );
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[BOOKING_STATE.currentMonth];
  slotsDate.textContent =
    dayName + ", " + BOOKING_STATE.selectedDay + " " + monthName;

  if (!slots || slots.length === 0) {
    timeGrid.innerHTML =
      '<div class="slots-empty">В этот день нет доступного времени</div>';
    return;
  }

  timeGrid.innerHTML = "";

  slots.forEach(function (slot) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = slot.time;
    btn.dataset.time = slot.time;

    if (!slot.available) {
      btn.classList.add("disabled");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", onTimeSlotClick);
    }

    if (slot.time === BOOKING_STATE.selectedTime && slot.available) {
      btn.classList.add("selected");
    }

    timeGrid.appendChild(btn);
  });
}

function onTimeSlotClick(event) {
  const slot = event.currentTarget;
  const time = slot.dataset.time;
  BOOKING_STATE.selectedTime = time;
  renderTimeSlots();
  updateBottomBar();
}

function updateBottomBar() {
  const valueEl = document.getElementById("selectionValue");

  const day = BOOKING_STATE.selectedDay;
  const month = BOOKING_STATE.currentMonth;
  const year = BOOKING_STATE.currentYear;

  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];

  const timePart = BOOKING_STATE.selectedTime
    ? BOOKING_STATE.selectedTime
    : "время не выбрано";

  valueEl.textContent =
    dayName + ", " + day + " " + monthName + " " + year + " • " + timePart;
}

function setupMonthNavigation() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth -= 1;
      if (BOOKING_STATE.currentMonth < 0) {
        BOOKING_STATE.currentMonth = 11;
        BOOKING_STATE.currentYear -= 1;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth += 1;
      if (BOOKING_STATE.currentMonth > 11) {
        BOOKING_STATE.currentMonth = 0;
        BOOKING_STATE.currentYear += 1;
      }
      renderCalendar();
    });
  }
}

function setupNextButton() {
  const nextBtn = document.querySelector(".btn-submit");
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!BOOKING_STATE.selectedTime) {
        alert("Пожалуйста, выберите время");
        return;
      }
      saveSelectedDate(
        {
          day: BOOKING_STATE.selectedDay,
          month: BOOKING_STATE.currentMonth,
          year: BOOKING_STATE.currentYear,
        },
        BOOKING_STATE.selectedTime
      );
      console.log("Сохранено в localStorage:", {
        day: BOOKING_STATE.selectedDay,
        month: BOOKING_STATE.currentMonth,
        year: BOOKING_STATE.currentYear,
        time: BOOKING_STATE.selectedTime,
      });
    });
  }
}

// ============================================================
// 5. ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  BOOKING_STATE.currentMonth = SERVER_DATA.today.month;
  BOOKING_STATE.currentYear = SERVER_DATA.today.year;
  BOOKING_STATE.selectedDay = SERVER_DATA.today.day;

  const response = getSlotsForDay(
    BOOKING_STATE.selectedDay,
    BOOKING_STATE.currentMonth,
    BOOKING_STATE.currentYear
  );
  BOOKING_STATE.slots = response.slots;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();

  setupMonthNavigation();
  setupNextButton();
}

document.addEventListener("DOMContentLoaded", function () {
  init();
});