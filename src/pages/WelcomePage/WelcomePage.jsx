import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import "./WelcomePage.css";

// suggestion chips shown on the welcome screen
const SUGGESTIONS = [
  "What can you help me with?",
  "Teach me Javascript from Basics",
  "Quick recipe suggestion",
  "Tips for Gardening",
];

export default function WelcomePage({ onSubmit }) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.shiftKey || e.ctrlKey) return;
    if (e.key === "Enter") handleSubmit();
  };

  // clicking a suggestion chip submits it directly
  const handleSuggestion = (text) => {
    onSubmit(text);
  };

  return (
    <div className="st_welcome">

      <div className="st_welcome__hero">
        <div className="st_welcome__logo">
          <RiRobot2Line size={32} />
        </div>
        <h1 className="st_welcome__title">Shica Talks</h1>
        <p className="st_welcome__subtitle">
          Ask me anything — I'll do my best to help.
        </p>
      </div>

      {/* suggestion chips */}
      <div className="st_welcome__suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            className="st_welcome__chip"
            onClick={() => handleSuggestion(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* prompt bar — same style as chat but centered on the page */}
      <div className="st_welcome__inputWrap">
        <div className="st_welcome__inputBar">
          <textarea
            className="st_welcome__textarea"
            placeholder="Type a message..."
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={1000}
            autoFocus
          />
          <button
            className="st_welcome__sendBtn"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
          >
            <IoSend size={16} />
          </button>
        </div>
        <p className="st_welcome__hint">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

    </div>
  );
}