import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatINRCompact } from '../../utils/currency';

interface DataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

interface LineConfig {
  key: string;
  color?: string;
  label?: string;
}

interface Props {
  data: DataPoint[];
  lines?: LineConfig[];
  height?: number;
  valueKey?: string;
}

export default function LineChart({
  data,
  lines,
  height = 180,
  valueKey = 'value',
}: Props) {
  const resolvedLines: LineConfig[] = lines ?? [{ key: valueKey, color: '#6366f1' }];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatINRCompact}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatINRCompact(value), name]}
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
          }}
        />
        {resolvedLines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label ?? l.key}
            stroke={l.color ?? '#6366f1'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
