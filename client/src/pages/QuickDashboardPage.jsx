import React from 'react';
import { Helmet } from 'react-helmet-async';
import EcommerceMetrics from '../components/quick-ui/EcommerceMetrics';
import MonthlySalesChart from '../components/quick-ui/MonthlySalesChart';
import RecentOrders from '../components/quick-ui/RecentOrders';
import TripleWhaleStyle from '../components/quick-ui/TripleWhaleStyle';

const QuickDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Quick Dashboard - Slay Season</title>
        <meta name="description" content="Rapid-deployed ecommerce analytics dashboard with beautiful UI copied from proven templates" />
      </Helmet>
      
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Triple Whale Style Dashboard */}
        <TripleWhaleStyle />
        
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Store Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Additional metrics and detailed analysis
          </p>
        </div>

        {/* Layout matching TailAdmin structure */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Main Metrics and Sales Chart */}
          <div className="col-span-12 space-y-6 xl:col-span-8">
            {/* Key Metrics */}
            <EcommerceMetrics />

            {/* Monthly Sales Chart */}
            <MonthlySalesChart />
          </div>

          {/* Right Column - Additional Widgets */}
          <div className="col-span-12 xl:col-span-4">
            {/* Monthly Target Widget (Placeholder) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Monthly Target
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                  <span className="font-semibold text-gray-900 dark:text-white">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                  <span className="font-semibold text-gray-900 dark:text-white">73%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Customers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Recent Orders */}
          <div className="col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickDashboardPage;