import { FiX } from 'react-icons/fi';
import './styles.css';

const SettingsModal = ({
  isOpen,
  onClose,
  personas,
  selectedPersona,
  onPersonaChange,
  availableVoices,
  selectedVoice,
  onVoiceChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-backdrop">
      <div className="settings-modal-content">
        <button className="settings-modal-close-btn" onClick={onClose}>
          <FiX />
        </button>
        <h2>Configurações</h2>
        <div className="settings-group">
          <label htmlFor="persona-select">Persona da IA</label>
          <select
            id="persona-select"
            value={selectedPersona}
            onChange={onPersonaChange}
            className="settings-select"
          >
            {Object.entries(personas).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div className="settings-group">
          <label htmlFor="voice-select">Voz da IA</label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={onVoiceChange}
            className="settings-select"
          >
            {availableVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
