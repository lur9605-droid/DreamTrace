"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatInterface.module.css";
import { Extracted } from "@/lib/types";
import ResultCard from "./ResultCard";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  type?: "text" | "result";
  data?: {
    summary: string;
    extracted: Extracted;
    hints: any;
  };
}

interface Props {
  initialResult: {
    summary: string;
    extracted: Extracted;
    hints: any;
  };
  dreamText: string;
  onReset: () => void;
}

export default function ChatInterface({ initialResult, dreamText, onReset }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "我读完了你的梦，正在整理我的感受...",
        type: "text"
      }
    ]);

    // Simulate analysis delay then show result
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: "2",
          role: "assistant",
          content: "这是我对这个梦的初步解析：",
          type: "result",
          data: initialResult
        },
        {
          id: "3",
          role: "assistant",
          content: initialResult.hints?.questions?.[0] || "关于这个梦，你还有什么想补充的细节吗？",
          type: "text"
        }
      ]);
    }, 1500);
  }, [initialResult]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "嗯，我听到了。这个细节让梦的含义更丰富了。还有其他让你在意的地方吗？",
          type: "text"
        }
      ]);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={onReset} className={styles.backBtn}>← 返回重新描述</button>
      </div>
      
      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.type === "result" && msg.data ? (
              <ResultCard 
                rawText={dreamText}
                summary={msg.data.summary}
                extracted={msg.data.extracted}
                hints={msg.data.hints}
              />
            ) : (
              <div className={styles.bubble}>{msg.content}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSend()}
          placeholder="回应一下..."
          className={styles.input}
        />
        <button onClick={handleSend} className={styles.sendBtn}>发送</button>
      </div>
    </div>
  );
}