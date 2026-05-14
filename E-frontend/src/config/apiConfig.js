// API Configuration
// Ensures consistent backend URL across the application

const normalizeApiUrl = (url) => {
  if (!url) return url;
  let normalized = url.trim().replace(/\/+$/, "");
  if (!/\/api($|\/)/i.test(normalized)) {
    normalized += "/api";
  }
  return normalized;
};

const getBackendURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return normalizeApiUrl(envUrl);
  }

  if (typeof window !== 'undefined') {
    const isDevelopment = import.meta.env.DEV;
    return isDevelopment
      ? 'http://localhost:7000/api'
      : 'https://techkart-ava8.onrender.com/api';
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
