export const createConnectionSlice = (set) => ({
  // State
  connections: {
    shopify: {
      connected: false,
      status: 'gray', // 'green', 'yellow', 'red', 'gray'
      lastSynced: null,
      config: {},
      error: null,
    },
    meta: {
      connected: false,
      status: 'gray',
      lastSynced: null,
      config: {},
      error: null,
    },
    google: {
      connected: false,
      status: 'gray',
      lastSynced: null,
      config: {},
      error: null,
    },
    klaviyo: {
      connected: false,
      status: 'gray',
      lastSynced: null,
      config: {},
      error: null,
    },
    ga4: {
      connected: false,
      status: 'gray',
      lastSynced: null,
      config: {},
      error: null,
    },
  },

  // Actions
  setConnectionStatus: (source, connected, status = 'green', error = null) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          connected,
          status,
          error,
          lastSynced: connected ? new Date() : state.connections[source].lastSynced,
        },
      },
    }));
  },

  setStatus: (source, status) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          status,
        },
      },
    }));
  },

  updateConfig: (source, config) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          config: {
            ...state.connections[source].config,
            ...config,
          },
        },
      },
    }));
  },

  setConfig: (source, config) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          config,
        },
      },
    }));
  },

  setError: (source, error) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          error,
          status: error ? 'red' : state.connections[source].status,
        },
      },
    }));
  },

  clearError: (source) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          error: null,
        },
      },
    }));
  },

  updateLastSynced: (source, timestamp = new Date()) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          lastSynced: timestamp,
        },
      },
    }));
  },

  connect: (source) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          connected: true,
          status: 'green',
          error: null,
          lastSynced: new Date(),
        },
      },
    }));
  },

  disconnect: (source) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [source]: {
          ...state.connections[source],
          connected: false,
          status: 'gray',
          config: {},
          error: null,
        },
      },
    }));
  },

  // Getters
  getConnection: (source) => {
    return (state) => state.connections[source] || null;
  },

  getConnectionStatus: (source) => {
    return (state) => state.connections[source]?.status || 'gray';
  },

  isConnected: (source) => {
    return (state) => state.connections[source]?.connected || false;
  },

  getConnectedSources: () => {
    return (state) =>
      Object.entries(state.connections)
        .filter(([_, conn]) => conn.connected)
        .map(([source, _]) => source);
  },

  hasErrors: () => {
    return (state) =>
      Object.values(state.connections).some((conn) => conn.error !== null);
  },

  getAllConnections: () => {
    return (state) => state.connections;
  },
});
