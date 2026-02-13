import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

export default function CustomWidgetRow() {
  const customWidgets = useStore((state) => state.customWidgets || []);
  const removeCustomWidget = useStore((state) => state.removeCustomWidget);

  if (!customWidgets || customWidgets.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Custom Widgets
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {customWidgets.map((widget) => (
          <CustomWidget
            key={widget.id}
            widget={widget}
            onRemove={() => removeCustomWidget(widget.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CustomWidget({ widget, onRemove }) {
  return (
    <div
      className="glass-card p-4 relative"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-semibold text-sm"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {widget.title}
        </h3>
        <button
          onClick={onRemove}
          className="p-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-secondary)' }}
          title="Remove widget"
        >
          <X size={16} />
        </button>
      </div>

      {/* Chart */}
      <div className="h-64">
        {widget.type === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="var(--color-text-secondary)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Legend />
              {widget.dataKeys?.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'bar' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="var(--color-text-secondary)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Legend />
              {widget.dataKeys?.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'area' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={widget.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="var(--color-text-secondary)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Legend />
              {widget.dataKeys?.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                  stroke={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {widget.type === 'pie' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={widget.data}
                dataKey={widget.dataKey || 'value'}
                nameKey={widget.nameKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {widget.data?.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer */}
      {widget.description && (
        <p
          className="text-xs mt-3"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {widget.description}
        </p>
      )}
    </div>
  );
}
