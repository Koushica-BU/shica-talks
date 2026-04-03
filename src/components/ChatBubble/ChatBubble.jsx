import { RiRobot2Line } from "react-icons/ri";
import { MdErrorOutline } from "react-icons/md";
import { sanitizeHTML, parseMarkdown } from "../../utils/markdown";
import "./ChatBubble.css";

// ChatBubble renders a single message in the chat
// it handles three cases: normal message, loading state, and error state
// sender param decides if bubble is on left (ai) or right (user)
export default function ChatBubble({ message, sender, isLoading, isError }) {
  const isAI = sender === "ai";

  const renderContent = () => {
    if (isLoading) {
      // bouncing dots while waiting for the API
      return (
        <span className="st_bubble__dots">
          <span /><span /><span />
        </span>
      );
    }

    if (isError) {
      // error state — plain text with icon, no markdown
      return (
        <span className="st_bubble__content">
          <MdErrorOutline size={15} className="st_bubble__errorIcon" />
          {message}
        </span>
      );
    }

      const sanitized = sanitizeHTML(message);
      const html = parseMarkdown(sanitized);
      return (
        <div
          className="st_bubble__markdown"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
  };

  return (
    // the row — aligns left for AI, right for user via CSS modifier
    <div className={`st_bubble ${isAI ? "st_bubble--ai" : "st_bubble--user"}`}>

      {isAI && (
        <div className="st_bubble__avatar">
          <RiRobot2Line size={14} />
        </div>
      )}

      <div className={[
        "st_bubble__text",
        isAI  ? "st_bubble__text--ai"   : "st_bubble__text--user",
        isLoading ? "st_bubble__text--loading" : "",
        isError   ? "st_bubble__text--error"   : "",
      ].join(" ").trim()}>
        {renderContent()}
      </div>

    </div>
  );
}