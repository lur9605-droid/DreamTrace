"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { loadRecords } from "@/lib/storage";
import type { DreamRecord, EmotionLabel } from "@/lib/types";
import BackButton from "@/components/BackButton";

type EmotionName = string;

const getEmotionNames = (record: DreamRecord): EmotionName[] => {
  // Prioritize top-level emotion field
  if (record.emotion) return [record.emotion];
  
  const arr = record.extracted?.emotions || [];
  return arr.map((e) => (typeof e === "string" ? e : (e as EmotionLabel).name));
};

const softColor = (name: EmotionName): string => {
  const n = name.toLowerCase();
  // Positive/Relaxed -> Warm (Orange, Pink, Warm Yellow)
  if (["joy", "开心", "快乐", "愉悦", "excited"].some((k) => n.includes(k))) return "#FDBA74"; // Orange-300
  if (["relax", "轻松", "content", "satisfied"].some((k) => n.includes(k))) return "#F9A8D4"; // Pink-300
  
  // Neutral/Calm -> Neutral (Sage, Soft Blue-Grey)
  if (["calm", "平静", "宁静", "neutral", "peace"].some((k) => n.includes(k))) return "#94A3B8"; // Slate-400
  
  // Negative/Low -> Cold (Blue, Indigo, Violet)
  if (["sad", "难过", "悲伤", "depressed", "low"].some((k) => n.includes(k))) return "#818CF8"; // Indigo-400
  if (["anxiety", "紧张", "焦虑", "fear", "scared"].some((k) => n.includes(k))) return "#60A5FA"; // Blue-400
  if (["angry", "愤怒", "生气"].some((k) => n.includes(k))) return "#A78BFA"; // Violet-400
  
  return "#CBD5E1"; // Slate-300
};

// ... existing code ...

