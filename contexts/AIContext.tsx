import React, { createContext, useContext, useState, ReactNode } from 'react';

type AIContextType = {
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  isOpen: boolean;
  initialPrompt: string;
  clearInitialPrompt: () => void;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');

  const openChat = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setIsOpen(true);
  };
  
  const closeChat = () => {
    setIsOpen(false);
  };
  
  const clearInitialPrompt = () => {
    setInitialPrompt('');
  };

  return (
    <AIContext.Provider value={{ openChat, closeChat, isOpen, initialPrompt, clearInitialPrompt }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
}
