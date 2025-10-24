import { FiClock, FiPlus, FiSettings } from "react-icons/fi";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { Link } from "react-router-dom";

const ChatHeader = ({
  onHistoryClick,
  onSettingsClick,
  isSpeechEnabled,
  onToggleSpeech,
  onNewChatClick,
}) => {
  return (
    <header className="galaxy-chat-header">
      <div className="header-left">
        <button
          className="header-icon-btn"
          onClick={onHistoryClick}
          title="Histórico"
        >
          <FiClock />
        </button>
        <button
          className="header-icon-btn"
          onClick={onSettingsClick}
          title="Configurações"
        >
          <FiSettings />
        </button>
      </div>
      <Link to="/" className="header-title-link">
        <h1>LyrIA</h1>
      </Link>
      <div className="header-right">
        <button
          onClick={onToggleSpeech}
          className="header-icon-btn"
          title={isSpeechEnabled ? "Desativar voz" : "Ativar voz"}
        >
          {isSpeechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
        <button
          className="header-icon-btn"
          onClick={onNewChatClick}
          title="Novo Chat"
        >
          <FiPlus />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