function EmotionCurve({ records }: { records: DreamRecord[] }) {
  const width = 900;
  const height = 260;
  const paddingLeft = 56;
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 40;

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: string;
    emotion: string;
    summary: string;
    color: string;
  } | null>(null);

  const levels = ["低落", "紧绷", "平静", "轻松", "愉悦"];
  const levelIndexForEmotion = (name: string | null): number => {
    const n = (name || "").toLowerCase();
    if (/愉悦|joy|快乐|excited|happy/.test(n)) return 4;
    if (/轻松|relax|relaxed|content/.test(n)) return 3;
    if (/平静|宁静|calm|serene|neutral|peace|混合/.test(n)) return 2;
    if (/紧绷|焦虑|紧张|anxiety|fear|scared|nervous/.test(n)) return 1;
    if (/低落|sad|sadness|难过|悲伤|depressed|angry|愤怒/.test(n)) return 0;
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

  const pointsRaw = sorted.map((r, idx) => {
    // Prioritize top-level emotion
    let emotionName = r.emotion;
    if (!emotionName) {
         // Fallback to extracted emotions
         const first = r.extracted?.emotions?.[0];
         if (typeof first === 'string') emotionName = first;
         else if (first && typeof first === 'object') emotionName = (first as EmotionLabel).name;
    }
    emotionName = emotionName || "平静";

    return {
      date: dateOf(r),
      emotion: emotionName,
      summary: r.summary || getEmotionNames(r).join("，") || "暂无摘要",
      idx,
    };
  }).filter(p => p.date);

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

  type P = { x: number; y: number; data: typeof pointsRaw[0] };
  
  const points: P[] = pointsRaw.map((p, i) => ({
    x: xForIndex(i),
    y: yForLevel(levelIndexForEmotion(p.emotion)),
    data: p
  }));
  
  const colors = pointsRaw.map(p => colorForEmotion(p.emotion));

  const buildPath = (ps: P[]): string => {
    if (ps.length <= 1) return "";
    if (ps.length === 2) return `M ${ps[0].x},${ps[0].y} L ${ps[1].x},${ps[1].y}`;
    const t = 0.35;
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

  const pathD = buildPath(points);

  // Gradient logic for the line
  const gradientStops = points.map((p, i) => ({
    offset: count <= 1 ? 0.5 : i / (count - 1),
    color: colors[i]
  }));

  const formatDateShort = (d?: Date | null): string => {
    if (!d) return "";
    const m = String(d.getMonth() + 1);
    const day = String(d.getDate());
    return `${m}.${day}`;
  };

  const xTicks = (() => {
    if (count === 0) return [] as { x: number; label: string }[];
    const maxTicks = 6;
    const step = Math.ceil(count / maxTicks);
    const arr: { x: number; label: string }[] = [];
    for (let i = 0; i < count; i += step) {
      arr.push({ x: xForIndex(i), label: formatDateShort(pointsRaw[i].date as Date) });
    }
    // Ensure last one is included if not too close
    if (count > 0 && (arr.length === 0 || arr[arr.length - 1].x < xForIndex(count - 1) - 30)) {
        arr.push({ x: xForIndex(count - 1), label: formatDateShort(pointsRaw[count - 1].date as Date) });
    }
    return arr;
  })();

  return (
    <div className={styles.curveContainer} style={{ position: 'relative' }}>
      <svg width={"100%"} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((s, i) => (
              <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid & Axes */}
        <g opacity="0.6">
           {levels.map((lv, i) => {
            const y = yForLevel(i);
            return (
              <g key={lv}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#F1F5F9" strokeWidth={1} strokeDasharray="4 4" />
                <text x={paddingLeft - 12} y={y + 4} textAnchor="end" fontSize={12} fill="#94A3B8" style={{ fontFamily: 'sans-serif' }}>{lv}</text>
              </g>
            );
          })}
        </g>
        
        {/* X Axis Labels */}
        <g>
            {xTicks.map((t, i) => (
            <text key={i} x={t.x} y={height - paddingBottom + 20} textAnchor="middle" fontSize={12} fill="#94A3B8">{t.label}</text>
            ))}
        </g>

        {/* The Curve */}
        {pathD && (
          <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Interactive Points */}
        {points.map((p, i) => (
          <g key={i} 
             onMouseEnter={(e) => {
               // Calculate relative position for tooltip
               // We can use the p.x and p.y directly since they are SVG coordinates
               // But the tooltip is a div outside SVG (or inside container), so we need to be careful with scaling
               // For simplicity, we can position the tooltip using style left/top percentages or px
               // Since viewBox matches width/height, px should work if 1:1, but responsive might break it.
               // Let's store the data and use a percentage based positioning or event client rects?
               // The SVG is responsive width="100%". 
               // Let's use the event client coordinates or a more robust method.
               // Actually, since the container is relative, we can use percentage of width/height.
               setHoveredPoint({
                 x: p.x,
                 y: p.y,
                 date: formatDateShort(p.data.date),
                 emotion: p.data.emotion,
                 summary: p.data.summary,
                 color: colors[i]
               });
             }}
             onMouseLeave={() => setHoveredPoint(null)}
             style={{ cursor: 'pointer' }}
          >
            {/* Hit area */}
            <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
            {/* Visible dot */}
            <circle 
                cx={p.x} 
                cy={p.y} 
                r={5} 
                fill={colors[i]} 
                stroke="#fff" 
                strokeWidth={2}
                style={{ 
                    transition: 'r 0.3s ease', 
                    transformOrigin: `${p.x}px ${p.y}px`,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }} 
            />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div style={{
            position: 'absolute',
            left: hoveredPoint.x,
            top: hoveredPoint.y - 10,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            pointerEvents: 'none',
            minWidth: '200px',
            maxWidth: '260px',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
                <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: hoveredPoint.color 
                }}></span>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{hoveredPoint.date}</span>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>{hoveredPoint.emotion}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                {hoveredPoint.summary}
            </div>
            {/* Little triangle arrow */}
            <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(255, 255, 255, 0.95)'
            }}></div>
        </div>
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
    return sorted.map((r) => {
      const names = getEmotionNames(r);
      return names.length > 0 ? names[0] : '平静';
    });
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
        <p className={styles.subtitle}>情绪是被感受的，而不是被修正的。谢谢你告诉自己这些感受。</p>
      </div>
      <EmotionCurve records={sorted} />
    </div>
  );
}
