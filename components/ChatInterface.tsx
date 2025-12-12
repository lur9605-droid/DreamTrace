"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatInterface.module.css";
import { Extracted } from "@/lib/types";
import ResultCard from "./ResultCard";
import { parseDream } from "@/lib/mockAI";

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
  onBack?: () => void;
}

export default function ChatInterface({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dreamAnalyzed, setDreamAnalyzed] = useState(false);
  const [dreamText, setDreamText] = useState("");

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "你好，我是你的梦境向导。昨晚做了什么梦？试着告诉我，我会陪你一起探索。",
        type: "text"
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "text"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // If dream hasn't been analyzed yet, this input is the dream
    if (!dreamAnalyzed) {
      const currentDreamText = userMsg.content;
      setDreamText(currentDreamText);

      try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const res = await parseDream(currentDreamText);
        
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + "_reply",
            role: "assistant",
            content: "我正在用心感受你的梦境...有些画面逐渐清晰了。",
            type: "text"
          }
        ]);

        // Show result card
        setTimeout(() => {
             setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString() + "_result",
              role: "assistant",
              content: "这是我对这个梦的初步解析：",
              type: "result",
              data: {
                  summary: res.summary,
                  extracted: res.extracted,
                  hints: res.hints
              }
            },
            {
                id: Date.now().toString() + "_followup",
                role: "assistant",
                content: res.hints?.questions?.[0] || "关于这个梦，你还有什么想补充的细节吗？",
                type: "text"
            }
          ]);
          setIsTyping(false);
          setDreamAnalyzed(true);
        }, 1500);

      } catch (e) {
        console.error(e);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString() + "_error",
                role: "assistant",
                content: "抱歉，我刚刚走神了，没能听清你的梦。能再讲一遍吗？",
                type: "text"
            }
        ]);
        setIsTyping(false);
      }
    } else {
        // Conversational follow-up (mock)
        setTimeout(() => {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "嗯，我明白了。你的感受是真实的，试着深呼吸，接纳这种感觉。还有其他想说的吗？",
                    type: "text"
                }
            ]);
            setIsTyping(false);
        }, 1000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {onBack && <button onClick={onBack} className={styles.backBtn}>← 返回</button>}
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
        {isTyping && (
             <div className={`${styles.message} ${styles.assistant}`}>
                 <div className={styles.bubble}>...</div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSend()}
          placeholder="输入你的梦境..."
          className={styles.input}
        />
        <button onClick={handleSend} className={styles.sendBtn}>发送</button>
      </div>
    </div>
  );
}