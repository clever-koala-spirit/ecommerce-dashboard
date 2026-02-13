import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus, Trash2, Edit3, Check, X, DollarSign,
  ShoppingBag, Megaphone, Settings, Package
} from 'lucide-react';

const CATEGORIES = [
  { value: 'platform', label: 'Platform', icon: ShoppingBag, color: '#3b82f6' },
  { value: 'marketing', label: 'Marketing', icon: Megaphone, color: '#f97316' },
  { value: 'operations', label: 'Operations', icon: Settings, color: '#8b5cf6' },
  { value: 'other', label: 'Other', icon: Package, color: '#6b7280' },
];

function getCategoryMeta(cat) {
  return CATEGORIES.find(c => c.value === cat) || CATEGORIES[3];
}

export default function CostManager() {
  const fixedCosts = useStore(s => s.fixedCosts);
  const addCost = useStore(s => s.addCost);
  const updateCost = useStore(s => s.updateCost);
  const removeCost = useStore(s => s.removeCost);
  const toggleCost = useStore(s => s.toggleCost);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: '', monthlyAmount: '', category: 'platform' });

  const handleAdd = () => {
    if (!form.label.trim() || !form.monthlyAmount) return;
    addCost(
      form.label.trim(),
      parseFloat(form.monthlyAmount),
      form.category,
      true
    );
    setForm({ label: '', monthlyAmount: '', category: 'platform' });
    setAdding(false);
  };

  const handleUpdate = (id) => {
    if (!form.label.trim() || !form.monthlyAmount) return;
    updateCost(id, {
      label: form.label.trim(),
      monthlyAmount: parseFloat(form.monthlyAmount),
      category: form.category,
    });
    setEditingId(null);
    setForm({ label: '', monthlyAmount: '', category: 'platform' });
  };

  const startEdit = (cost) => {
    setEditingId(cost.id);
    setForm({ label: cost.label, monthlyAmount: cost.monthlyAmount.toString(), category: cost.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ label: '', monthlyAmount: '', category: 'platform' });
  };

  const totalMonthly = fixedCosts
    .filter(c => c.isActive)
    .reduce((sum, c) => sum + c.monthlyAmount, 0);

  const totalByCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: fixedCosts
      .filter(c => c.isActive && c.category === cat.value)
      .reduce((sum, c) => sum + c.monthlyAmount, 0),
    count: fixedCosts.filter(c => c.category === cat.value).length,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {totalByCategory.map(cat => (
          <div
            key={cat.value}
            className="glass-card p-3 flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: cat.color + '20' }}
            >
              <cat.icon size={18} style={{ color: cat.color }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {cat.label} ({cat.count})
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {formatCurrency(cat.total)}/mo
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div
        className="glass-card p-4 flex items-center justify-between"
        style={{ borderColor: 'var(--color-accent)' }}
      >
        <div className="flex items-center gap-3">
          <DollarSign size={20} style={{ color: 'var(--color-accent)' }} />
          <div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Total Monthly Fixed Costs
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {formatCurrency(totalMonthly)}/mo
            </div>
          </div>
        </div>
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {formatCurrency(totalMonthly * 12)}/yr
        </div>
      </div>

      {/* Cost List */}
      <div className="glass-card overflow-hidden">
        <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Fixed Costs ({fixedCosts.length})
          </h3>
          <button
            onClick={() => { setAdding(true); cancelEdit(); }}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Plus size={14} /> Add Cost
          </button>
        </div>

        {/* Add form */}
        {adding && (
          <div className="p-3 flex flex-wrap gap-2 items-end" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Label</label>
              <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g., Shopify Plus"
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="w-28">
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Monthly $</label>
              <input
                type="number"
                value={form.monthlyAmount}
                onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-sm"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button onClick={handleAdd} className="p-1.5 rounded-lg hover:bg-green-900/30" style={{ color: 'var(--color-green)' }}>
                <Check size={18} />
              </button>
              <button onClick={() => { setAdding(false); cancelEdit(); }} className="p-1.5 rounded-lg hover:bg-red-900/30" style={{ color: 'var(--color-red)' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {fixedCosts.length === 0 && !adding ? (
          <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <DollarSign size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No fixed costs added yet.</p>
            <p className="text-xs mt-1">Add your recurring costs (subscriptions, agency fees, etc.) to see accurate profit calculations.</p>
          </div>
        ) : (
          <div>
            {fixedCosts.map(cost => {
              const cat = getCategoryMeta(cost.category);
              const isEditing = editingId === cost.id;

              if (isEditing) {
                return (
                  <div key={cost.id} className="p-3 flex flex-wrap gap-2 items-end" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={form.label}
                        onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm"
                        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <div className="w-28">
                      <input
                        type="number"
                        value={form.monthlyAmount}
                        onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm"
                        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-sm"
                        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleUpdate(cost.id)} className="p-1.5 rounded-lg hover:bg-green-900/30" style={{ color: 'var(--color-green)' }}>
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-red-900/30" style={{ color: 'var(--color-red)' }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cost.id}
                  className="p-3 flex items-center justify-between group"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    opacity: cost.isActive ? 1 : 0.45,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCost(cost.id)}
                      className="w-4 h-4 rounded border flex items-center justify-center"
                      style={{
                        borderColor: cost.isActive ? 'var(--color-accent)' : 'var(--color-border)',
                        background: cost.isActive ? 'var(--color-accent)' : 'transparent',
                      }}
                    >
                      {cost.isActive && <Check size={10} color="white" />}
                    </button>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {cost.label}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {cat.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {formatCurrency(cost.monthlyAmount)}/mo
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cost)}
                        className="p-1 rounded hover:bg-blue-900/30"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => removeCost(cost.id)}
                        className="p-1 rounded hover:bg-red-900/30"
                        style={{ color: 'var(--color-red)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
