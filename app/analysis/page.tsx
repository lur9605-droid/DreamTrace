"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import chatStyles from "../../components/ChatInterface.module.css";
import { saveRecord, updateSaveRecord, loadRecords } from "@/lib/storage";
import { DreamRecord } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { parseDream } from "@/lib/mockAI";

const uuidv4 = () => crypto.randomUUID();

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
  const params = useSearchParams();
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const resumeId = params.get("resume");
    if (resumeId) {
      const records = loadRecords();
      const record = records.find(r => r.id === resumeId);
      if (record) {
        setCurrentRecordId(record.id);
        setShowResumeBanner(record.status === 'in_progress');
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
          updatedAt: Date.now()
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
      const res = await fetch("/api/kimi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        const assistantMsg: Msg = { role: "assistant", content: `抱歉，接口错误：${data?.error || res.status}` };
        setMessages([...nextMessages, assistantMsg]);
        if (currentRecordId) {
          const records = loadRecords();
          const existing = records.find(r => r.id === currentRecordId);
          const newMessages = [...(existing?.messages || []), { role: "assistant", content: assistantMsg.content, ts: new Date().toISOString() }];
          const newRaw = `${(existing?.rawText || "").trim()}\nAI：${assistantMsg.content}`.trim();
          updateSaveRecord(currentRecordId, { messages: newMessages as { role: "user" | "assistant"; content: string; ts: string }[], rawText: newRaw, updatedAt: Date.now() });
          try {
            const analysis = await parseDream(newRaw);
            updateSaveRecord(currentRecordId, { extracted: analysis.extracted, summary: analysis.summary, updatedAt: Date.now() });
          } catch {}
        }
      } else {
        const content = (data?.content ?? "").toString();
        const assistantMsg: Msg = { role: "assistant", content: content || "（无内容）" };
        setMessages([...nextMessages, assistantMsg]);
        if (currentRecordId) {
          const records = loadRecords();
          const existing = records.find(r => r.id === currentRecordId);
          const newMessages = [...(existing?.messages || []), { role: "assistant", content: assistantMsg.content, ts: new Date().toISOString() }];
          const newRaw = `${(existing?.rawText || "").trim()}\nAI：${assistantMsg.content}`.trim();
          updateSaveRecord(currentRecordId, { messages: newMessages as { role: "user" | "assistant"; content: string; ts: string }[], rawText: newRaw, updatedAt: Date.now() });
          try {
            const analysis = await parseDream(newRaw);
            updateSaveRecord(currentRecordId, { extracted: analysis.extracted, summary: analysis.summary, updatedAt: Date.now() });
          } catch {}
        }
      }
    } catch (e) {
      const assistantMsg: Msg = { role: "assistant", content: "抱歉，网络似乎出了问题。" };
      setMessages([...nextMessages, assistantMsg]);
      if (currentRecordId) {
        const records = loadRecords();
        const existing = records.find(r => r.id === currentRecordId);
        const newMessages = [...(existing?.messages || []), { role: "assistant", content: assistantMsg.content, ts: new Date().toISOString() }];
        const newRaw = `${(existing?.rawText || "").trim()}\nAI：${assistantMsg.content}`.trim();
        updateSaveRecord(currentRecordId, { messages: newMessages as { role: "user" | "assistant"; content: string; ts: string }[], rawText: newRaw, updatedAt: Date.now() });
        try {
          const analysis = await parseDream(newRaw);
          updateSaveRecord(currentRecordId, { extracted: analysis.extracted, summary: analysis.summary, updatedAt: Date.now() });
        } catch {}
      }
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

  return (
    <div className={styles.container}>
      {showResumeBanner && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: "#f8fafc", display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>已恢复上次的梦境。</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={chatStyles.sendBtn} onClick={handleResumeContinue}>继续聊聊</button>
            <button className={chatStyles.sendBtn} onClick={handleResumeViewOnly}>只是看看</button>
          </div>
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
