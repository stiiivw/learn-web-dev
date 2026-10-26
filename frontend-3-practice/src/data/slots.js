export const SERVER_DATA = {
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

export const SLOTS_EVEN_DAY = [
  { time: "09:00", available: true },
  { time: "10:30", available: false },
  { time: "12:00", available: true },
  { time: "13:30", available: true },
  { time: "15:00", available: true },
  { time: "16:30", available: false },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

export const SLOTS_ODD_DAY = [
  { time: "09:00", available: true },
  { time: "10:30", available: true },
  { time: "12:00", available: false },
  { time: "13:30", available: false },
  { time: "15:00", available: true },
  { time: "16:30", available: true },
  { time: "18:00", available: true },
  { time: "19:30", available: true },
];

export function getSlotsForDay(day) {
  return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}