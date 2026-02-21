import React from 'react';
import { 
  ShoppingBagIcon,
  TruckIcon,
  MegaphoneIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ExpenseBreakdown = ({ expenses, detailed = false }) => {
  const expenseData = [
    {
      category: 'Cost of Goods Sold',
      amount: expenses.cogs,
      icon: ShoppingBagIcon,
      color: '#ef4444',
      percentage: (expenses.cogs / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    },
    {
      category: 'Advertising',
      amount: expenses.advertising,
      icon: MegaphoneIcon,
      color: '#f97316',
      percentage: (expenses.advertising / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    },
    {
      category: 'Fulfillment',
      amount: expenses.fulfillment,
      icon: TruckIcon,
      color: '#eab308',
      percentage: (expenses.fulfillment / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    },
    {
      category: 'Shipping',
      amount: expenses.shipping,
      icon: TruckIcon,
      color: '#22c55e',
      percentage: (expenses.shipping / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    },
    {
      category: 'Processing Fees',
      amount: expenses.processing,
      icon: CreditCardIcon,
      color: '#3b82f6',
      percentage: (expenses.processing / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    },
    {
      category: 'Other Expenses',
      amount: expenses.other,
      icon: EllipsisHorizontalIcon,
      color: '#8b5cf6',
      percentage: (expenses.other / Object.values(expenses).reduce((a, b) => a + b, 0)) * 100
    }
  ].sort((a, b) => b.amount - a.amount);

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="rounded-xl p-3 border shadow-lg"
          style={{ 
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {data.category}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div style={{ color: 'var(--color-text-secondary)' }}>
              Amount: <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(data.amount)}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-secondary)' }}>
              Percentage: <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
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
            Expense Breakdown
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Total expenses: {formatCurrency(totalExpenses)}
          </p>
        </div>
        
        <BuildingOfficeIcon 
          className="h-6 w-6" 
          style={{ color: 'var(--color-text-secondary)' }}
        />
      </div>

      {!detailed && (
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={30}
                paddingAngle={2}
                dataKey="amount"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-4">
        {expenseData.map((expense, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 rounded-xl transition-colors"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="p-2 rounded-lg"
                style={{ background: expense.color + '20' }}
              >
                <expense.icon 
                  className="h-5 w-5" 
                  style={{ color: expense.color }}
                />
              </div>
              
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {expense.category}
                </h3>
                {detailed && (
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {expense.percentage.toFixed(1)}% of total expenses
                  </p>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(expense.amount)}
              </p>
              {!detailed && (
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {expense.percentage.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailed && (
        <div 
          className="mt-6 p-4 rounded-xl border-t"
          style={{ 
            background: 'var(--color-bg-secondary)',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Largest Expense:
              </span>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {expenseData[0].category}
              </p>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                % of Revenue:
              </span>
              <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {((totalExpenses / 142580) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseBreakdown;