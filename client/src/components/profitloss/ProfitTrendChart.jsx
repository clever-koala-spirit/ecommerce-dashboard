import React from 'react';
import { 
  ComposedChart, 
  Area, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ProfitTrendChart = ({ data, timeRange }) => {
  // Generate mock time series data based on timeRange
  const generateTimeSeriesData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const baseData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate realistic daily variations
      const revenueVariation = (Math.random() - 0.5) * 0.3 + 1;
      const dailyRevenue = (data.summary.totalRevenue / days) * revenueVariation;
      const dailyGrossProfit = dailyRevenue * 0.61; // 61% gross margin
      const dailyAdSpend = dailyRevenue * 0.20; // 20% ad spend
      const dailyCOGS = dailyRevenue * 0.39; // 39% COGS
      const dailyNetProfit = dailyGrossProfit - dailyAdSpend - (dailyRevenue * 0.1); // Other expenses
      
      baseData.push({
        date: date.getDate(),
        dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(dailyRevenue),
        grossProfit: Math.round(dailyGrossProfit),
        netProfit: Math.round(dailyNetProfit),
        adSpend: Math.round(dailyAdSpend),
        cogs: Math.round(dailyCOGS),
        profitMargin: ((dailyNetProfit / dailyRevenue) * 100)
      });
    }
    
    return baseData;
  };

  const chartData = generateTimeSeriesData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-xl p-4 border shadow-lg"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <p className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {payload[0]?.payload?.dateStr}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {entry.name}:
                </span>
              </div>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {entry.name === 'Profit Margin' 
                  ? `${entry.value.toFixed(1)}%`
                  : `$${entry.value.toLocaleString()}`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="rounded-2xl p-6 border"
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Profit Trend Analysis
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Revenue, costs, and profit margins over time
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {[
            { key: 'revenue', label: 'Revenue', color: 'var(--color-blue)' },
            { key: 'grossProfit', label: 'Gross Profit', color: 'var(--color-green)' },
            { key: 'netProfit', label: 'Net Profit', color: 'var(--color-purple)' },
            { key: 'profitMargin', label: 'Margin %', color: 'var(--color-orange)' }
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border)" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="dateStr"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            
            {/* Revenue Area */}
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="var(--color-blue)"
              fill="var(--color-blue)"
              fillOpacity={0.1}
              strokeWidth={2}
              name="Revenue"
            />
            
            {/* Gross Profit Area */}
            <Area
              type="monotone"
              dataKey="grossProfit"
              stackId="2"
              stroke="var(--color-green)"
              fill="var(--color-green)"
              fillOpacity={0.15}
              strokeWidth={2}
              name="Gross Profit"
            />
            
            {/* Net Profit Bars */}
            <Bar
              dataKey="netProfit"
              fill="var(--color-purple)"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
              name="Net Profit"
            />
            
            {/* Profit Margin Line */}
            <Line
              type="monotone"
              dataKey="profitMargin"
              stroke="var(--color-orange)"
              strokeWidth={3}
              dot={{ fill: 'var(--color-orange)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-orange)', strokeWidth: 2, fill: 'white' }}
              name="Profit Margin"
            />
            
            <Tooltip content={<CustomTooltip />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitTrendChart;