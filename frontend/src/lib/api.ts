import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const getCitySummary = async (city: string) => {
  const response = await axios.get(`${API_URL}/api/city/${city}/summary`);
  return response.data;
};

export const getCityTrends = async (city: string) => {
  const response = await axios.get(`${API_URL}/api/city/${city}/trends`);
  return response.data;
};

export const getCityAnomalies = async (city: string) => {
  const response = await axios.get(`${API_URL}/api/city/${city}/anomalies`);
  return response.data;
};

export const getCityHeatmap = async (city: string) => {
  const response = await axios.get(`${API_URL}/api/city/${city}/heatmap`);
  return response.data;
};

export const generateReport = async (city: string) => {
  const response = await axios.post(`${API_URL}/api/report/generate?city=${city}`, {}, {
    responseType: 'blob', // Important for PDF download
  });
  return response.data;
};