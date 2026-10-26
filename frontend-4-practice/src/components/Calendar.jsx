import {
  MONTHS_NOMINATIVE,
  buildCalendarGrid,
  isDateSelectable,
  isMonthNotPast,
} from "../utils/date";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function Calendar({
  year,
  month,
  selectedDay,
  today,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}) {
  if (!today || month === null || year === null) {
    return (
      <section className="calendar-section">
        <div className="calendar-header">
          <h3>Загрузка…</h3>
        </div>
      </section>
    );
  }

  const weeks = buildCalendarGrid(year, month);
  
  // Проверяем, можно ли листать назад
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const canGoPrev = isMonthNotPast(prevMonth, prevYear, today);

  return (
    <section className="calendar-section">
      <div className="calendar-header">
        <h3>{`${MONTHS_NOMINATIVE[month]} ${year}`}</h3>
        <div className="calendar-nav">
          <button
            type="button"
            className="arrow-btn"
            onClick={onPrevMonth}
            aria-label="Предыдущий месяц"
            disabled={!canGoPrev}
            style={{ opacity: canGoPrev ? 1 : 0.3 }}
          >
            ‹
          </button>
          <button
            type="button"
            className="arrow-btn"
            onClick={onNextMonth}
            aria-label="Следующий месяц"
          >
            ›
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}

        {weeks.map((week, wi) =>
          week.map((cell, ci) => {
            const key = `${wi}-${ci}`;
            const isToday =
              !cell.otherMonth &&
              cell.day === today.day &&
              month === today.month &&
              year === today.year;
            const isSelected =
              !cell.otherMonth &&
              cell.day === selectedDay &&
              month === today.month &&
              year === today.year;
            const selectable =
              !cell.otherMonth && isDateSelectable(cell.day, month, year, today);

            let classes = "day";
            if (cell.otherMonth) classes += " other-month";
            if (isToday) classes += " today";
            if (isSelected) classes += " selected";
            if (!selectable && !cell.otherMonth) classes += " disabled";

            return (
              <button
                key={key}
                type="button"
                className={classes}
                disabled={!selectable || cell.otherMonth}
                onClick={() =>
                  selectable && !cell.otherMonth && onSelectDay(cell.day)
                }
              >
                {cell.day}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}