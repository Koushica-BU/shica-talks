import { RiRobot2Line } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import "./ChatBubble.css";

export default function ChatBubble({ message, sender, isLoading, isError }) {
  const isAI = sender === "ai";

  return (
    <div className={`st_bubble ${isAI ? "st_bubble--ai" : "st_bubble--user"}`}>

      {isAI && (
        <div className="st_bubble__avatar">
          <RiRobot2Line size={14} />
        </div>
      )}

      <p className={[
        "st_bubble__text",
        isAI  ? "st_bubble__text--ai"   : "st_bubble__text--user",
        isLoading ? "st_bubble__text--loading" : "",
        isError   ? "st_bubble__text--error"   : "",
      ].join(" ").trim()}>

        {isLoading ? (
          <span className="st_bubble__dots">
            <span /><span /><span />
          </span>
        ) : (
          <span className="st_bubble__content">
            {isError && <MdErrorOutline size={15} className="st_bubble__errorIcon" />}
            {message}
          </span>
        )}

      </p>

    </div>
  );
}