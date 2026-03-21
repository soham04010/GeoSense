// frontend/lib/api.ts
import axios from 'axios';

// Point this to your FastAPI server
const API_BASE_URL = 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchHeatmap = async (city: string) => {
  const response = await apiClient.get(`/city/${city}/heatmap`);
  return response.data;
};

export const fetchAnomalies = async (city: string) => {
  const response = await apiClient.get(`/city/${city}/anomalies`);
  return response.data;
};

export const downloadActionPlan = async (city: string) => {
  // We use responseType: 'blob' because we are downloading a PDF file, not JSON
  const response = await apiClient.post(`/report/generate/${city}`, {}, { responseType: 'blob' });
  return response.data;
};