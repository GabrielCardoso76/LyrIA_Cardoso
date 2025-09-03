import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/LyriaApi"; // Apenas o register é necessário aqui
import { useAuth } from "../../context/AuthContext"; // Importa o hook de autenticação
import Alert from "../../components/Alert";
import "./Styles/styles.css";

function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Pega a função de login do contexto

  // Form state
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Feedback state
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => setFeedback({ message: "", type: "" });

  const toggleForm = () => {
    setIsLogin(!isLogin);
    clearFeedback();
  };

  const handleLogin = async () => {
    setLoading(true);
    clearFeedback();
    try {
      // Usa a função de login do contexto
      const response = await login({ email, senha });
      if (response.sucesso) {
        navigate("/"); // O AuthContext já cuidou de salvar o usuário
      } else {
        setFeedback({ message: response.erro || "Erro ao fazer login.", type: "error" });
      }
    } catch (err) {
      // O erro já é tratado no contexto, mas podemos exibir uma mensagem genérica
      setFeedback({ message: err.response?.data?.erro || "Erro de conexão. Tente novamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (senha !== confirmarSenha) {
      setFeedback({ message: "As senhas não coincidem.", type: "error" });
      return;
    }
    setLoading(true);
    clearFeedback();
    try {
      const response = await register({ nome, email, senha });
      if (response.sucesso) {
        setIsLogin(true);
        setFeedback({ message: "Cadastro realizado com sucesso! Faça o login para continuar.", type: "success" });
      } else {
        setFeedback({ message: response.erro || "Erro ao registrar.", type: "error" });
      }
    } catch (err) {
      setFeedback({ message: err.response?.data?.erro || "Erro de conexão. Tente novamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  };


  const handleAuth = (event) => {
    event.preventDefault();
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="auth-body">
      <div className={`form-container ${isLogin ? "login-active" : "register-active"}`}>
        <div className="form-content">
          <h2 className="form-title">{isLogin ? "Bem-vindo de Volta" : "Crie sua Conta"}</h2>
          <p className="form-subtitle">
            {isLogin
              ? "Entre para continuar sua jornada cósmica."
              : "Junte-se a nós e explore o universo LyrIA."}
          </p>

          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            )}
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {!isLogin && (
              <div className="input-group">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirmar Senha"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
                 <span
                className="password-toggle-icon"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
              </div>
            )}

            {isLogin && (
                <a href="#" className="forgot-password">Esqueceu sua senha?</a>
            )}

            <Alert message={feedback.message} type={feedback.type} />

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "CARREGANDO..." : (isLogin ? "ENTRAR" : "CADASTRAR")}
            </button>
          </form>

          <p className="toggle-form-text">
            {isLogin ? "Não tem uma conta?" : "Já possui uma conta?"}{" "}
            <span onClick={toggleForm}>{isLogin ? "Cadastre-se" : "Faça Login"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterPage;