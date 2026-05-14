import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '../../utils/currency';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface Props {
  data: DataPoint[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
}

const DEFAULT_COLORS = [
  '#6366f1', '#22c55e', '#eab308', '#ef4444',
  '#06b6d4', '#f97316', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f43f5e',
];

export default function DonutChart({
  data,
  size = 200,
  innerRadius = 55,
  outerRadius = 80,
  centerLabel,
}: Props) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatINR(value), '']}
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-muted text-center">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
