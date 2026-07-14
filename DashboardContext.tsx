import React from 'react';

export interface DashboardContextType {
  A: {
    bg: string;
    card: string;
    textPrimary: string;
    textMuted: string;
    border: string;
    bgLight: string;
    bgHover: string;
    inputText: string;
    tableHeader: string;
    tableRowHover: string;
  };
  globalSearch: string;
  clientesList: any[];
  gruposList: any[];
  consorciosList: any[];
  currentUser: any;
  refreshClientes: () => Promise<void>;
  refreshGrupos: () => Promise<void>;
  refreshConsorcios: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const DashboardContext = React.createContext<DashboardContextType | null>(null);
