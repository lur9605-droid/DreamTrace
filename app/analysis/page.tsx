"use client"; 
 import React, { useState } from "react"; 
 import TextArea from "@/components/TextArea"; 
 import ResultCard from "@/components/ResultCard"; 
 import styles from "./page.module.css"; 
 import { parseDream } from "@/lib/mockAI"; 
 import type { Extracted } from "@/lib/types"; 
 
 export default function AnalysisPage() { 
   const [text, setText] = useState(""); 
   const [loading, setLoading] = useState(false); 
   const [result, setResult] = useState<{ summary: string; extracted: Extracted; hints: any } | null>(null); 
   const [error, setError] = useState<string | null>(null); 
 
   const handleAnalyze = async () => { 
     if (!text.trim()) { 
       setError("请先描述你的梦，越具体越好～"); 
       return; 
     } 
     setError(null); 
     setLoading(true); 
     try { 
       const res = await parseDream(text); 
       setResult({ summary: res.summary, extracted: res.extracted, hints: res.hints }); 
     } catch (e) { 
       console.error(e); 
       setError("解析失败，请稍后再试。"); 
     } finally { 
       setLoading(false); 
     } 
   }; 
 
   return ( 
     <div className={styles.container}> 
       <h1 className={styles.title}>描述你的梦</h1> 
       <p className={styles.subtitle}>越具体越好：场景、人物、情绪和你醒来的感觉都可以写进来。</p> 
 
       <TextArea value={text} onChange={setText} placeholder="昨晚我梦见..." /> 
 
       <div className={styles.controls}> 
         <button className={styles.analyzeBtn} onClick={handleAnalyze} disabled={loading}> 
           {loading ? "解析中…" : "解析我的梦"} 
         </button> 
         <button className={styles.clearBtn} onClick={() => { setText(""); setResult(null); setError(null); }}> 
           清空 
         </button> 
       </div> 
 
       {error && <div className={styles.error}>{error}</div>} 
 
       {result && ( 
         <ResultCard 
           rawText={text} 
           summary={result.summary} 
           extracted={result.extracted} 
           hints={result.hints} 
           onSaved={() => { 
             // small UI feedback could be added here 
           }} 
         /> 
       )} 
     </div> 
   ); 
 }