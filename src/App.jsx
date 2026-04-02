import { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line } from "react-icons/ri";
import "./index.css";
import "./App.css";
import ChatBubble from "./components/ChatBubble";

const HF_TOKEN   = import.meta.env.VITE_HF_TOKEN;
const HF_API_URL = "/hf-api/v1/chat/completions";
const HF_MODEL   = "meta-llama/Llama-3.1-8B-Instruct";

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    message: "Hey! I'm Shica. Ask me anything and I'll do my best to help.",
  },
];

export default function App() {
  const [messages, setMessages]   = useState(INITIAL_MESSAGES);
  const [prompt, setPrompt]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
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
              role: "system",
              content: "You are Shica, a helpful and friendly AI assistant. Keep answers concise.",
            },
            {
              role: "user",
              content: userMessage.message,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error: ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("No response returned from the model.");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          message: text.trim(),
        },
      ]);

    } catch (err) {
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
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if( (e.shiftKey || e.ctrlKey) && e.key === "Enter") return;
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="st_page">

      <header className="st_header">
        <div className="st_header__avatar">
          <RiRobot2Line size={20} />
        </div>
        <div className="st_header__info">
          <span className="st_header__name">Shica Talks</span>
          <span className="st_header__status">
            {isLoading
              ? <span className="st_header__statusText">Thinking...</span>
              : <span className="st_header__statusText st_header__statusText--online">Online</span>
            }
          </span>
        </div>
      </header>

      <main className="st_chatWindow">

        <div className="st_dateSeparator">
          <span className="st_dateSeparator__line" />
          <span className="st_dateSeparator__text">Today</span>
          <span className="st_dateSeparator__line" />
        </div>

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            message={msg.message}
            isError={msg.isError}
          />
        ))}

        {isLoading && (
          <ChatBubble sender="ai" message="..." isLoading={true} />
        )}

        <div ref={bottomRef} />
      </main>

      <div className="st_inputBar">
        <textarea
          className="st_inputBar__textarea"
          placeholder="Type a message..."
          rows={1}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={1000}
        />
        <button
          className="st_inputBar__btn"
          onClick={handleSubmit}
          disabled={isLoading || !prompt.trim()}
        >
          <IoSend size={16} />
        </button>
      </div>

    </div>
  );
}