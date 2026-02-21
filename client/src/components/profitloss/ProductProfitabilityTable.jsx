import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ArrowTrendingUpIcon,
  TrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ProductProfitabilityTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('profit');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock product data
  const products = [
    {
      id: 1,
      name: 'Premium Paint Kit - Landscape',
      sku: 'PPK-LAND-001',
      category: 'Paint Kits',
      revenue: 15420,
      units: 103,
      avgPrice: 149.71,
      cogs: 4635,
      adSpend: 3084,
      fulfillment: 515,
      profit: 7186,
      profitMargin: 46.6,
      profitPerUnit: 69.77,
      trend: 12.5
    },
    {
      id: 2,
      name: 'Beginner Brush Set',
      sku: 'BBS-STARTER',
      category: 'Brushes',
      revenue: 8950,
      units: 179,
      avgPrice: 50.00,
      cogs: 1790,
      adSpend: 1788,
      fulfillment: 268,
      profit: 5104,
      profitMargin: 57.0,
      profitPerUnit: 28.51,
      trend: 8.3
    },
    {
      id: 3,
      name: 'Canvas Set - Large Format',
      sku: 'CS-LARGE-24',
      category: 'Canvas',
      revenue: 12340,
      units: 89,
      avgPrice: 138.65,
      cogs: 2468,
      adSpend: 2468,
      fulfillment: 356,
      profit: 7048,
      profitMargin: 57.1,
      profitPerUnit: 79.18,
      trend: -3.2
    },
    {
      id: 4,
      name: 'Acrylic Paint - Professional',
      sku: 'AP-PRO-SET',
      category: 'Paint',
      revenue: 6750,
      units: 135,
      avgPrice: 50.00,
      cogs: 1350,
      adSpend: 1350,
      fulfillment: 203,
      profit: 3847,
      profitMargin: 57.0,
      profitPerUnit: 28.50,
      trend: 15.8
    },
    {
      id: 5,
      name: 'Digital Paint Guide - Advanced',
      sku: 'DPG-ADV-001',
      category: 'Digital',
      revenue: 2940,
      units: 84,
      avgPrice: 35.00,
      cogs: 0,
      adSpend: 588,
      fulfillment: 0,
      profit: 2352,
      profitMargin: 80.0,
      profitPerUnit: 28.00,
      trend: 22.1
    },
    {
      id: 6,
      name: 'Paint Kit - Portrait Starter',
      sku: 'PPK-PORT-STARTER',
      category: 'Paint Kits',
      revenue: 4680,
      units: 52,
      avgPrice: 90.00,
      cogs: 1404,
      adSpend: 936,
      fulfillment: 156,
      profit: 2184,
      profitMargin: 46.7,
      profitPerUnit: 42.00,
      trend: -8.5
    }
  ];

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const formatChange = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }) => (
    <ArrowsUpDownIcon 
      className={`h-4 w-4 ml-1 ${sortBy === field ? 'opacity-100' : 'opacity-50'}`}
      style={{ color: 'var(--color-text-secondary)' }}
    />
  );

  return (
    <div 
      className="rounded-2xl border"
      style={{ 
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Product Profitability
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {filteredAndSortedProducts.length} products • Profit analysis by SKU
            </p>
          </div>
          
          <EyeIcon 
            className="h-6 w-6" 
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon 
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Search products or SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
              style={{ 
                background: 'var(--color-bg-input)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500"
            style={{ 
              background: 'var(--color-bg-input)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <AdjustmentsHorizontalIcon 
            className="h-5 w-5" 
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {[
                { key: 'name', label: 'Product' },
                { key: 'units', label: 'Units' },
                { key: 'revenue', label: 'Revenue' },
                { key: 'profit', label: 'Profit' },
                { key: 'profitMargin', label: 'Margin %' },
                { key: 'profitPerUnit', label: 'Profit/Unit' },
                { key: 'trend', label: 'Trend' }
              ].map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left cursor-pointer hover:bg-opacity-50 transition-colors"
                  onClick={() => handleSort(column.key)}
                  style={{ background: sortBy === column.key ? 'var(--color-bg-hover)' : 'transparent' }}
                >
                  <div className="flex items-center font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {column.label}
                    <SortIcon field={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.map((product, index) => (
              <tr 
                key={product.id}
                className="border-b hover:bg-opacity-50 transition-colors"
                style={{ 
                  borderBottom: index === filteredAndSortedProducts.length - 1 ? 'none' : '1px solid var(--color-border)',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {product.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {product.sku} • {product.category}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {product.units.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {formatCurrency(product.avgPrice)} avg
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold" style={{ color: 'var(--color-green)' }}>
                    {formatCurrency(product.profit)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatPercent(product.profitMargin)}
                    </span>
                    <div 
                      className="w-12 h-2 rounded-full"
                      style={{ background: 'var(--color-bg-secondary)' }}
                    >
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(product.profitMargin, 100)}%`,
                          background: product.profitMargin > 50 ? 'var(--color-green)' : 
                                    product.profitMargin > 30 ? 'var(--color-orange)' : 'var(--color-red)'
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {formatCurrency(product.profitPerUnit)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {product.trend >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span 
                      className="text-sm font-medium"
                      style={{ 
                        color: product.trend >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                      }}
                    >
                      {formatChange(product.trend)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div 
        className="px-6 py-4 border-t"
        style={{ 
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)'
        }}
      >
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Total Revenue:</span>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(filteredAndSortedProducts.reduce((sum, p) => sum + p.revenue, 0))}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Total Profit:</span>
            <p className="font-semibold" style={{ color: 'var(--color-green)' }}>
              {formatCurrency(filteredAndSortedProducts.reduce((sum, p) => sum + p.profit, 0))}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Avg Margin:</span>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {formatPercent(
                filteredAndSortedProducts.reduce((sum, p) => sum + p.profitMargin, 0) / 
                filteredAndSortedProducts.length
              )}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Top Performer:</span>
            <p className="font-semibold" style={{ color: 'var(--color-accent)' }}>
              {filteredAndSortedProducts.sort((a, b) => b.profit - a.profit)[0]?.name.substring(0, 20)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProfitabilityTable;