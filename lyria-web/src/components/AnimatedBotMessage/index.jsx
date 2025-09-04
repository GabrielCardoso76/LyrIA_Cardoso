import { useState, useEffect } from "react";

function AnimatedBotMessage({ fullText, animate = true }) {
  const [text, setText] = useState(animate ? "" : fullText);

  useEffect(() => {
    if (!animate) {
      setText(fullText);
      return;
    }

    let timeoutId;
    const typeCharacter = (currentIndex) => {
      if (currentIndex > fullText.length) {
        return;
      }
      setText(fullText.slice(0, currentIndex));
      timeoutId = setTimeout(() => {
        typeCharacter(currentIndex + 1);
      }, 25);
    };

    typeCharacter(0);

    return () => clearTimeout(timeoutId);
  }, [fullText, animate]);

  return <div className="message bot message-animated">{text}</div>;
}

export default AnimatedBotMessage;
