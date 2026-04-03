import "./DateSeparator.css";

// DateSeparator renders the "Today", "Yesterday", or date label between messages when the day changes
export default function DateSeparator({ label }) {
  return (
    <div className="st_dateSeparator">
      <span className="st_dateSeparator__line" />
      <span className="st_dateSeparator__text">{label}</span>
      <span className="st_dateSeparator__line" />
    </div>
  );
}