const STEPS = [
  { label: "Мастер", status: "done" },
  { label: "Услуга", status: "done" },
  { label: "Дата и время", status: "active" },
  { label: "Контакты", status: "" },
  { label: "Готово", status: "" },
];

export default function ProgressBar() {
  return (
    <nav className="progress-bar">
      {STEPS.map((step) => (
        <div key={step.label} className={`step ${step.status}`}>
          <div className="step-dot"></div>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </nav>
  );
}