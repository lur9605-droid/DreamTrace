"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { loadRecords } from "@/lib/storage";
import type { DreamRecord, EmotionLabel } from "@/lib/types";

type EmotionName = string;

const getEmotionNames = (record: DreamRecord): EmotionName[] => {
  const arr = record.extracted?.emotions || [];
  return arr.map((e) => (typeof e === "string" ? e : (e as EmotionLabel).name));
};

const softColor = (name: EmotionName): string => {
  const n = name.toLowerCase();
  if (["anxiety", "紧张", "焦虑"].some((k) => n.includes(k))) return "#FDE68A"; // warm yellow
  if (["sad", "难过", "悲伤"].some((k) => n.includes(k))) return "#FECACA"; // soft red
  if (["calm", "平静", "宁静"].some((k) => n.includes(k))) return "#BFDBFE"; // soft blue
  if (["angry", "愤怒", "生气"].some((k) => n.includes(k))) return "#FCA5A5"; // light red
  if (["joy", "开心", "快乐"].some((k) => n.includes(k))) return "#A7F3D0"; // mint
  return "#E5E7EB"; // neutral gray
};

const primaryEmotion = (record: DreamRecord): EmotionName | null => {
  const names = getEmotionNames(record);
  return names.length > 0 ? names[0] : null;
};

const gentleSummary = (emotions: EmotionName[]): string => {
  const set = Array.from(new Set(emotions.filter(Boolean)));
  if (set.length === 0) return "最近这段时间，页面还在安静地等你。";
  const hasCalm = set.some((e) => /平静|calm|宁静/i.test(e));
  const hasAnx = set.some((e) => /焦虑|紧张|anxiety/i.test(e));
  const hasSad = set.some((e) => /难过|悲伤|sad/i.test(e));
  const picks = set.slice(0, 3).join("、");
  if (hasCalm && hasAnx) return `最近你的情绪并不剧烈，偶尔出现的紧张与一些平稳交织着。${picks} 这些词也时常出现。`;
  if (hasSad) return `最近的情绪有些柔软和低落，但也在缓慢流动。${picks} 这样的一些感受被记录了下来。`;
  return `最近，这些感受在轻轻地出现：${picks}。不必着急，它们都有来到的理由。`;
};

function EmotionalTrace({ colors }: { colors: string[] }) {
  const count = colors.filter(Boolean).length;
  return (
    <div className={styles.traceContainer}>
      {count === 0 && (
        <>
          <div className={styles.breathLine} />
          <div className={styles.traceCaption}>情绪还没留下形状</div>
        </>
      )}
      {count > 0 && count <= 2 && (
        <>
          <div className={styles.breathLine} />
          <div className={styles.floatBlock} style={{ left: "22%", backgroundColor: colors[0] || "#E5E7EB" }} />
          {count === 2 && (
            <div className={styles.floatBlock} style={{ left: "68%", backgroundColor: colors[1] || "#E5E7EB" }} />
          )}
          <div className={styles.traceCaption}>有一些感受，开始被注意到了</div>
        </>
      )}
      {count >= 3 && (
        <>
          <div className={styles.softBand} />
          <div className={styles.bandNoise} />
          <div className={styles.traceDots}>
            {colors.slice(0, 24).map((c, i) => (
              <span
                key={i}
                className={styles.traceDot}
                style={{ left: `${(i / Math.max(1, Math.min(colors.length, 24) - 1)) * 100}%`, backgroundColor: c, top: `${16 + (i % 5) * 4}px` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [records, setRecords] = useState<DreamRecord[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => {
      const ta = new Date(a.createdAt || a.date || 0).getTime();
      const tb = new Date(b.createdAt || b.date || 0).getTime();
      return ta - tb;
    });
  }, [records]);

  const hasRecords = sorted.length > 0;

  const emotionTimeline = useMemo(() => {
    return sorted.map((r) => primaryEmotion(r));
  }, [sorted]);

  const recentTags = useMemo(() => {
    const names = sorted.flatMap((r) => getEmotionNames(r));
    const unique = Array.from(new Set(names)).filter(Boolean).slice(0, 5);
    return unique;
  }, [sorted]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Emotional Trace</h1>
        <p className={styles.subtitle}>现在还很安静，没关系。</p>
      </div>
      <div className={styles.summary}>{gentleSummary(emotionTimeline.filter(Boolean) as string[])}</div>

      <EmotionalTrace colors={emotionTimeline.map((e) => softColor(e || ""))} />

      <div className={styles.tagsRow}>
        {recentTags.map((t) => (
          <span key={t} className={styles.tag}>#{t}</span>
        ))}
      </div>

      <div className={styles.footerNote}>情绪是被感受的，而不是被修正的。谢谢你告诉自己这些感受。</div>
    </div>
  );
}
