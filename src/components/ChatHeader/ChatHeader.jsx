import { RiRobot2Line } from "react-icons/ri";
import { MdDeleteSweep } from "react-icons/md";
import "./ChatHeader.css";

// ChatHeader shows the bot avatar, name, online/thinking status
// and a clear history button when there are messages to clear
export default function ChatHeader({ isLoading, hasHistory, onClear }) {
  return (
    <header className="st_chatHeader">

      <div className="st_chatHeader__avatar">
        <RiRobot2Line size={20} />
      </div>

      <div className="st_chatHeader__info">
        <span className="st_chatHeader__name">Shica Talks</span>
        <span className="st_chatHeader__status">
          {isLoading
            ? <span className="st_chatHeader__statusText">Thinking...</span>
            : <span className="st_chatHeader__statusText st_chatHeader__statusText--online">Online</span>
          }
        </span>
      </div>

      {/* only show clear button when there's actual history to clear */}
      {hasHistory && (
        <button
          className="st_chatHeader__clearBtn"
          onClick={onClear}
          title="Clear chat history"
        >
          <MdDeleteSweep size={18} />
        </button>
      )}

    </header>
  );
}