import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import './styles.css';

const LoginPrompt = ({ onDismiss }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt-content">
        <h3>Recurso Exclusivo para Usuários</h3>
        <p>
          Para acessar o histórico de conversas e salvar seus chats, por favor,
          faça o login.
        </p>
        <button onClick={handleLogin} className="login-btn">
          <FiLogIn />
          Fazer Login
        </button>
        <button onClick={onDismiss} className="dismiss-btn">
          Agora não
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
