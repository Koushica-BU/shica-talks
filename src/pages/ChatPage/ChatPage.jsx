import { useRef, useEffect } from "react";
import ChatHeader from "../../components/ChatHeader/ChatHeader";
import ChatInput from "../../components/ChatInput/ChatInput";
import ChatBubble from "../../components/ChatBubble/ChatBubble";
import DateSeparator from "../../components/DateSeparator/DateSeparator";
import "./ChatPage.css";

// checks if a date separator should appear before a given message
function getDateLabel(messages, index) {
  const current = messages[index];
  if (!current?.timestamp) return null;

  if (index === 0) return formatDayLabel(current.timestamp);

  const prev = messages[index - 1];
  if (!prev?.timestamp) return null;

  const prevDay    = new Date(prev.timestamp).toDateString();
  const currentDay = new Date(current.timestamp).toDateString();
  return prevDay !== currentDay ? formatDayLabel(current.timestamp) : null;
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

// ChatPage renders the full chat UI once the user has started a conversation
export default function ChatPage({
  messages,
  prompt,
  isLoading,
  onPromptChange,
  onSubmit,
  onClearInput,
  onClearHistory,
}) {
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // jump instantly to bottom on first mount so history loads at the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // smooth scroll to bottom whenever a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // re-focus input after AI responds
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  return (
    <div className="st_chatPage">

      <ChatHeader
        isLoading={isLoading}
        hasHistory={messages.length > 0}
        onClear={onClearHistory}
      />

      <main className="st_chatPage__window">

        {messages.map((msg, index) => {
          const dateLabel = getDateLabel(messages, index);
          return (
            <div
              key={msg.id}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {dateLabel && <DateSeparator label={dateLabel} />}
              <ChatBubble
                sender={msg.sender}
                message={msg.message}
                isError={msg.isError}
              />
            </div>
          );
        })}

        {isLoading && (
          <ChatBubble sender="ai" message="..." isLoading={true} />
        )}

        {/* scroll anchor */}
        <div ref={bottomRef} />
      </main>

      <ChatInput
        prompt={prompt}
        isLoading={isLoading}
        onChange={onPromptChange}
        onSubmit={onSubmit}
        onClear={onClearInput}
        inputRef={inputRef}
      />

    </div>
  );
}