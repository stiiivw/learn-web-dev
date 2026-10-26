import { formatSlotsDate } from "../utils/date";

export default function TimeSlots({
  slots,
  selectedTime,
  selectedDay,
  month,
  year,
  onSelectTime,
}) {
  return (
    <section className="slots-section">
      <h3>Свободные слоты</h3>
      <p className="slots-date">{formatSlotsDate(selectedDay, month, year)}</p>

      <div className="slots-grid">
        {slots.length === 0 ? (
          <div className="slots-empty">В этот день нет доступного времени</div>
        ) : (
          slots.map((slot) => {
            let classes = "slot";
            if (!slot.available) classes += " disabled";
            if (slot.time === selectedTime && slot.available) classes += " selected";

            return (
              <button
                key={slot.time}
                type="button"
                className={classes}
                disabled={!slot.available}
                onClick={() => slot.available && onSelectTime(slot.time)}
              >
                {slot.time}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}