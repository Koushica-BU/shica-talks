import { useState, useEffect } from "react";
import "./index.css";
import WelcomePage from "./pages/WelcomePage/WelcomePage";
import ChatPage from "./pages/ChatPage/ChatPage";

// API config — pulling token from .env so it's never exposed in the code
const HF_TOKEN   = import.meta.env.VITE_HF_TOKEN;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL   = "meta-llama/Llama-3.1-8B-Instruct";

// the key to read/write messages in localStorage
const STORAGE_KEY = "shica_messages";

// read messages from localStorage
function loadMessages() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// write messages array to localStorage
function saveMessages(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export default function App() {

  // messages — the full chat history, both user and AI
  // prompt   — whatever the user is currently typing
  // isLoading — true while we're waiting for the API to respond
  const [messages, setMessages]   = useState(loadMessages);
  const [prompt, setPrompt]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // save to localStorage every time messages change
  // this keeps history in sync automatically — no manual save needed
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const handleSubmit = async (text) => {
    // text can come from ChatInput or from a WelcomePage suggestion chip
    const content = (text || prompt).trim();
    if (!content || isLoading) return;

    const userMessage = {
      id: Date.now(), // using timestamp as a unique id
      sender: "user",
      message: content,
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
              content,
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
      const replyText = data?.choices?.[0]?.message?.content;
      if (!replyText) throw new Error("No response returned from the model.");

      // adding the AI reply to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          message: replyText.trim(),
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

  // wipe all history and go back to the welcome page
  const handleClearHistory = () => {
    setMessages([]);
    saveMessages([]);
  };

  // App decides which screen to show based on whether messages exist
  // no messages → WelcomePage
  // messages exist → ChatPage
  return messages.length === 0 ? (
    <WelcomePage onSubmit={handleSubmit} />
  ) : (
    <ChatPage
      messages={messages}
      prompt={prompt}
      isLoading={isLoading}
      onPromptChange={setPrompt}
      onSubmit={handleSubmit}
      onClearInput={() => setPrompt("")}
      onClearHistory={handleClearHistory}
    />
  );
}