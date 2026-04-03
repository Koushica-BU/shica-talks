import { IoSend, IoCloseCircle } from "react-icons/io5";
import "./ChatInput.css";

// ChatInput handles the textarea and send button at the bottom of the chat
export default function ChatInput({ prompt, isLoading, onChange, onSubmit, onClear, inputRef }) {

  const handleKeyDown = (e) => {
    // Shift+Enter or Ctrl+Enter inserts a new line instead of submitting
    if (e.shiftKey || e.ctrlKey) return;
    if (e.key === "Enter") onSubmit();
  };

  return (
    <div className="st_chatInput">

      <div className="st_chatInput__wrap">
        <textarea
          ref={inputRef}
          className="st_chatInput__textarea"
          placeholder="Type a message..."
          rows={1}
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={1000}
        />

        {/* clear typed text — only visible when there's something in the box */}
        {prompt && (
          <button
            className="st_chatInput__clearBtn"
            onClick={onClear}
            title="Clear"
            tabIndex={-1}
          >
            <IoCloseCircle size={16} />
          </button>
        )}
      </div>

      <button
        className="st_chatInput__sendBtn"
        onClick={onSubmit}
        disabled={isLoading || !prompt.trim()}
      >
        <IoSend size={16} />
      </button>

    </div>
  );
}