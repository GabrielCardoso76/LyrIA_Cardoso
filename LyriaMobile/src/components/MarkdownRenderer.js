import React from 'react';
import { Text, StyleSheet } from 'react-native';

const MarkdownRenderer = ({ content }) => {
  const parts = content.split(/(\*\*.*?\*\*|´´.*?´´)/g);

  const renderPart = (part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if (part.startsWith('´´') && part.endsWith('´´')) {
      return (
        <Text key={index} style={styles.title}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  };

  return <Text style={styles.messageText}>{parts.map(renderPart)}</Text>;
};

const styles = StyleSheet.create({
  messageText: {
    color: '#f0f0f0',
    fontSize: 16,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default MarkdownRenderer;
