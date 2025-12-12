"use client"; 
 import React, { useState } from "react"; 
import TextArea from "@/components/TextArea"; 
import styles from "./page.module.css"; 
import { parseDream } from "@/lib/mockAI"; 
import type { Extracted } from "@/lib/types"; 
import ChatInterface from "@/components/ChatInterface";

export default function AnalysisPage() { 
  const [text, setText] = useState(""); 
  const [status, setStatus] = useState<"idle" | "analyzing" | "chat">("idle");
  const [result, setResult] = useState<{ summary: string; extracted: Extracted; hints: any } | null>(null); 
  const [error, setError] = useState<string | null>(null); 

  const handleAnalyze = async () => { 
    if (!text.trim()) { 
      setError("请先描述你的梦，越具体越好～"); 
      return; 
    } 
    setError(null); 
    setStatus("analyzing"); 
    try { 
      const res = await parseDream(text); 
      setResult({ summary: res.summary, extracted: res.extracted, hints: res.hints }); 
      setStatus("chat");
    } catch (e) { 
      console.error(e); 
      setError("解析失败，请稍后再试。"); 
      setStatus("idle");
    } 
  }; 

  if (status === "chat" && result) {
    return (
      <ChatInterface 
        initialResult={result} 
        dreamText={text}
        onReset={() => {
          setStatus("idle");
          setResult(null);
          setText("");
        }} 
      />
    );
  }

  return ( 
    <div className={styles.container}> 
      <h1 className={styles.title}>描述你的梦</h1> 
      <p className={styles.subtitle}>越具体越好：场景、人物、情绪和你醒来的感觉都可以写进来。</p> 
      
      {status === "analyzing" ? (
        <div className={styles.analyzing}>
          <div className={styles.spinner}></div>
          <p>正在用心解析你的梦境...</p>
        </div>
      ) : (
        <>
          <TextArea value={text} onChange={setText} placeholder="昨晚我梦见..." /> 

          <div className={styles.controls}> 
            <button className={styles.analyzeBtn} onClick={handleAnalyze}> 
              解析我的梦
            </button> 
            <button className={styles.clearBtn} onClick={() => { setText(""); setError(null); }}> 
              清空 
            </button> 
          </div> 

          {error && <div className={styles.error}>{error}</div>} 
        </>
      )}
    </div> 
  ); 
}