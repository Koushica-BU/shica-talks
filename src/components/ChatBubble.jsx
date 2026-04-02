import "./ChatBubble.css";

export default function ChatBubble({ message, sender }) {
  const isAI = sender === "ai";

  return (
    <div className={`st_bubble ${isAI ? "st_bubble--ai" : "st_bubble--user"}`}>

      {isAI && (
        <div className="st_bubble__avatar">S</div>
      )}

      <p className={`st_bubble__text ${isAI ? "st_bubble__text--ai" : "st_bubble__text--user"}`}>
        {message}
      </p>

    </div>
  );
}