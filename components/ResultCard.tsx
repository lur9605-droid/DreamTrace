"use client"; 
 import React, { useState } from "react"; 
 import styles from "./ResultCard.module.css"; 
 import type { Extracted, DreamRecord } from "@/lib/types"; 
const uuidv4 = () => crypto.randomUUID();
 import { saveRecord } from "@/lib/storage"; 
 
 interface Props { 
   rawText: string; 
   summary: string; 
   extracted: Extracted; 
   hints?: { questions: string[]; comforting: string[]; steps: string[] }; 
   onSaved?: () => void; 
 } 
 
 export default function ResultCard({ rawText, summary, extracted, hints, onSaved }: Props) { 
   const [saved, setSaved] = useState(false); 
 
  const handleSave = () => { 
    const record: DreamRecord = { 
      id: uuidv4(), 
      createdAt: new Date().toISOString(), 
      rawText, 
      extracted, 
      summary,
      status: "completed",
      updatedAt: Date.now()
    }; 
    saveRecord(record); 
    setSaved(true); 
    onSaved?.(); 
  }; 
 
   return ( 
     <div className={styles.card}> 
       <h3 className={styles.title}>解析结果</h3> 
       <p className={styles.summary}>{summary}</p> 
 
       <div className={styles.row}> 
         <div> 
           <strong>情绪线索</strong> 
           <div className={styles.emotions}> 
             {extracted.emotions.map((e) => ( 
               <span key={typeof e === 'string' ? e : e.name} className={styles.bubble}>
                 {typeof e === 'string' ? e : `${e.name} (${e.score}%)`}
               </span> 
             ))} 
           </div> 
         </div> 
         <div> 
           <strong>关键词</strong> 
           <div className={styles.keywords}> 
             {extracted.keywords.map((k) => ( 
               <span key={k} className={styles.keyword}>{k}</span> 
             ))} 
           </div> 
         </div> 
       </div> 
 
       <div className={styles.extracted}> 
         {extracted.scenes && extracted.scenes.length > 0 && <div><strong>场景：</strong>{extracted.scenes.join("、")}</div>} 
         {extracted.people && extracted.people.length > 0 && <div><strong>人物：</strong>{extracted.people.join("、")}</div>} 
         {extracted.actions && extracted.actions.length > 0 && <div><strong>动作：</strong>{extracted.actions.join("、")}</div>} 
         {extracted.symbols && extracted.symbols.length > 0 && <div><strong>象征：</strong>{extracted.symbols.join("、")}</div>} 
       </div> 
 
       {hints && ( 
         <div className={styles.hints}> 
           <strong>引导问题</strong> 
           <ul> 
             {hints.questions.map((q) => <li key={q}>{q}</li>)} 
           </ul> 
           <strong>温柔安抚</strong> 
           <ul> 
             {hints.comforting.map((c) => <li key={c}>{c}</li>)} 
           </ul> 
           <strong>轻量建议</strong> 
           <ul> 
             {hints.steps.map((s) => <li key={s}>{s}</li>)} 
           </ul> 
         </div> 
       )} 
 
       <div className={styles.actions}> 
         <button className={styles.saveBtn} onClick={handleSave} disabled={saved}> 
           {saved ? "已保存到日记" : "把它保存到我的梦境日记"} 
         </button> 
       </div> 
     </div> 
   ); 
 }
