export const createInsightSlice = (set) => ({
  // State
  insights: [
    {
      id: 'insight-1',
      severity: 'warning', // 'success', 'error', 'warning', 'info'
      title: 'Placeholder Insight',
      body: 'This is a placeholder insight. Insights will be populated from mock data.',
      action: 'Learn More',
      actionUrl: '#',
      timestamp: new Date(),
      dismissed: false,
      snoozed: false,
      snoozedUntil: null,
      bookmarked: false,
    },
  ],

  // Actions
  addInsight: (severity, title, body, action = 'Learn More', actionUrl = '#') => {
    set((state) => ({
      insights: [
        {
          id: `insight-${Date.now()}`,
          severity,
          title,
          body,
          action,
          actionUrl,
          timestamp: new Date(),
          dismissed: false,
          snoozed: false,
          snoozedUntil: null,
          bookmarked: false,
        },
        ...state.insights,
      ],
    }));
  },

  addInsights: (newInsights) => {
    set((state) => ({
      insights: [...newInsights, ...state.insights],
    }));
  },

  dismissInsight: (insightId) => {
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId ? { ...insight, dismissed: true } : insight
      ),
    }));
  },

  undismissInsight: (insightId) => {
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId ? { ...insight, dismissed: false } : insight
      ),
    }));
  },

  snoozeInsight: (insightId, hours = 24) => {
    const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId
          ? { ...insight, snoozed: true, snoozedUntil }
          : insight
      ),
    }));
  },

  unsnoozeInsight: (insightId) => {
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId
          ? { ...insight, snoozed: false, snoozedUntil: null }
          : insight
      ),
    }));
  },

  bookmarkInsight: (insightId) => {
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId
          ? { ...insight, bookmarked: !insight.bookmarked }
          : insight
      ),
    }));
  },

  setBookmarked: (insightId, bookmarked) => {
    set((state) => ({
      insights: state.insights.map((insight) =>
        insight.id === insightId ? { ...insight, bookmarked } : insight
      ),
    }));
  },

  deleteInsight: (insightId) => {
    set((state) => ({
      insights: state.insights.filter((insight) => insight.id !== insightId),
    }));
  },

  clearDismissed: () => {
    set((state) => ({
      insights: state.insights.filter((insight) => !insight.dismissed),
    }));
  },

  clearSnoozed: () => {
    set((state) => ({
      insights: state.insights.map((insight) => ({
        ...insight,
        snoozed: false,
        snoozedUntil: null,
      })),
    }));
  },

  clearAll: () => {
    set({
      insights: [],
    });
  },

  // Getters
  getInsights: () => {
    return (state) =>
      state.insights.filter((i) => !i.dismissed && !i.snoozed);
  },

  getDismissedInsights: () => {
    return (state) => state.insights.filter((i) => i.dismissed);
  },

  getSnoozedInsights: () => {
    return (state) => state.insights.filter((i) => i.snoozed);
  },

  getBookmarkedInsights: () => {
    return (state) => state.insights.filter((i) => i.bookmarked);
  },

  getInsightsBySeverity: (severity) => {
    return (state) =>
      state.insights
        .filter((i) => i.severity === severity && !i.dismissed && !i.snoozed)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
  },

  getUnreadCount: () => {
    return (state) =>
      state.insights.filter((i) => !i.dismissed && !i.snoozed).length;
  },

  getErrorCount: () => {
    return (state) =>
      state.insights.filter(
        (i) => i.severity === 'error' && !i.dismissed && !i.snoozed
      ).length;
  },

  getWarningCount: () => {
    return (state) =>
      state.insights.filter(
        (i) => i.severity === 'warning' && !i.dismissed && !i.snoozed
      ).length;
  },

  getInsight: (insightId) => {
    return (state) => state.insights.find((i) => i.id === insightId);
  },

  getAllInsights: () => {
    return (state) => state.insights;
  },

  getRecentInsights: (limit = 10) => {
    return (state) =>
      state.insights
        .filter((i) => !i.dismissed)
        .slice(0, limit)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
  },
});
