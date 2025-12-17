"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import styles from "./page.module.css";
import chatStyles from "../../components/ChatInterface.module.css";
import { saveRecord, updateSaveRecord, loadRecords } from "@/lib/storage";
import { DreamRecord } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { parseDream } from "@/lib/mockAI";
import BackButton from "@/components/BackButton";

const uuidv4 = () => crypto.randomUUID();

type Msg = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}

function AnalysisContent() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "嗨，我在这里。愿意和我聊聊你昨晚的梦吗？" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const params = useSearchParams();
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const resumeId = params.get("resume");
    const mode = params.get("mode"); // 'review' | undefined
    if (resumeId) {
      const records = loadRecords();
      const record = records.find(r => r.id === resumeId);
      if (record) {
        setCurrentRecordId(record.id);
        const isCompleted = record.status === 'completed';
        const isReview = mode === 'review';
        
        // Show banner only if it's in progress AND not explicitly reviewing, OR if reviewing but incomplete
        const shouldShowBanner = record.status === 'in_progress' && !isReview;
        setShowResumeBanner(shouldShowBanner);
        const restored: Msg[] = [];
        if (record.messages && record.messages.length > 0) {
          for (const m of record.messages) {
            restored.push({ role: m.role, content: m.content } as Msg);
          }
        } else if (record.rawText) {
          const lines = record.rawText.split(/\n+/).map(s => s.trim()).filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("用户：")) {
              restored.push({ role: "user", content: line.replace(/^用户：/, "") });
            } else if (line.startsWith("AI：")) {
              restored.push({ role: "assistant", content: line.replace(/^AI：/, "") });
            }
          }
        }
        setMessages(restored.length > 0 ? restored : [{ role: "assistant", content: "我们可以从上次停下的地方继续，也可以轻轻看看。" }]);
      }
    }
  }, [params]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const nextMessages: Msg[] = [...messages, { role: "user" as const, content: input }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      if (!currentRecordId) {
        const id = uuidv4();
        const record: DreamRecord = {
          id,
          createdAt: new Date().toISOString(),
          rawText: `用户：${input}`,
          status: "in_progress",
          messages: [{ role: "user", content: input, ts: new Date().toISOString() }],
          updatedAt: Date.now(),
          extracted: undefined
        };
        saveRecord(record);
        setCurrentRecordId(id);
      } else {
        const records = loadRecords();
        const existing = records.find(r => r.id === currentRecordId);
        const newMessages = [...(existing?.messages || []), { role: "user" as const, content: input, ts: new Date().toISOString() }];
        const newRaw = `${(existing?.rawText || "").trim()}\n用户：${input}`.trim();
        updateSaveRecord(currentRecordId, { messages: newMessages, rawText: newRaw, updatedAt: Date.now(), status: "in_progress" });
      }
    } catch {}

    try {
      // Build system prompt to enforce response structure
      const systemPrompt: Msg = {
        role: "system",
        content: `你是一位对【弗洛伊德梦的解析理论】有深入理解的梦境解析师 AI。
你的目标不是立即给出解释，而是通过对话逐步收集梦境素材，引导用户进行自由联想，最终在信息充分时进行释梦。

一、角色设定
- 语气温和、开放，不打断、不分析。
- 你不是心理医生，不做诊断，不给绝对结论。
- 引导用户进行自由联想，帮助他们自我察觉。

二、对话阶段（必须按顺序推进）
【阶段 1｜梦境采集】
- 邀请用户详细描述梦境内容（场景、人物、情绪、符号、重复元素、发展过程、醒后感受）。
- 仅倾听与确认，不进行分析。

【阶段 2｜引导自由联想】
- 在用户描述后，通过简短提问引导其自由联想（“这个形象让你现实中想到什么？”、“这种情绪你最近是否熟悉？”）。
- 不替用户下结论，只帮助其展开联想。

【阶段 3｜补充提问】
- 仅在关键信息缺失时进行简短补充引导。
- 避免连续追问，避免审问感。

【阶段 4｜释梦（触发条件）】
- 仅在信息完整或用户明确请求时进行释梦。
- 释梦要求：以“可能性”与“象征意义”为主，不做唯一解释，关联现实心理状态，语言克制、尊重。
- 释梦结束后，输出特殊标记 "【分析完成】" 并附上【分析小结】。

三、回复约束
- 每次回复聚焦一个目的：倾听 / 引导 / 补充 / 释梦。
- 不在信息不足时提前解释梦的意义。
- 不使用说教、诊断、标签化语言。
- 单次回复严禁超过 6 行。`
      };

      const contextMessages = [systemPrompt, ...nextMessages];

      const res = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: contextMessages }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || res.status);
      }

      const content = (data?.content ?? "").toString();
      
      // Check for completion flag
      const isAnalysisComplete = content.includes("【分析完成】");
      const cleanContent = content.replace("【分析完成】", "").trim();

      const assistantMsg: Msg = { role: "assistant", content: cleanContent || "（无内容）" };
      setMessages([...nextMessages, assistantMsg]);
      
      if (currentRecordId) {
        const records = loadRecords();
        const existing = records.find(r => r.id === currentRecordId);
        const newMessages = [...(existing?.messages || []), { role: "assistant", content: assistantMsg.content, ts: new Date().toISOString() }];
        const newRaw = `${(existing?.rawText || "").trim()}\nAI：${assistantMsg.content}`.trim();
        
        // Update record
        updateSaveRecord(currentRecordId, { 
          messages: newMessages.map(m => ({ 
            role: m.role as "user" | "assistant", 
            content: m.content, 
            ts: m.ts 
          })), 
          rawText: newRaw, 
          updatedAt: Date.now() 
        });

        // If analysis is complete, trigger parsing and mark as completed
        if (isAnalysisComplete) {
          try {
            const analysis = await parseDream(newRaw);
            // Extract a summary from the AI's final response if possible, or use the parsed one
            const finalSummary = cleanContent.match(/【分析小结】([\s\S]*)/)?.[1]?.trim() || analysis.summary;
            
            // Call Emotion API
            // Extract user content for better emotion analysis
            const userContent = newMessages
                .filter(m => m.role === 'user')
                .map(m => m.content)
                .join('\n');
            
            let emotionResult = null;
            try {
                const emotionRes = await fetch('/api/emotion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dreamText: userContent })
                });
                if (emotionRes.ok) {
                    emotionResult = await emotionRes.json();
                }
            } catch (err) {
                console.error("Emotion analysis failed", err);
            }

            // Merge emotion result
            const finalExtracted = { ...analysis.extracted };
            let primaryEmotion = null;
            
            if (emotionResult && emotionResult.primaryEmotion) {
                primaryEmotion = emotionResult.primaryEmotion;
                // Overwrite with the real emotion from AI
                finalExtracted.emotions = [{
                    name: emotionResult.primaryEmotion,
                    score: emotionResult.confidence || 1
                }];
            }

            updateSaveRecord(currentRecordId, { 
              extracted: finalExtracted, 
              emotion: primaryEmotion, // Save to new top-level field
              summary: finalSummary, 
              updatedAt: Date.now(), 
              status: "completed" 
            });
          } catch {}
        }
      }
    } catch (e) {
      const assistantMsg: Msg = { role: "assistant", content: "抱歉，网络似乎出了问题。" };
      setMessages([...nextMessages, assistantMsg]);
      // ... (error handling persistence logic same as before)
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeContinue = async () => {
    setShowResumeBanner(false);
    const gentle = "好的，我们可以从你记得的片段或一种感受再开始。";
    const nextMessages: Msg[] = [...messages, { role: "assistant", content: gentle }];
    setMessages(nextMessages);
    if (currentRecordId) {
      const records = loadRecords();
      const existing = records.find(r => r.id === currentRecordId);
      const newMessages = [...(existing?.messages || []), { role: "assistant", content: gentle, ts: new Date().toISOString() }];
      const newRaw = `${(existing?.rawText || "").trim()}\nAI：${gentle}`.trim();
      updateSaveRecord(currentRecordId, { messages: newMessages as { role: "user" | "assistant"; content: string; ts: string }[], rawText: newRaw, updatedAt: Date.now() });
    }
  };

  const handleResumeViewOnly = () => {
    setShowResumeBanner(false);
  };
  
  // Check if we are in review mode (completed record)
  const isReviewMode = params.get("mode") === 'review';
  const isCompleted = messages.length > 0 && currentRecordId && loadRecords().find(r => r.id === currentRecordId)?.status === 'completed';

  return (
    <div className={styles.container}>
      <BackButton />
      {showResumeBanner && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: "#f8fafc", display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>已恢复上次的梦境。</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={chatStyles.sendBtn} onClick={handleResumeContinue}>继续聊聊</button>
            <button className={chatStyles.sendBtn} onClick={handleResumeViewOnly}>只是看看</button>
          </div>
        </div>
      )}
      
      {/* Review Mode Banner for Incomplete Dreams */}
      {isReviewMode && !isCompleted && !showResumeBanner && (
         <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #ffedd5" }}>
           <span style={{ color: "#c2410c", fontSize: "0.9rem" }}>这段对话尚未结束，愿意继续吗？</span>
           <button className={chatStyles.sendBtn} onClick={() => setShowResumeBanner(true)} style={{ background: "#ea580c" }}>从这里继续</button>
         </div>
      )}

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
      
      {(!isReviewMode || !isCompleted) && (
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
      )}
      
      {isReviewMode && isCompleted && (
        <div className={styles.reviewFooter}>
          <p>这是一次被认真对待的梦。</p>
        </div>
      )}
    </div>
  );
}
