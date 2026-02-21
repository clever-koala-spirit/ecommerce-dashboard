import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

const data = [
  { name: 'Jan', sales: 168 },
  { name: 'Feb', sales: 385 },
  { name: 'Mar', sales: 201 },
  { name: 'Apr', sales: 298 },
  { name: 'May', sales: 187 },
  { name: 'Jun', sales: 195 },
  { name: 'Jul', sales: 291 },
  { name: 'Aug', sales: 110 },
  { name: 'Sep', sales: 215 },
  { name: 'Oct', sales: 390 },
  { name: 'Nov', sales: 280 },
  { name: 'Dec', sales: 112 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{`${label} : ${payload[0].value}k`}</p>
      </div>
    );
  }
  return null;
};

export default function MonthlySalesChart() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Monthly Sales
        </h3>
        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <EllipsisHorizontalIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
        </button>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(229 231 235)" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(107 114 128)', fontSize: 12 }}
              tickFormatter={(value) => `${value}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="sales" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}