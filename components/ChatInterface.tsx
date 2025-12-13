"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./ChatInterface.module.css";
import { Extracted } from "@/lib/types";
import ResultCard from "./ResultCard";
import { parseDream, chatWithAI, ChatContext } from "@/lib/mockAI";

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
  
  // Chat Context State
  const [chatContext, setChatContext] = useState<ChatContext>({
    stage: 'initial',
    dreamText: "",
    turnCount: 0
  });

  useEffect(() => {
    // Initial greeting with typing effect
    const greeting = "嗨，我在这里。愿意和我聊聊你昨晚的梦吗？不用着急，我们慢慢来。";
    let i = 0;
    
    // Set initial message placeholder
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "",
        type: "text"
      }
    ]);
    
    setIsTyping(true);
    
    const timer = setInterval(() => {
      if (i < greeting.length) {
        setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs[0]) {
             newMsgs[0] = { ...newMsgs[0], content: greeting.substring(0, i + 1) };
          }
          return newMsgs;
        });
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 50); // Speed of typing

    return () => clearInterval(timer);
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

    try {
        // Simulate thinking delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { text, newContext, action } = await chatWithAI(userMsg.content, chatContext);
        setChatContext(newContext);

        if (action === 'show_analysis') {
            // Show the transition text first
             setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString() + "_reply",
                    role: "assistant",
                    content: text,
                    type: "text"
                }
            ]);

            // Then generate and show analysis
            const res = await parseDream(newContext.dreamText);
            
            setTimeout(() => {
                 const resultMsg: Message = {
                    id: Date.now().toString() + "_result",
                    role: "assistant",
                    content: "",
                    type: "result",
                    data: {
                        summary: res.summary,
                        extracted: res.extracted,
                        hints: res.hints
                    }
                };
                setMessages(prev => [...prev, resultMsg]);
                setIsTyping(false);
            }, 1000);

        } else {
            // Normal conversation reply
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString() + "_reply",
                    role: "assistant",
                    content: text,
                    type: "text"
                }
            ]);
            setIsTyping(false);
        }

    } catch (err) {
        console.error(err);
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString() + "_error",
                role: "assistant",
                content: "抱歉，我好像走神了...能再和我说一遍吗？",
                type: "text"
            }
        ]);
        setIsTyping(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Messages */}
      <div className={styles.messagesList}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageRow} ${
              msg.role === "user" ? styles.userRow : styles.assistantRow
            }`}
          >
            {msg.role === "assistant" && (
              <div className={styles.avatar}>✨</div>
            )}
            <div className={styles.messageContent}>
              {msg.type === "result" && msg.data ? (
                <ResultCard
                  summary={msg.data.summary}
                  extracted={msg.data.extracted}
                  hints={msg.data.hints}
                  rawText={chatContext.dreamText}
                />
              ) : (
                <div className={styles.bubble}>{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.messageRow} ${styles.assistantRow}`}>
            <div className={styles.avatar}>✨</div>
            <div className={styles.messageContent}>
              <div className={styles.bubble}>
                <span className={styles.typingDot}>.</span>
                <span className={styles.typingDot}>.</span>
                <span className={styles.typingDot}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <input
          className={styles.input}
          placeholder="在这里输入..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isTyping || chatContext.stage === 'ready_for_analysis'}
        />
        <button 
          className={styles.sendBtn} 
          onClick={handleSend}
          disabled={!input.trim() || isTyping || chatContext.stage === 'ready_for_analysis'}
        >
          发送
        </button>
      </div>
    </div>
  );
}