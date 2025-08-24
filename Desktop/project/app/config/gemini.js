// config/gemini.js
export const GEMINI_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCCTaVAN7ZY30tasHeaTSyuQU8QGi3xr5Q',
  MODEL: 'gemini-1.5-flash',
};

// For production, use environment variables
// Add to your .env file:
// EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here