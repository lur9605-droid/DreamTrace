'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

interface ChartData {
  label?: string;
  date?: string;
  value: number;
  color?: string;
  emotion?: string;
  summary?: string;
}

interface TrendChartProps {
  data: ChartData[];
  title?: string;
  width?: number;
  height?: number;
  type?: 'bar' | 'line';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: data.color || '#8884d8'
          }}></span>
          <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{data.date || label}</span>
          <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold' }}>{data.emotion}</span>
        </div>
        {data.summary && (
          <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', maxWidth: '200px' }}>
            {data.summary}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  height = 300 
}) => {
  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={{ stroke: '#cbd5e1' }} 
            tickLine={{ stroke: '#cbd5e1' }}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            dy={10}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis 
            domain={[0, 10]} 
            ticks={[0, 2, 4, 6, 8, 10]}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={{ stroke: '#cbd5e1' }}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#cbd5e1"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              return (
                <circle key={payload.date} cx={cx} cy={cy} r={5} fill={payload.color || '#8884d8'} stroke="#fff" strokeWidth={2} />
              );
            }}
            activeDot={(props: any) => {
               const { cx, cy, payload } = props;
               return (
                 <circle cx={cx} cy={cy} r={7} fill={payload.color || '#8884d8'} stroke="#fff" strokeWidth={3} />
               );
            }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
