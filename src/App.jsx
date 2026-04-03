import { useState, useRef, useEffect } from "react";
import { IoSend, IoCloseCircle } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import { MdDeleteSweep } from "react-icons/md";
import "./index.css";
import "./App.css";
import ChatBubble from "./components/ChatBubble";

// API config — pulling token from .env so it's never exposed in the code
const HF_TOKEN   = import.meta.env.VITE_HF_TOKEN;
const HF_API_URL = "/hf-api/v1/chat/completions";
const HF_MODEL   = "meta-llama/Llama-3.1-8B-Instruct";

// the key to read/write messages in localStorage
const STORAGE_KEY = "shica_messages";

const GREETING = {
  id: "greeting",
  sender: "ai",
  message: "Hey! I'm Shica. Ask me anything and I'll do my best to help.",
  timestamp: Date.now(),
};

// read messages from localStorage
function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved?.length ? saved : [GREETING];
  } catch {
    return [GREETING];
  }
}

// write messages array to localStorage
function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// formats a timestamp into "Today", "Yesterday", or "April 1, 2025"
function formatDayLabel(timestamp) {
  const msgDate   = new Date(timestamp);
  const today     = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (msgDate.toDateString() === today.toDateString())     return "Today";
  if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";

  return msgDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// checks if a date separator should appear before a given message
// returns the label string if the day changed, null if not
function getDateLabel(messages, index) {
  const current = messages[index];
  if (!current?.timestamp) return null;

  // always show a label before the very first message
  if (index === 0) return formatDayLabel(current.timestamp);

  const prev = messages[index - 1];
  if (!prev?.timestamp) return null;

  const prevDay    = new Date(prev.timestamp).toDateString();
  const currentDay = new Date(current.timestamp).toDateString();

  // only insert a separator when the day actually changes
  return prevDay !== currentDay ? formatDayLabel(current.timestamp) : null;
}

export default function App() {

  // messages — the full chat history, both user and AI
  // prompt   — whatever the user is currently typing
  // isLoading — true while we're waiting for the API to respond
  const [messages, setMessages]   = useState(loadMessages);
  const [prompt, setPrompt]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // bottomRef — points to an invisible div at the bottom of the chat
  // we use it to auto-scroll down whenever a new message appears
  const bottomRef  = useRef(null);

  // inputRef — points to the textarea so we can focus it programmatically
  const inputRef   = useRef(null);

  // scroll to the bottom every time messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // after loading finishes, focus prompt bar again
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  // save to localStorage every time messages change
  // this keeps history in sync automatically — no manual save needed
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const handleSubmit = async () => {
    // don't do anything if the input is empty or a request is already running
    if (!prompt.trim() || isLoading) return;

    // build the user message object and add it to the chat right away
    const userMessage = {
      id: Date.now(), // using timestamp as a unique id
      sender: "user",
      message: prompt.trim(),
      timestamp: Date.now(), // timestamp is required for date separator logic
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");     // clear the input field
    setIsLoading(true); // show the loading bubble

    try {
      // call the HuggingFace router API
      // the proxy in vite.config.js forwards /hf-api → router.huggingface.co
      const res = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: HF_MODEL,
          messages: [
            {
              // system message tells the AI who it is and how to behave
              role: "system",
              content: "You are Shica, a helpful and friendly AI assistant. Keep answers concise.",
            },
            {
              role: "user",
              content: userMessage.message,
            },
          ],
          max_tokens: 300,  // limit how long the response can be
          temperature: 0.7, // controls randomness — 0 is robotic, 1 is creative
          stream: false,    // we want the full response at once, not streamed
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("No response returned from the model.");

      // adding the AI reply to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          message: text.trim(),
          timestamp: Date.now(),
        },
      ]);

    } catch (err) {
      // error handling in the same chat bubble
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          message: err.message || "Something went wrong. Please try again.",
          isError: true,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      // finally stop the loading state
      setIsLoading(false);
    }
  };

  // submitting on Enter, but allowing Shift+Enter or Ctrl+Enter for new lines
  const handleKeyDown = (e) => {
    if (e.shiftKey || e.ctrlKey) return;
    if (e.key === "Enter") handleSubmit();
  };

  // clears the typed text and puts focus back on the textarea
  const handleClearInput = () => {
    setPrompt("");
    inputRef.current?.focus();
  };

  // wipes all chat history from state and localStorage
  // resets back to just the greeting message
  const handleClearHistory = () => {
    const fresh = [{ ...GREETING, id: Date.now(), timestamp: Date.now() }];
    setMessages(fresh);
    saveMessages(fresh);
  };

  return (
    <div className="st_page">

      {/* app header — shows the bot avatar, name, and online/thinking status */}
      <header className="st_header">
        <div className="st_header__avatar">
          <RiRobot2Line size={20} />
        </div>
        <div className="st_header__info">
          <span className="st_header__name">Shica Talks</span>
          <span className="st_header__status">
            {/* swap status text based on whether AI is processing */}
            {isLoading
              ? <span className="st_header__statusText">Thinking...</span>
              : <span className="st_header__statusText st_header__statusText--online">Online</span>
            }
          </span>
        </div>

        {/* clear history button — only shows when there's more than just the greeting */}
        {messages.length > 1 && (
          <button
            className="st_header__clearBtn"
            onClick={handleClearHistory}
            title="Clear chat history"
          >
            <MdDeleteSweep size={18} />
          </button>
        )}
      </header>

      {/* chat window — scrollable area where all messages render */}
      <main className="st_chatWindow">

        {messages.map((msg, index) => {
          const dateLabel = getDateLabel(messages, index);
          return (
            <div
              key={msg.id}
              style={{ display: "flex", flexDirection: "column" }} // ← add this
            >
              {dateLabel && (
                <div className="st_dateSeparator">
                  <span className="st_dateSeparator__line" />
                  <span className="st_dateSeparator__text">{dateLabel}</span>
                  <span className="st_dateSeparator__line" />
                </div>
              )}
              <ChatBubble
                sender={msg.sender}
                message={msg.message}
                isError={msg.isError}
              />
            </div>
          );
        })}

        {/* loading bubble — only shows while waiting for the API */}
        {isLoading && (
          <ChatBubble sender="ai" message="..." isLoading={true} />
        )}

        {/* invisible anchor div — we scroll to this on every new message */}
        <div ref={bottomRef} />

      </main>

      {/* prompt bar */}
      <div className="st_inputBar">
        <div className="st_inputBar__textareaWrap">
          <textarea
            ref={inputRef}              // attach ref so we can focus it after submit
            className="st_inputBar__textarea"
            placeholder="Type a message..."
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}        // disable prompt bar while AI is responding
            maxLength={1000}
          />

          {/* clear input button — only visible when there's something typed */}
          {prompt && (
            <button
              className="st_inputBar__clearBtn"
              onClick={handleClearInput}
              title="Clear"
              tabIndex={-1} // skip in tab order so Enter still submits
            >
              <IoCloseCircle size={16} />
            </button>
          )}
        </div>

        <button
          className="st_inputBar__btn"
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()} // disable if empty or loading
        >
          <IoSend size={16} />
        </button>
      </div>

    </div>
  );
}