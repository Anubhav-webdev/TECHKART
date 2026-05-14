// API Configuration
// Ensures consistent backend URL across the application

const getBackendURL = () => {
  // Priority: Environment variable > Backend check > Fallback
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // For Vercel frontend, use the backend on Render
  if (typeof window !== 'undefined') {
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // Development: use proxy or localhost
      return 'http://localhost:7000/api';
    } else {
      // Production: use Render backend
      return 'https://techkart-ava8.onrender.com/api';
    }
  }

  return 'https://techkart-ava8.onrender.com/api';
};

export const API_BASE_URL = getBackendURL();

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('API Call:', url); // For debugging

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies if needed
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
