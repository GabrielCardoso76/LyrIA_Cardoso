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

export const getConversas = async (usuario) => {
  try {
    const response = await api.get(`/Lyria/conversas/${usuario}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    throw error;
  }
};

export const getHistorico = async (usuario) => {
  try {
    const response = await api.get(`/Lyria/${usuario}/historico`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
};

export const conversarLogado = async (usuario, pergunta) => {
  try {
    const response = await api.post(`/Lyria/${usuario}/conversar`, {
      pergunta,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao conversar com a Lyria (logado):", error);
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
