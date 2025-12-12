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

    // 简单对话流程逻辑
    // 1. 如果还没有分析过梦境，且是第一次输入，假定是梦境描述
    if (!dreamAnalyzed) {
        setDreamAnalyzed(true);
        setDreamText(userMsg.content);

        // 模拟思考延迟
        setTimeout(() => {
            const reply: Message = {
                id: Date.now().toString() + "_guide_1",
                role: "assistant",
                content: "嗯……我听到了。这个梦给你带来了什么样的感觉呢？是焦虑、平静，还是有些困惑？"
            };
            setMessages(prev => [...prev, reply]);
            setIsTyping(false);
        }, 1500);
        return;
    }

    // 2. 如果已经输入了梦境，正在进行引导对话
    // 这里简单做一个计数或者根据内容判断是否结束对话
    // 为了简化，我们假定用户回答了感受之后，AI 再问一个问题，然后生成报告
    
    // 简单的状态机模拟
    const userMsgCount = messages.filter(m => m.role === 'user').length;
    
    if (userMsgCount === 1) {
         // 用户回答了感受
         setTimeout(() => {
            const reply: Message = {
                id: Date.now().toString() + "_guide_2",
                role: "assistant",
                content: "原来是这样。梦里的哪些细节让你印象最深刻？或者有什么特别的颜色、声音吗？"
            };
            setMessages(prev => [...prev, reply]);
            setIsTyping(false);
        }, 1500);
    } else if (userMsgCount >= 2) {
        // 假定对话差不多了，生成分析报告
        setTimeout(async () => {
            const preReply: Message = {
                id: Date.now().toString() + "_pre_result",
                role: "assistant",
                content: "谢谢你告诉我这些。结合你描述的梦境和感受，我为你整理了一份解析，希望能给你一些启发。"
            };
            setMessages(prev => [...prev, preReply]);
            
            // Generate analysis
            const fullText = dreamText + " " + userMsg.content; // Combine context
            const res = await parseDream(fullText);

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

        }, 1500);
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
                  rawText={dreamText}
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
          disabled={isTyping}
        />
        <button 
          className={styles.sendBtn} 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          发送
        </button>
      </div>
    </div>
  );
}