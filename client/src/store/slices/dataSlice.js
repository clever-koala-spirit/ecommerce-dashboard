export const createDataSlice = (set) => ({
  // State
  shopifyData: [],
  metaData: [],
  googleData: [],
  klaviyoData: [],
  ga4Data: [],

  // Loading states per source
  isLoading: {
    shopify: false,
    meta: false,
    google: false,
    klaviyo: false,
    ga4: false,
  },

  // Last synced timestamps per source
  lastSynced: {
    shopify: null,
    meta: null,
    google: null,
    klaviyo: null,
    ga4: null,
  },

  // Errors per source
  errors: {
    shopify: null,
    meta: null,
    google: null,
    klaviyo: null,
    ga4: null,
  },

  // Actions
  setSourceData: (source, data) => {
    set((state) => ({
      ...state,
      [`${source}Data`]: data,
      lastSynced: {
        ...state.lastSynced,
        [source]: new Date(),
      },
      errors: {
        ...state.errors,
        [source]: null,
      },
      isLoading: {
        ...state.isLoading,
        [source]: false,
      },
    }));
  },

  setLoading: (source, isLoading) => {
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [source]: isLoading,
      },
    }));
  },

  setError: (source, error) => {
    set((state) => ({
      errors: {
        ...state.errors,
        [source]: error,
      },
      isLoading: {
        ...state.isLoading,
        [source]: false,
      },
    }));
  },

  setSynced: (source, timestamp = new Date()) => {
    set((state) => ({
      lastSynced: {
        ...state.lastSynced,
        [source]: timestamp,
      },
    }));
  },

  // Batch operations
  setAllData: (dataMap) => {
    set((state) => {
      const newState = { ...state };
      Object.entries(dataMap).forEach(([source, data]) => {
        newState[`${source}Data`] = data;
        newState.lastSynced[source] = new Date();
        newState.errors[source] = null;
        newState.isLoading[source] = false;
      });
      return newState;
    });
  },

  clearData: (source) => {
    set((state) => ({
      [`${source}Data`]: [],
      errors: {
        ...state.errors,
        [source]: null,
      },
    }));
  },

  clearAllData: () => {
    set({
      shopifyData: [],
      metaData: [],
      googleData: [],
      klaviyoData: [],
      ga4Data: [],
      errors: {
        shopify: null,
        meta: null,
        google: null,
        klaviyo: null,
        ga4: null,
      },
    });
  },

  // Getters
  getAllData: () => {
    return (state) => ({
      shopify: state.shopifyData,
      meta: state.metaData,
      google: state.googleData,
      klaviyo: state.klaviyoData,
      ga4: state.ga4Data,
    });
  },

  getSourceData: (source) => {
    return (state) => state[`${source}Data`];
  },

  getLoadingStatus: () => {
    return (state) => ({
      isLoading: state.isLoading,
      lastSynced: state.lastSynced,
      errors: state.errors,
    });
  },

  hasErrors: () => {
    return (state) => Object.values(state.errors).some((e) => e !== null);
  },

  isSyncingAny: () => {
    return (state) => Object.values(state.isLoading).some((loading) => loading);
  },
});
