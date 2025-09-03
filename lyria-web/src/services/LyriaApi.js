import api from "./api";

export const conversarAnonimo = async (pergunta) => {
  try {
    const response = await api.post("/Lyria/conversar", { pergunta });
    return response.data;
  } catch (error) {
    console.error("Erro ao conversar com a Lyria (anônimo):", error);
    throw error;
  }
};

export const deleteConversation = async (conversationId) => {
  try {
    const response = await api.delete(`/Lyria/conversas/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar conversa:", error);
    throw error;
  }
};

export const getConversations = async (username) => {
  try {
    const response = await api.get(`/Lyria/${username}/conversas`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lista de conversas:", error);
    throw error;
  }
};

export const getMessagesForConversation = async (conversationId) => {
  try {
    const response = await api.get(`/Lyria/conversas/${conversationId}/mensagens`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar mensagens da conversa:", error);
    throw error;
  }
};

export const startNewConversation = async (username, title) => {
  try {
    const response = await api.post(`/Lyria/${username}/conversas`, { title });
    return response.data;
  } catch (error) {
    console.error("Erro ao iniciar nova conversa:", error);
    throw error;
  }
};

export const postMessage = async (username, conversationId, question) => {
  try {
    const response = await api.post(`/Lyria/${username}/conversar`, {
      pergunta: question,
      conversa_id: conversationId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    throw error;
  }
};

export const setPersona = async (usuario, persona) => {
  try {
    const response = await api.post(`/Lyria/${usuario}/PersonaEscolhida`, {
      persona,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao definir persona:", error);
    throw error;
  }
};

export const getPersona = async (usuario) => {
  try {
    const response = await api.get(`/Lyria/${usuario}/PersonaEscolhida`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar persona:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/Lyria/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/Lyria/register", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};
