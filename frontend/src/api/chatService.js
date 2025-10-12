import api from './axios';

// Chat API functions
export const chatService = {
  // Send message to AI assistant
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat', {
        message: message
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Comprehensive connection test
  testFullConnection: async () => {
    const results = {
      health: { status: 'untested', data: null, error: null },
      apiInfo: { status: 'untested', data: null, error: null },
      overall: { status: 'untested', message: '' }
    };

    // Test health endpoint
    try {
      const healthResponse = await api.get('/health');
      results.health.status = 'success';
      results.health.data = healthResponse.data;
    } catch (error) {
      results.health.status = 'failed';
      results.health.error = error.message;
    }

    // Test API info endpoint
    try {
      const infoResponse = await api.get('/');
      results.apiInfo.status = 'success';
      results.apiInfo.data = infoResponse.data;
    } catch (error) {
      results.apiInfo.status = 'failed';
      results.apiInfo.error = error.message;
    }

    // Determine overall status
    if (results.health.status === 'success' && results.apiInfo.status === 'success') {
      results.overall.status = 'success';
      results.overall.message = 'Backend is fully operational';
    } else if (results.health.status === 'success' || results.apiInfo.status === 'success') {
      results.overall.status = 'partial';
      results.overall.message = 'Backend is partially operational';
    } else {
      results.overall.status = 'failed';
      results.overall.message = 'Backend is not responding';
    }

    return results;
  },

  // Get API info
  getApiInfo: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default chatService;