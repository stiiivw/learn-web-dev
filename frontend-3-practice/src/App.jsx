import { useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import SelectionInfo from "./components/SelectionInfo";
import Footer from "./components/Footer";
import { SERVER_DATA, getSlotsForDay } from "./data/slots";

export default function App() {
  const today = SERVER_DATA.today;

  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [currentYear, setCurrentYear] = useState(today.year);
  const [selectedDay, setSelectedDay] = useState(today.day);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState(getSlotsForDay(today.day));

  function handleSelectDay(day) {
    setSelectedDay(day);
    setSelectedTime(null);
    setSlots(getSlotsForDay(day));
  }

  function handleSelectTime(time) {
    setSelectedTime(time);
  }

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  function handleSubmit() {
    if (!selectedTime) {
      alert("Пожалуйста, выберите время");
      return;
    }
    const booking = {
      date: { day: selectedDay, month: currentMonth, year: currentYear },
      time: selectedTime,
    };
    localStorage.setItem("atelier-booking", JSON.stringify(booking));
    console.log("Сохранено:", booking);
  }

  return (
    <>
      <Header />
      <ProgressBar />
      <main className="main-content">
        <div className="page-title">
          <h2>Дата и время</h2>
          <p className="subtitle">
            Анна Морозова • Кератиновое выпрямление • 6 часов
          </p>
        </div>
        <div className="booking-container">
          <Calendar
            year={currentYear}
            month={currentMonth}
            selectedDay={selectedDay}
            today={today}
            onSelectDay={handleSelectDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <div className="slots-column">
            <TimeSlots
              slots={slots}
              selectedTime={selectedTime}
              selectedDay={selectedDay}
              month={currentMonth}
              year={currentYear}
              onSelectTime={handleSelectTime}
            />
            <SelectionInfo
              day={selectedDay}
              month={currentMonth}
              year={currentYear}
              time={selectedTime}
            />
            <button type="button" className="btn-submit" onClick={handleSubmit}>
              Продолжить
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}