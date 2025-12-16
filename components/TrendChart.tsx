'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './TrendChart.module.css';

interface ChartData {
  label?: string; // Optional for line chart
  date?: string; // For line chart X-axis
  value: number;
  color?: string;
  emotion?: string; // For line chart point color
  summary?: string; // For tooltip
}

interface TrendChartProps {
  data: ChartData[];
  title?: string;
  width?: number;
  height?: number;
  type?: 'bar' | 'line'; // Added chart type
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  title, 
  width = 600, 
  height = 300,
  type = 'bar'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; text: string; subtext?: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ... (DPI scaling logic remains same)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', width / 2, height / 2);
      return;
    }

    const padding = { top: 40, right: 40, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (type === 'line') {
      // Line Chart Logic
      const gap = chartWidth / (data.length > 1 ? data.length - 1 : 1);
      
      // Helper to get Y position (assuming 0-10 scale for emotions)
      const getY = (val: number) => {
        const normalized = Math.min(Math.max(val, 0), 10); // clamp 0-10
        return (height - padding.bottom) - (normalized / 10) * chartHeight;
      };

      // Draw background grid and Y-axis labels
      ctx.beginPath();
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#999';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      
      // Draw 3 reference lines: High (Positive), Mid (Neutral), Low (Negative)
      const levels = [
        { val: 9, label: '积极' },
        { val: 5, label: '平静' },
        { val: 2, label: '消极' }
      ];

      levels.forEach(level => {
        const y = getY(level.val);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.fillText(level.label, padding.left - 10, y + 4);
      });
      ctx.stroke();

      // Draw connecting lines (Curved using bezierCurveTo for smoother look)
      ctx.beginPath();
      ctx.strokeStyle = '#888'; // Darker line for better visibility
      ctx.lineWidth = 3; // Thicker line
      
      data.forEach((item, index) => {
        const x = padding.left + (data.length > 1 ? index * gap : chartWidth / 2);
        const y = getY(item.value);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic curve for smoothing
          const prevX = padding.left + (index - 1) * gap;
          const prevY = getY(data[index - 1].value);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.stroke();

      // Draw points
      data.forEach((item, index) => {
        const x = padding.left + (data.length > 1 ? index * gap : chartWidth / 2);
        const y = getY(item.value);

        // Point
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = item.color || '#0070f3';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Date Label
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.date || '', x, height - padding.bottom + 20);
        
        // Emotion Label (above point)
        // Only show if enough space or on hover? Let's keep it but make it smaller or selective
        // To avoid clutter, maybe only show if data length is small, or just rely on tooltip.
        // For now, let's keep it but move it up a bit more.
        // ctx.fillStyle = item.color || '#0070f3';
        // ctx.font = 'bold 12px sans-serif';
        // ctx.fillText(item.emotion || '', x, y - 15);
      });

    } else {
      // Existing Bar Chart Logic
      const maxValue = Math.max(...data.map(d => d.value), 5);
      
      // ... (Axes drawing) ...
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#eaeaea';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight * i) / 5;
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        // Y Axis labels
        ctx.fillStyle = '#999';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        const val = Math.round(maxValue - (maxValue * i) / 5);
        ctx.fillText(val.toString(), padding.left - 10, y + 4);
      }
      ctx.stroke();

      const barWidth = Math.min(60, chartWidth / data.length * 0.6);
      const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

      data.forEach((item, index) => {
        const x = padding.left + gap + index * (barWidth + gap);
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = item.color || '#0070f3';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.font = '12px sans-serif';
        const label = (item.label || '').length > 4 ? (item.label || '').slice(0, 3) + '..' : (item.label || '');
        ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 20);
      });
    }

  }, [data, width, height, type]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const padding = { top: 40, right: 40, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let found = false;

    if (type === 'line') {
      const gap = chartWidth / (data.length > 1 ? data.length - 1 : 1);
      const hitRadius = 15;

      data.forEach((item, index) => {
        const pointX = padding.left + (data.length > 1 ? index * gap : chartWidth / 2);
        const pointY = (height - padding.bottom) - (Math.min(Math.max(item.value, 0), 10) / 10) * chartHeight;

        if (Math.abs(x - pointX) < hitRadius && Math.abs(y - pointY) < hitRadius) {
          setHoverInfo({
            x: e.clientX,
            y: e.clientY - 60,
            text: `${item.date} · ${item.emotion}`,
            subtext: item.summary
          });
          found = true;
        }
      });
    } else {
      // Bar hit detection
      const barWidth = Math.min(60, chartWidth / data.length * 0.6);
      const gap = (chartWidth - barWidth * data.length) / (data.length + 1);
      
      data.forEach((item, index) => {
        const barX = padding.left + gap + index * (barWidth + gap);
        if (x >= barX && x <= barX + barWidth && y >= padding.top && y <= height - padding.bottom) {
          setHoverInfo({
            x: e.clientX,
            y: e.clientY - 40,
            text: `${item.label}: ${item.value}次`
          });
          found = true;
        }
      });
    }

    if (!found) setHoverInfo(null);
  };

  return (
    <div className={styles.container}>
      {title && <h3 style={{ textAlign: 'center', marginBottom: 20, color: '#444' }}>{title}</h3>}
      <canvas 
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px`, display: 'block', margin: '0 auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverInfo(null)}
      />
      {hoverInfo && (
        <div 
          className={styles.tooltip} 
          style={{ left: hoverInfo.x, top: hoverInfo.y, opacity: 1, position: 'fixed' }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{hoverInfo.text}</div>
          {hoverInfo.subtext && <div style={{ fontSize: '0.8rem', opacity: 0.9, maxWidth: 200 }}>{hoverInfo.subtext}</div>}
        </div>
      )}
    </div>
  );
};

export default TrendChart;
