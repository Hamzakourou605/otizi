// src/services/api.js
import axios from 'axios';
import { Platform } from 'react-native';

// URL de production sur Render (permet de tester partout : 4G, WiFi, etc.)
const PRODUCTION_URL = 'https://otizi.onrender.com';
const PC_IP = '192.168.11.104'; // IP locale pour test WiFi uniquement

const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  // Utiliser PRODUCTION_URL pour que l'APK fonctionne partout (4G, Wi-Fi externes, etc.)
  return PRODUCTION_URL; 
};

const BASE_URL = getBaseURL();

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

import * as SecureStore from 'expo-secure-store';

// Helper cross-platform pour le stockage du token
export const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  },
};

// Intercepteur : injecte le token JWT automatiquement
API.interceptors.request.use(async (config) => {
  try {
    const token = await storage.getItem('otizi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
  return config;
});

// Intercepteur : gère les erreurs 401 (token expiré)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItem('otizi_token');
      await storage.deleteItem('otizi_user');
    }
    return Promise.reject(error);
  }
);
    
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const downloadGlobalPDF = async () => {
  try {
    const filename = 'rapport_global_otizi.pdf';

    if (Platform.OS === 'web') {
      const response = await API.get('/export/admin/all', { responseType: 'blob' });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const fileUri = FileSystem.documentDirectory + filename;
    const token = await storage.getItem('otizi_token');
    
    const downloadRes = await FileSystem.downloadAsync(
      BASE_URL + '/export/admin/all',
      fileUri,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (downloadRes.status !== 200) {
        alert(`Erreur Serveur (${downloadRes.status})`);
        return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert("Le partage n'est pas disponible");
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Erreur technique: ' + error.message);
  }
};

export const downloadClientPDF = async (clientId, mois = null) => {
  try {
    const filename = `rapport_${clientId}_${mois || 'complet'}.pdf`;
    
    let route = `/export/pdf?client_id=${clientId}`;
    if (mois) route += `&mois=${mois}`;

    if (Platform.OS === 'web') {
      const response = await API.get(route, { responseType: 'blob' });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const fileUri = FileSystem.documentDirectory + filename;
    const token = await storage.getItem('otizi_token');
    
    let fullUrl = BASE_URL + route;

    const downloadRes = await FileSystem.downloadAsync(
      fullUrl,
      fileUri,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (downloadRes.status !== 200) {
        alert(`Erreur Serveur (${downloadRes.status})`);
        return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      alert("Le partage n'est pas disponible");
    }
  } catch (error) {
    console.error('Download error:', error);
    alert('Erreur technique: ' + error.message);
  }
};

export default API;
