import axios from 'axios';

// IMPORTANTE: Para o aplicativo funcionar, você precisa substituir a string abaixo
// pelo endereço IP da sua máquina na sua rede local.
// Exemplo: 'http://192.168.1.10:5001'
// No Windows, você pode encontrar seu IP abrindo o CMD e digitando 'ipconfig'.
// No macOS ou Linux, abra o Terminal e digite 'ifconfig' ou 'ip a'.
const baseURL = 'http://SEU_IP_AQUI:5001';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
