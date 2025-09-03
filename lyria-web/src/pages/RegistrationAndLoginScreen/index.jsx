import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../services/LyriaApi";
import "./Styles/styles.css";

function LoginRegisterPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Feedback state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, senha });
      if (response.sucesso) {
        // Em uma aplicação real, você salvaria o token/usuário no contexto/localStorage
        console.log("Login bem-sucedido:", response.usuario);
        navigate("/"); // Redireciona para a página principal
      } else {
        setError(response.erro || "Erro ao fazer login.");
      }
    } catch (err) {
      setError(err.response?.data?.erro || "Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await register({ nome, email, senha });
      if (response.sucesso) {
        // Sucesso no cadastro, muda para a tela de login
        setIsLogin(true);
        setError("Cadastro realizado com sucesso! Faça o login para continuar.");
      } else {
        setError(response.erro || "Erro ao registrar.");
      }
    } catch (err) {
      setError(err.response?.data?.erro || "Erro de conexão. Tente novamente.");
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

            {error && <p className="error-message">{error}</p>}

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