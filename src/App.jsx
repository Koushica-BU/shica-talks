import { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import "./index.css";
import "./App.css";
import ChatBubble from "./components/ChatBubble";

// API config — pulling token from .env so it's never exposed in the code
const HF_TOKEN   = import.meta.env.VITE_HF_TOKEN;
const HF_API_URL = "/hf-api/v1/chat/completions";
const HF_MODEL   = "meta-llama/Llama-3.1-8B-Instruct";

// This is the first message the user sees when they open the app
const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    message: "Hey! I'm Shica. Ask me anything and I'll do my best to help.",
  },
];

export default function App() {

  // messages — the full chat history, both user and AI
  // prompt   — whatever the user is currently typing
  // isLoading — true while we're waiting for the API to respond
  const [messages, setMessages]   = useState(INITIAL_MESSAGES);
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
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async () => {
    // don't do anything if the input is empty or a request is already running
    if (!prompt.trim() || isLoading) return;

    // build the user message object and add it to the chat right away
    const userMessage = {
      id: Date.now(), // using timestamp as a unique id
      sender: "user",
      message: prompt.trim(),
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
      </header>

      {/* chat window — scrollable area where all messages render */}
      <main className="st_chatWindow">

        {/* date separator — just a visual divider at the top */}
        <div className="st_dateSeparator">
          <span className="st_dateSeparator__line" />
          <span className="st_dateSeparator__text">Today</span>
          <span className="st_dateSeparator__line" />
        </div>

        {/* render every message in the history through ChatBubble */}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            message={msg.message}
            isError={msg.isError}
          />
        ))}

        {/* loading bubble — only shows while waiting for the API */}
        {isLoading && (
          <ChatBubble sender="ai" message="..." isLoading={true} />
        )}

        {/* invisible anchor div — we scroll to this on every new message */}
        <div ref={bottomRef} />

      </main>

      {/* prompt bar */}
      <div className="st_inputBar">
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