import "./index.css";
import "./App.css";
import ChatBubble from "./components/ChatBubble";

const PLACEHOLDER_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    message: "Hey! I'm Shica, Ask me anything and I'll do my best to help.",
  },
  {
    id: 2,
    sender: "user",
    message: "What is the capital of France?",
  },
  {
    id: 3,
    sender: "ai",
    message:
      "The capital of France is Paris. It's also the largest city in the country and has been the nation's capital since the 10th century.",
  },
];

export default function App() {
  return (
    <div className="st_page">

      <header className="st_header">
        <div className="st_header__avatar">S</div>
        <div className="st_header__info">
          <span className="st_header__name">Shica Talks</span>
          <span className="st_header__status">Online</span>
        </div>
      </header>

      <main className="st_chatWindow">

        <div className="st_dateSeparator">
          <span className="st_dateSeparator__line" />
          <span className="st_dateSeparator__text">Today</span>
          <span className="st_dateSeparator__line" />
        </div>

        {PLACEHOLDER_MESSAGES.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            message={msg.message}
          />
        ))}

      </main>

      <div className="st_inputBar">
        <textarea
          className="st_inputBar__textarea"
          placeholder="Type a message..."
          rows={1}
        />
        <button className="st_inputBar__btn">↑</button>
      </div>

    </div>
  );
}