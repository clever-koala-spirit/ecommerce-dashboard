import { useMemo } from 'react';
import { MoreHorizontal, Star, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, filterDataByDateRange } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function BestSellingProducts() {
  const dateRange = useStore((s) => s.dateRange);
  const shopifyData = useStore((s) => s.shopifyData);

  const topProducts = useMemo(() => {
    const filtered = filterDataByDateRange(shopifyData || [], dateRange);

    // Aggregate product data from daily shopify data
    // shopifyData items may contain topProducts array or lineItems
    const productMap = new Map();

    filtered.forEach((day) => {
      // Check if day data has product-level info
      if (day.topProducts && Array.isArray(day.topProducts)) {
        day.topProducts.forEach((p) => {
          const key = p.title || p.name || p.id;
          if (!key) return;
          const existing = productMap.get(key) || { name: key, sold: 0, revenue: 0, image: p.image || null };
          existing.sold += p.quantity || p.sold || 0;
          existing.revenue += p.revenue || p.totalPrice || 0;
          productMap.set(key, existing);
        });
      }
      if (day.lineItems && Array.isArray(day.lineItems)) {
        day.lineItems.forEach((item) => {
          const key = item.title || item.name || item.product_id;
          if (!key) return;
          const existing = productMap.get(key) || { name: key, sold: 0, revenue: 0, image: item.image || null };
          existing.sold += item.quantity || 1;
          existing.revenue += item.price * (item.quantity || 1) || 0;
          productMap.set(key, existing);
        });
      }
    });

    // If no product-level data, create a summary from daily totals
    if (productMap.size === 0 && filtered.length > 0) {
      const totalRevenue = filtered.reduce((s, d) => s + (d.grossRevenue || d.revenue || 0), 0);
      const totalOrders = filtered.reduce((s, d) => s + (d.orders || 0), 0);
      if (totalOrders > 0) {
        productMap.set('All Products', {
          name: 'All Products (summary)',
          sold: totalOrders,
          revenue: totalRevenue,
          image: null,
        });
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p, i) => ({ ...p, id: `#${String(i + 1).padStart(3, '0')}` }));
  }, [dateRange, shopifyData]);

  if (topProducts.length === 0) {
    return (
      <div className="rounded-2xl p-6" style={{ background: '#151923', border: '1px solid #1e2433' }}>
        <h3 className="text-white font-semibold mb-4">Best Selling Products</h3>
        <EmptyState icon="money" title="No product data" message="No product sales data for this period." />
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: '#151923', border: '1px solid #1e2433' }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">Best Selling Products</h3>
        <button className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: '#6366f1' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#818cf8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6366f1'; }}
        >
          See All <ArrowRight size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] font-semibold tracking-wider" style={{ color: '#6b7280' }}>
              <th className="pb-3 pr-4">ID</th>
              <th className="pb-3 pr-4">PRODUCT</th>
              <th className="pb-3 pr-4 text-right">SOLD</th>
              <th className="pb-3 pr-4 text-right">REVENUE</th>
              <th className="pb-3 text-right">RATING</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, idx) => (
              <tr
                key={product.id}
                className="transition-colors"
                style={{
                  borderTop: idx > 0 ? '1px solid #1e2433' : 'none',
                  background: idx % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
              >
                <td className="py-3 pr-4">
                  <span className="text-xs font-mono" style={{ color: '#6b7280' }}>{product.id}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: '#6366f120', color: '#6366f1' }}>
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white truncate max-w-[200px]">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm font-medium text-white">{product.sold.toLocaleString()}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-sm font-medium text-white">{formatCurrency(product.revenue)}</span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star size={12} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                    <span className="text-sm" style={{ color: '#9ca3af' }}>—</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
