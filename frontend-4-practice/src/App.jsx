import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import SelectionInfo from "./components/SelectionInfo";
import Footer from "./components/Footer";
import { fetchToday, fetchSlots } from "./api";

export default function App() {
  const [today, setToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    async function loadToday() {
      try {
        setTodayLoading(true);
        setTodayError(null);
        const data = await fetchToday();
        setToday(data);
        setCurrentMonth(data.month);
        setCurrentYear(data.year);
        setSelectedDay(data.day);
      } catch (err) {
        setTodayError(err.message);
      } finally {
        setTodayLoading(false);
      }
    }
    loadToday();
  }, []);

  useEffect(() => {
    if (selectedDay === null || currentMonth === null || currentYear === null) {
      return;
    }

    async function loadSlots() {
      try {
        setSlotsLoading(true);
        setSlotsError(null);
        const data = await fetchSlots({
          day: selectedDay,
          month: currentMonth,
          year: currentYear,
        });
        setSlots(data.slots);
      } catch (err) {
        setSlotsError(err.message);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [selectedDay, currentMonth, currentYear]);

  function handleSelectDay(day) {
    setSelectedDay(day);
    setSelectedTime(null);
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

  if (todayLoading) {
    return (
      <>
        <Header />
        <ProgressBar />
        <main className="main-content">
          <div className="status-message">Загрузка…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (todayError) {
    return (
      <>
        <Header />
        <ProgressBar />
        <main className="main-content">
          <div className="status-message status-error">
            Ошибка загрузки: {todayError}
          </div>
        </main>
        <Footer />
      </>
    );
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
              loading={slotsLoading}
              error={slotsError}
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