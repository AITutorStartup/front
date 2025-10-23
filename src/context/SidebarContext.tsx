import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Определяем, как будет выглядеть наш контекст
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

// 2. Создаем сам контекст
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 3. Создаем наш собственный провайдер
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true); // Сайдбар будет открыт по умолчанию

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

// 4. Создаем кастомный хук для удобного доступа к состоянию
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
