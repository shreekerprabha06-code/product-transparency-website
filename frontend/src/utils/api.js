import axios from 'axios';

const BACKEND_URL = 'https://product-transparency-website-backend.onrender.com';
const AI_URL = 'https://product-transparency-website.onrender.com';

// Product operations
export const createProduct = (productData) => {
  return axios.post(`${BACKEND_URL}/products`, productData);
};

export const getProduct = (productId) => {
  return axios.get(`${BACKEND_URL}/products/${productId}`);
};

export const getAllProducts = () => {
  return axios.get(`${BACKEND_URL}/products`);
};

// Question operations
export const saveAnswer = (answerData) => {
  return axios.post(`${BACKEND_URL}/questions`, answerData);
};

export const getQuestions = (productId) => {
  return axios.get(`${BACKEND_URL}/questions/${productId}`);
};

// AI service
export const getNextQuestion = (questionData) => {
  return axios.post(`${AI_URL}/generate-questions`, questionData);
};

// Scoring and reports
export const calculateScore = (productId) => {
  return axios.post(`${BACKEND_URL}/calculate-score`, { productId });
};

export const getScore = (productId) => {
  return axios.get(`${BACKEND_URL}/calculate-score/${productId}`);
};

export const generateReport = (productId) => {
  return axios.post(`${BACKEND_URL}/reports`, { productId });
};

export const getReport = (productId) => {
  return axios.get(`${BACKEND_URL}/reports/${productId}`);
};
