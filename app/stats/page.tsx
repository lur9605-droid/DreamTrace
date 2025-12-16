"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { loadRecords } from "@/lib/storage";
import type { DreamRecord, EmotionLabel } from "@/lib/types";
import BackButton from "@/components/BackButton";

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

function EmotionCurve({ records }: { records: DreamRecord[] }) {
  const width = 900;
  const height = 260;
  const paddingLeft = 56; // space for Y axis labels
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 40; // space for X axis labels

  const levels = ["低落", "紧绷", "平静", "轻松", "愉悦"];
  const levelIndexForEmotion = (name: string | null): number => {
    const n = (name || "").toLowerCase();
    if (/愉悦|joy|快乐/.test(n)) return 4;
    if (/轻松|relax|relaxed/.test(n)) return 3;
    if (/平静|宁静|calm|serene|neutral/.test(n)) return 2;
    if (/紧绷|焦虑|紧张|anxiety|fear|anger/.test(n)) return 1;
    if (/低落|sad|sadness|难过|悲伤/.test(n)) return 0;
    return 2;
  };

  const dateOf = (r: DreamRecord): Date | null => {
    const d = r.createdAt || r.date || "";
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const sorted = [...records].sort((a, b) => {
    const ta = dateOf(a)?.getTime() || 0;
    const tb = dateOf(b)?.getTime() || 0;
    return ta - tb;
  });

  const pointsRaw = sorted.map((r, idx) => ({
    date: dateOf(r),
    emotion: (r.extracted?.emotions?.[0] && (typeof r.extracted!.emotions![0] === 'string' ? (r.extracted!.emotions![0] as string) : (r.extracted!.emotions![0] as EmotionLabel).name)) || null,
    idx,
  })).filter(p => p.date);

  const count = pointsRaw.length;

  const xForIndex = (i: number) => {
    const innerW = width - paddingLeft - paddingRight;
    if (count <= 1) return paddingLeft + innerW * 0.5;
    return paddingLeft + (innerW * i) / (count - 1);
  };
  const yForLevel = (level: number) => {
    const innerH = height - paddingTop - paddingBottom;
    const step = innerH / (levels.length - 1);
    return paddingTop + innerH - level * step;
  };
  const colorForEmotion = (name: string | null) => softColor(name || "");

  // Build smooth path using cubic bezier spline
  type P = { x: number; y: number };
  const toPoints = (): { pts: P[]; colors: string[] } => {
    if (count === 0) {
      const baseline = yForLevel(2);
      return { pts: [{ x: paddingLeft, y: baseline }, { x: width - paddingRight, y: baseline }], colors: ["#E5E7EB", "#E5E7EB"] };
    }
    const pts: P[] = pointsRaw.map((p, i) => ({ x: xForIndex(i), y: yForLevel(levelIndexForEmotion(p.emotion)) }));
    const colors = pointsRaw.map(p => colorForEmotion(p.emotion));
    if (count === 1) {
      // add gentle pre/post anchors near baseline for smoothness
      const baseline = yForLevel(2);
      const px = pts[0].x, py = pts[0].y;
      return { pts: [{ x: paddingLeft, y: baseline }, { x: px, y: py }, { x: width - paddingRight, y: baseline }], colors: ["#E5E7EB", colors[0], "#E5E7EB"] };
    }
    return { pts, colors };
  };

  const { pts, colors } = toPoints();

  const buildPath = (ps: P[]): string => {
    if (ps.length <= 1) return "";
    if (ps.length === 2) return `M ${ps[0].x},${ps[0].y} L ${ps[1].x},${ps[1].y}`;
    const t = 0.35; // tension for smoothness
    let d = `M ${ps[0].x},${ps[0].y}`;
    for (let i = 0; i < ps.length - 1; i++) {
      const p0 = ps[Math.max(0, i - 1)];
      const p1 = ps[i];
      const p2 = ps[i + 1];
      const p3 = ps[Math.min(ps.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) * t / 2;
      const cp1y = p1.y + (p2.y - p0.y) * t / 2;
      const cp2x = p2.x - (p3.x - p1.x) * t / 2;
      const cp2y = p2.y - (p3.y - p1.y) * t / 2;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const pathD = buildPath(pts);

  const gradientStops = colors.map((c, i) => ({ offset: count <= 1 ? 0.5 : i / (colors.length - 1), color: c }));

  const formatDateShort = (d?: Date | null): string => {
    if (!d) return "";
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}·${day}`;
  };

  const xTicks = (() => {
    if (count === 0) return [] as { x: number; label: string }[];
    const maxTicks = 6;
    const step = Math.ceil(count / maxTicks);
    const arr: { x: number; label: string }[] = [];
    for (let i = 0; i < count; i += step) {
      arr.push({ x: xForIndex(i), label: formatDateShort(pointsRaw[i].date as Date) });
    }
    if (count > 0) arr.push({ x: xForIndex(count - 1), label: formatDateShort(pointsRaw[count - 1].date as Date) });
    return arr;
  })();

  return (
    <div className={styles.curveContainer}>
      <svg width={"100%"} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Y axis and gentle grid */}
        <g>
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#E5E7EB" strokeWidth={1} />
          {levels.map((lv, i) => {
            const y = yForLevel(i);
            return (
              <g key={lv}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(228, 234, 240, 0.35)" strokeWidth={1} />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize={12} fill="#9aa7b8">{lv}</text>
              </g>
            );
          })}
        </g>

        {/* X axis */}
        <g>
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#E5E7EB" strokeWidth={1} />
          {xTicks.map((t, i) => (
            <g key={i}>
              <line x1={t.x} y1={height - paddingBottom} x2={t.x} y2={height - paddingBottom + 6} stroke="#E5E7EB" strokeWidth={1} />
              <text x={t.x} y={height - paddingBottom + 20} textAnchor="middle" fontSize={11} fill="#a0aec0">{t.label}</text>
            </g>
          ))}
        </g>

        {/* Gradient for curve */}
        <defs>
          <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((s, i) => (
              <stop key={i} offset={`${Math.round(s.offset * 100)}%`} stopColor={s.color} stopOpacity={count >= 3 ? 0.8 : count >= 1 ? 0.6 : 0.25} />
            ))}
          </linearGradient>
        </defs>

        {/* Curve path */}
        {pathD && (
          <path d={pathD} fill="none" stroke="url(#emotionGradient)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* subtle points for context (very low opacity) */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={count >= 3 ? 2.8 : 2.4} fill={colors[i] || "#E5E7EB"} opacity={count >= 3 ? 0.35 : 0.28} />
        ))}
      </svg>
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
      <BackButton />
      <div className={styles.header}>
        <h1 className={styles.title}>Your Emotional Trace</h1>
        <p className={styles.subtitle}>现在还很安静，没关系。</p>
      </div>
      <EmotionCurve records={sorted} />

      <div className={styles.footerNote}>情绪是被感受的，而不是被修正的。谢谢你告诉自己这些感受。</div>
    </div>
  );
}
