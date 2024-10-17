import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Reset básico para remover margens, paddings e outros estilos padrão
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    background-color: #0f0f0f;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #0f0f0f;
`;

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  height: 80%;
  overflow-y: auto;
  background-color: #000000;
  padding: 20px;
  border: 1px solid #333333;
  border-radius: 10px;
`;

const SentMessage = styled.div`
  align-self: flex-end;
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
  word-wrap: break-word;
`;

const ReceivedMessage = styled.div`
  align-self: flex-start;
  background-color: #e5e5ea;
  color: black;
  padding: 10px;
  border-radius: 10px;
  max-width: 60%;
  word-wrap: break-word;
  white-space: pre-wrap; /* Garante a exibição correta de quebras de linha */
`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 600px;
  padding: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #333333;
  border-radius: 5px;
  outline: none;
  background-color: #242424;
  color: #b1b1b1;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

export const App: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'me' | 'other' }[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null); // Referência para a última mensagem

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/chat');
    ws.onmessage = (event) => {
      // Aqui assumimos que a mensagem recebida é uma string
      setMessages((prev) => [...prev, { text: event.data, sender: 'other' }]);
    };
    setSocket(ws);
    return () => ws.close();
  }, []);

  useEffect(() => {
    // Sempre rolar para a última mensagem quando novas mensagens são adicionadas
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.send(input);
      setMessages((prev) => [...prev, { text: input, sender: 'me' }]);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <MessagesContainer>
          {messages.map((msg, index) => (
            msg.sender === 'me' ? (
              <SentMessage key={index}>Voce: {msg.text}</SentMessage>
            ) : (
              <ReceivedMessage key={index}>Empresa: {msg.text}</ReceivedMessage>
            )
          ))}
          <div ref={lastMessageRef} />
        </MessagesContainer>
        <InputContainer>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
          />
          <Button onClick={sendMessage}>Enviar</Button>
        </InputContainer>
      </Container>
    </>
  );
};