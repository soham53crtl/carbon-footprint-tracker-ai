'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

interface BreakdownData {
  name: string;
  value: number;
  color: string;
}

interface ComparisonData {
  name: string;
  emissions: number;
  fill?: string;
}

interface ForecastData {
  monthName: string;
  projectedEmissions: number;
  savingsAcquired: number;
}

// 1. Emissions Category Breakdown (Donut Chart)
export function EmissionsBreakdownChart({ data }: { data: { energy: number; transport: number; food: number; shopping: number } }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-500">Loading charts...</div>;
  }

  const chartData: BreakdownData[] = [
    { name: 'Utilities & Energy', value: data.energy, color: '#3b82f6' }, // Blue
    { name: 'Transportation', value: data.transport, color: '#f59e0b' }, // Amber
    { name: 'Diet & Waste', value: data.food, color: '#10b981' }, // Emerald
    { name: 'Shopping & Retail', value: data.shopping, color: '#8b5cf6' }, // Violet
  ].filter(item => item.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'Inter',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} t CO₂e`, 'Emissions']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Emissions Benchmark Comparison (Bar Chart)
export function EmissionsComparisonChart({ userValue }: { userValue: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-500">Loading charts...</div>;
  }

  const chartData: ComparisonData[] = [
    { name: 'Paris Target', emissions: 2.0, fill: '#3b82f6' },
    { name: 'Global Avg', emissions: 4.8 },
    { name: 'UK/EU Avg', emissions: 6.5 },
    { name: 'Your Footprint', emissions: userValue, fill: '#10b981' },
    { name: 'US Avg', emissions: 14.5 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 't CO₂e/yr', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'Inter',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} t CO₂e`, 'Value']}
          />
          <Bar
            dataKey="emissions"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || 'rgba(148, 163, 184, 0.35)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. AI Emissions Forecasting (Area Chart)
export function EmissionsForecastChart({ data }: { data: ForecastData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-500">Loading charts...</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
          <XAxis
            dataKey="monthName"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'Inter',
            }}
            formatter={(value: number) => [`${value.toFixed(1)} t CO₂e`, 'Annualized Rate']}
          />
          <Area
            type="monotone"
            dataKey="projectedEmissions"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorProjected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Unified wrapper used by the dashboard ────────────────────────────────────
interface GenericLineData {
  month: string;
  emissions: number;
}
interface GenericPieData {
  name: string;
  value: number;
  color: string;
}

type EmissionsChartProps =
  | { type: 'line'; data: GenericLineData[] }
  | { type: 'pie'; data: GenericPieData[] }
  | { type: 'bar'; data: ComparisonData[] };

export function EmissionsChart(props: EmissionsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-xs animate-pulse-soft">Loading chart…</div>;
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: '10px',
    border: 'none',
    color: '#f1f5f9',
    fontSize: '12px',
    fontFamily: 'Inter',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  };

  if (props.type === 'line') {
    return (
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={props.data} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.07} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="T" />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} T CO₂e`, 'Emissions']} />
            <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={2.5} fill="url(#lineGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (props.type === 'pie') {
    const filtered = props.data.filter((d) => d.value > 0);
    return (
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value">
              {filtered.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(2)} T`, 'CO₂e']} />
            <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // bar
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={props.data} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.07} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} T CO₂e`, 'Value']} />
          <Bar dataKey="emissions" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {(props.data as ComparisonData[]).map((entry, i) => (
              <Cell key={i} fill={entry.fill || 'rgba(148,163,184,0.35)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
