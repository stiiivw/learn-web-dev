import { useEffect, useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import SelectionInfo from "./components/SelectionInfo";
import Footer from "./components/Footer";
import { fetchToday, fetchSlots } from "./api";
import { isMonthNotPast } from "./utils/date";

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
    let cancelled = false;
    async function loadToday() {
      try {
        setTodayLoading(true);
        setTodayError(null);
        const data = await fetchToday();
        if (cancelled) return;
        setToday(data);
        setCurrentMonth(data.month);
        setCurrentYear(data.year);
        setSelectedDay(data.day);
      } catch (err) {
        if (cancelled) return;
        setTodayError(err.message);
      } finally {
        if (!cancelled) setTodayLoading(false);
      }
    }
    loadToday();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedDay === null || currentMonth === null || currentYear === null) {
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      try {
        setSlotsLoading(true);
        setSlotsError(null);
        const data = await fetchSlots({
          day: selectedDay,
          month: currentMonth,
          year: currentYear,
        });
        if (cancelled) return;
        setSlots(data.slots);
      } catch (err) {
        if (cancelled) return;
        setSlotsError(err.message);
        setSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDay, currentMonth, currentYear]);

  function handleSelectDay(day) {
    setSelectedDay(day);
    setSelectedTime(null);
  }

  function handleSelectTime(time) {
    setSelectedTime(time);
  }

  function resetSelection(newMonth, newYear) {
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (!today) return;

    const isCurrentMonth =
      newYear === today.year && newMonth === today.month;
    const fallbackDay = isCurrentMonth ? today.day : 1;

    setSelectedDay(fallbackDay);
    setSelectedTime(null);
  }

  function handlePrevMonth() {
    if (!today) return;
    
    if (currentMonth === 0) {
      if (!isMonthNotPast(11, currentYear - 1, today)) return;
      resetSelection(11, currentYear - 1);
    } else {
      if (!isMonthNotPast(currentMonth - 1, currentYear, today)) return;
      resetSelection(currentMonth - 1, currentYear);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      resetSelection(0, currentYear + 1);
    } else {
      resetSelection(currentMonth + 1, currentYear);
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