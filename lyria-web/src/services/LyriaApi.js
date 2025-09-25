import api from "./api";

export const conversarAnonimo = async (pergunta, persona, signal) => {
  try {
    const response = await api.post("/conversar", { pergunta, persona }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao conversar com a Lyria (anônimo):", error);
    }
    throw error;
  }
};

export const gerarImagem = async (prompt) => {
  try {
    const response = await api.post("/gerar-imagem", { prompt }, {
      responseType: 'blob', // Essencial para receber dados de imagem
    });
    // Cria uma URL local para o blob da imagem recebido
    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);

    // Se a API retornar um erro em JSON (ex: prompt faltando), o erro virá como um blob.
    // Precisamos convertê-lo de volta para texto para ler a mensagem.
    if (error.response && error.response.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        // Lança um novo erro com a mensagem da API para ser capturado pela interface
        throw new Error(errorJson.erro || 'Ocorreu um erro ao gerar a imagem.');
      } catch (e) {
        // Caso a conversão falhe
        throw new Error('Não foi possível interpretar o erro recebido do servidor.');
      }
    }
    
    throw error; // Lança o erro original se não for um blob
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, formData) => {
  try {
    const response = await api.put(`/profile/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    throw error;
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/conversas/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar conversa:", error);
    throw error;
  }
};

export const getConversations = async (username) => {
  try {
    const response = await api.get(`/${username}/conversas`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lista de conversas:", error);
    throw error;
  }
};

export const getMessagesForConversation = async (conversationId) => {
  try {
    const response = await api.get(`/conversas/${conversationId}/mensagens`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar mensagens da conversa:", error);
    throw error;
  }
};

export const postMessage = async (username, conversationId, question, signal) => {
  try {
    const response = await api.post(`/conversar-logado`, {
      pergunta: question,
      conversa_id: conversationId,
    }, { signal });
    return response.data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error("Erro ao enviar mensagem:", error);
    }
    throw error;
  }
};

export const setPersona = async (persona) => {
  try {
    const response = await api.post(`/PersonaEscolhida`, {
      persona,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao definir persona:", error);
    throw error;
  }
};

export const getPersona = async () => {
  try {
    const response = await api.get(`/PersonaEscolhida`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar persona:", error);
    throw error;
  }
};

export const getPersonas = async () => {
  try {
    const response = await api.get("/personas");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar personas:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/usuarios", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};