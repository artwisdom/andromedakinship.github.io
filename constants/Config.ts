// SellCraft Configuration

export const Config = {
  // Backend API URL - Your Vercel deployment
  API_URL: 'https://sellcraft-api.vercel.app',
  
  // AI features enabled
  AI_ENABLED: true,
  
  // App version
  VERSION: '1.0.0',
  
  // Support email
  SUPPORT_EMAIL: 'support@andromedakinship.com',
};

// Helper to check if AI is properly configured
export const isAIConfigured = () => {
  return Config.AI_ENABLED && 
         !Config.API_URL.includes('YOUR-') &&
         Config.API_URL.length > 0;
};
