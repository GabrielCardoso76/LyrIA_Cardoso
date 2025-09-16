import api from './api';

// USER
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/usuarios/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/usuarios/cadastro', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
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
        throw error.response.data;
    }
};


// LYRIA
export const conversar = async (pergunta, historico, signal) => {
  try {
    const response = await api.post('/Lyria/conversar', { pergunta, historico }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao conversar com a Lyria:", error);
    }
    throw error;
  }
};

export const conversarAnonimo = async (pergunta, signal) => {
  try {
    const response = await api.post('/Lyria/conversar_anonimo', { pergunta }, { signal });
    return response.data;
  } catch (error)
    if (error.name !== 'AbortError') {
      console.error("Erro ao conversar com a Lyria (anônimo):", error);
    }
    throw error;
  }
};


// HISTORICO
export const getHistorico = async (userId) => {
  try {
    const response = await api.get(`/historico/usuario/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getConversa = async (conversaId) => {
  try {
    const response = await api.get(`/historico/conversa/${conversaId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateTituloConversa = async (conversaId, novoTitulo) => {
  try {
    const response = await api.put(`/historico/conversa/${conversaId}/titulo`, { novo_titulo: novoTitulo });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const deletarConversa = async (conversaId) => {
  try {
    const response = await api.delete(`/historico/conversa/${conversaId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
