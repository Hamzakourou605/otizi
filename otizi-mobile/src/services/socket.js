// src/services/socket.js
import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const PRODUCTION_URL = 'https://otizi.onrender.com';
const PC_IP = '192.168.11.104';

const getSocketURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  if (__DEV__) {
    return `http://${PC_IP}:5000`;
  }
  return PRODUCTION_URL;
};

const socket = io(getSocketURL(), {
  transports: ['websocket'],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
