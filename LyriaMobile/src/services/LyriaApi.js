import api from './api';

const handleApiError = (error) => {
  if (error.response) {
    return { sucesso: false, erro: error.response.data.erro || 'Ocorreu um erro no servidor.' };
  } else if (error.request) {
    return { sucesso: false, erro: 'Não foi possível se conectar ao servidor.' };
  } else {
    return { sucesso: false, erro: 'Ocorreu um erro inesperado.' };
  }
};

// USER
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/Lyria/login', credentials);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const listConversas = async (username) => {
    try {
        const response = await api.get(`/Lyria/${username}/conversas`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const registerUser = async (userData) => {
  try {
    // The backend expects 'nome', 'email', 'senha'
    const response = await api.post('/Lyria/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserProfile = async (userId, userData) => {
    const isFormData = userData instanceof FormData;
    try {
        const response = await api.put(`/Lyria/profile/${userId}`, userData, {
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
export const conversar = async (username, pergunta, historico, conversa_id, signal) => {
  try {
    const payload = { pergunta, historico };
    if (conversa_id) {
      payload.conversa_id = conversa_id;
    }
    const response = await api.post(`/Lyria/${username}/conversar`, payload, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw handleApiError(error);
  }
};


// HISTORICO
export const getHistorico = async (username) => {
  try {
    const response = await api.get(`/Lyria/${username}/historico`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getConversa = async (conversaId) => {
  try {
    const response = await api.get(`/Lyria/conversas/${conversaId}/mensagens`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deletarConversa = async (conversaId) => {
  try {
    const response = await api.delete(`/Lyria/conversas/${conversaId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};
