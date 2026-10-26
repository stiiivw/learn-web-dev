import { formatSelectedDate } from "../utils/date";

export default function SelectionInfo({ day, month, year, time }) {
  return (
    <div className="selection-info">
      <span className="selection-label">Выбрано</span>
      <span className="selection-value">
        {formatSelectedDate(day, month, year, time)}
      </span>
    </div>
  );
}