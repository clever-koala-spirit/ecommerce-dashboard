export const createCostSlice = (set) => ({
  // State
  fixedCosts: [
    {
      id: 'cost-1',
      label: 'Shopify Subscription',
      monthlyAmount: 299,
      category: 'platform',
      isActive: true,
    },
    {
      id: 'cost-2',
      label: 'Klaviyo Subscription',
      monthlyAmount: 150,
      category: 'email',
      isActive: true,
    },
    {
      id: 'cost-3',
      label: 'Google Workspace',
      monthlyAmount: 60,
      category: 'tools',
      isActive: true,
    },
    {
      id: 'cost-4',
      label: 'Slack Workspace',
      monthlyAmount: 30,
      category: 'tools',
      isActive: true,
    },
    {
      id: 'cost-5',
      label: 'Fulfillment Services',
      monthlyAmount: 500,
      category: 'operations',
      isActive: true,
    },
  ],

  // Actions
  addCost: (label, monthlyAmount, category = 'other', isActive = true) => {
    set((state) => ({
      fixedCosts: [
        ...state.fixedCosts,
        {
          id: `cost-${Date.now()}`,
          label,
          monthlyAmount,
          category,
          isActive,
        },
      ],
    }));
  },

  updateCost: (costId, updates) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.map((cost) =>
        cost.id === costId ? { ...cost, ...updates } : cost
      ),
    }));
  },

  removeCost: (costId) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.filter((cost) => cost.id !== costId),
    }));
  },

  toggleCost: (costId) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.map((cost) =>
        cost.id === costId ? { ...cost, isActive: !cost.isActive } : cost
      ),
    }));
  },

  setIsActive: (costId, isActive) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.map((cost) =>
        cost.id === costId ? { ...cost, isActive } : cost
      ),
    }));
  },

  updateMonthlyAmount: (costId, monthlyAmount) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.map((cost) =>
        cost.id === costId ? { ...cost, monthlyAmount } : cost
      ),
    }));
  },

  bulkUpdateCosts: (costs) => {
    set({
      fixedCosts: costs,
    });
  },

  // Getters
  getTotalMonthlyCosts: () => {
    return (state) =>
      state.fixedCosts
        .filter((cost) => cost.isActive)
        .reduce((sum, cost) => sum + cost.monthlyAmount, 0);
  },

  getTotalCosts: () => {
    return (state) =>
      state.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmount, 0);
  },

  getCostsByCategory: () => {
    return (state) => {
      const categories = {};
      state.fixedCosts.forEach((cost) => {
        if (!categories[cost.category]) {
          categories[cost.category] = { label: cost.category, amount: 0, count: 0 };
        }
        categories[cost.category].amount += cost.isActive ? cost.monthlyAmount : 0;
        categories[cost.category].count += 1;
      });
      return categories;
    };
  },

  getCost: (costId) => {
    return (state) => state.fixedCosts.find((c) => c.id === costId);
  },

  getAllCosts: () => {
    return (state) => state.fixedCosts;
  },

  getActiveCosts: () => {
    return (state) => state.fixedCosts.filter((cost) => cost.isActive);
  },

  getInactiveCosts: () => {
    return (state) => state.fixedCosts.filter((cost) => !cost.isActive);
  },
});
