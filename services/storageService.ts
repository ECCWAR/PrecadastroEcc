import { FormData } from '../types';

export interface StoredRegistration extends FormData {
  id: string;
  date: string;
}

// Envia os dados para a Serverless Function na Vercel
export const saveRegistration = async (data: FormData): Promise<void> => {
  try {
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar no servidor');
    }
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error);
    throw error; // Repassa o erro para o formulário tratar
  }
};

// Busca os dados da Serverless Function
export const getRegistrations = async (): Promise<StoredRegistration[]> => {
  try {
    const response = await fetch('/api/registrations');
    if (!response.ok) {
      throw new Error('Erro ao buscar dados');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao carregar inscrições:', error);
    return [];
  }
};

// Limpar dados (Apenas localmente ou implementando um endpoint DELETE se desejar)
export const clearRegistrations = async (): Promise<void> => {
  console.warn('A limpeza de banco de dados via frontend foi desabilitada por segurança.');
  alert('Para limpar o banco de dados PostgreSQL, utilize o painel da Vercel ou implemente uma rota segura de delete.');
};