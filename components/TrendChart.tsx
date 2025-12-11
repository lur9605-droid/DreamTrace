'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './TrendChart.module.css';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface TrendChartProps {
  data: ChartData[];
  title?: string;
  width?: number;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  title, 
  width = 600, 
  height = 300 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('暂无数据', width / 2, height / 2);
      return;
    }

    // Chart dimensions
    const padding = { top: 40, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value), 5); // Minimum 5 for scale

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#eaeaea';
    ctx.lineWidth = 1;
    
    // Y Axis lines (5 steps)
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

    // Bar properties
    const barWidth = Math.min(60, chartWidth / data.length * 0.6);
    const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

    // Draw bars
    data.forEach((item, index) => {
      const x = padding.left + gap + index * (barWidth + gap);
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = item.color || '#0070f3';
      
      // Rounded top corners logic (simplified)
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Draw label
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.font = '12px sans-serif';
      // Truncate label if too long
      const label = item.label.length > 4 ? item.label.slice(0, 3) + '..' : item.label;
      ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 20);
    });

  }, [data, width, height]);

  // Handle mouse hover for tooltip (simplified hit detection)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 40, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const barWidth = Math.min(60, chartWidth / data.length * 0.6);
    const gap = (chartWidth - barWidth * data.length) / (data.length + 1);

    let found = false;

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
          {hoverInfo.text}
        </div>
      )}
    </div>
  );
};

export default TrendChart;
