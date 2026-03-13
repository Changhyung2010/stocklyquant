"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { PricePoint } from "@/lib/types";

interface PriceChartProps {
  data: PricePoint[];
}

export function PriceChart({ data }: PriceChartProps) {
  if (!data.length) return null;

  const first = data[0].price;
  const isPositive = data[data.length - 1].price >= first;
  const color = isPositive ? "#10b981" : "#ef4444";

  // Show last 252 trading days max for clarity
  const display = data.slice(-252).filter((_, i, arr) => {
    // Thin out to max ~120 points for performance
    return arr.length <= 120 || i % Math.ceil(arr.length / 120) === 0 || i === arr.length - 1;
  });

  const min = Math.min(...display.map((d) => d.price));
  const max = Math.max(...display.map((d) => d.price));
  const pad = (max - min) * 0.05;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={display} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear().toString().slice(2)}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min - pad, max + pad]}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          width={56}
        />
        <Tooltip
          contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 6 }}
          labelStyle={{ color: "#9ca3af" }}
          itemStyle={{ color }}
          formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
          labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
