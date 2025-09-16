import api from './api';

const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    return { sucesso: false, erro: 'Não foi possível se conectar ao servidor.' };
  } else {
    // Something happened in setting up the request that triggered an Error
    return { sucesso: false, erro: 'Ocorreu um erro inesperado.' };
  }
};

// USER
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/usuarios/login', credentials);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/usuarios/cadastro', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserProfile = async (userId, userData) => {
    const isFormData = userData instanceof FormData;
    try {
        const response = await api.put(`/usuarios/perfil/${userId}`, userData, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};


// LYRIA
export const conversar = async (pergunta, historico, signal) => {
  try {
    const response = await api.post('/Lyria/conversar', { pergunta, historico }, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw handleApiError(error);
  }
};


// HISTORICO
export const getHistorico = async (userId) => {
  try {
    const response = await api.get(`/historico/usuario/${userId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getConversa = async (conversaId) => {
  try {
    const response = await api.get(`/historico/conversa/${conversaId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateTituloConversa = async (conversaId, novoTitulo) => {
  try {
    const response = await api.put(`/historico/conversa/${conversaId}/titulo`, { novo_titulo: novoTitulo });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deletarConversa = async (conversaId) => {
  try {
    const response = await api.delete(`/historico/conversa/${conversaId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
