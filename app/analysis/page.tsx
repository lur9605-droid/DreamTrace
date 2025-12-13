"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import chatStyles from "../../components/ChatInterface.module.css";

type Msg = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "嗨，我在这里。愿意和我聊聊你昨晚的梦吗？" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const nextMessages: Msg[] = [...messages, { role: "user" as const, content: input }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        const assistantMsg: Msg = { role: "assistant", content: `抱歉，接口错误：${data?.error || res.status}` };
        setMessages([...nextMessages, assistantMsg]);
      } else {
        const content = (data?.content ?? "").toString();
        const assistantMsg: Msg = { role: "assistant", content: content || "（无内容）" };
        setMessages([...nextMessages, assistantMsg]);
      }
    } catch (e) {
      const assistantMsg: Msg = { role: "assistant", content: "抱歉，网络似乎出了问题。" };
      setMessages([...nextMessages, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={chatStyles.messagesList}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${chatStyles.messageRow} ${m.role === "user" ? chatStyles.userRow : chatStyles.assistantRow}`}
          >
            {m.role === "assistant" && <div className={chatStyles.avatar}>✨</div>}
            <div className={chatStyles.messageContent}>
              <div className={chatStyles.bubble}>{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${chatStyles.messageRow} ${chatStyles.assistantRow}`}>
            <div className={chatStyles.avatar}>✨</div>
            <div className={chatStyles.messageContent}>
              <div className={chatStyles.bubble}>
                <span className={chatStyles.typingDot}>.</span>
                <span className={chatStyles.typingDot}>.</span>
                <span className={chatStyles.typingDot}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className={chatStyles.inputArea}>
        <input
          className={chatStyles.input}
          placeholder="在这里输入..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <button
          className={chatStyles.sendBtn}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
        >
          发送
        </button>
      </div>
    </div>
  );
}
