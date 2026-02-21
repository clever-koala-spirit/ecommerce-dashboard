import React from 'react';
import {
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const Badge = ({ children, isPositive }) => (
  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
    isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
  }`}>
    {isPositive ? (
      <ArrowTrendingUpIcon className="h-3 w-3" />
    ) : (
      <ArrowTrendingDownIcon className="h-3 w-3" />
    )}
    {children}
  </div>
);

export default function EcommerceMetrics() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$125,430',
      change: '11.01%',
      isPositive: true,
      icon: CurrencyDollarIcon,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Orders',
      value: '5,359',
      change: '9.05%',
      isPositive: false,
      icon: ShoppingCartIcon,
      color: 'bg-orange-50 text-orange-600'
    },
    {
      title: 'Customers',
      value: '3,782',
      change: '15.23%',
      isPositive: true,
      icon: UserGroupIcon,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Profit',
      value: '$34,120',
      change: '8.7%',
      isPositive: true,
      icon: ChartBarIcon,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 md:p-6 hover:shadow-lg transition-shadow">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.color}`}>
            <metric.icon className="h-6 w-6" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white">
                {metric.value}
              </h4>
            </div>
            <Badge isPositive={metric.isPositive}>
              {metric.change}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}