import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const Badge = ({ status }) => {
  const colors = {
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Canceled: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status]}`}>
      {status}
    </span>
  );
};

const tableData = [
  {
    id: 1,
    name: "Premium Paint Kit - Landscape",
    variants: "2 Variants",
    category: "Paint Kits",
    price: "$149.71",
    status: "Delivered",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=50&h=50&fit=crop&crop=center"
  },
  {
    id: 2,
    name: "Beginner Brush Set",
    variants: "1 Variant",
    category: "Brushes",
    price: "$50.00",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=50&h=50&fit=crop&crop=center"
  },
  {
    id: 3,
    name: "Canvas Set - Large Format",
    variants: "2 Variants",
    category: "Canvas",
    price: "$138.65",
    status: "Delivered",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=50&h=50&fit=crop&crop=center"
  },
  {
    id: 4,
    name: "Acrylic Paint - Professional",
    variants: "2 Variants",
    category: "Paint",
    price: "$50.00",
    status: "Canceled",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=50&h=50&fit=crop&crop=center"
  },
  {
    id: 5,
    name: "Digital Paint Guide - Advanced",
    variants: "1 Variant",
    category: "Digital",
    price: "$35.00",
    status: "Delivered",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=50&h=50&fit=crop&crop=center"
  }
];

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors">
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-gray-100 dark:border-gray-700">
            <tr>
              <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Products
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Price
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {tableData.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md">
                      <img
                        src={product.image}
                        className="h-12 w-12 object-cover"
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm dark:text-white">
                        {product.name}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {product.variants}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {product.category}
                </td>
                <td className="py-3 text-gray-500 text-sm dark:text-gray-400 font-medium">
                  {product.price}
                </td>
                <td className="py-3">
                  <Badge status={product.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}