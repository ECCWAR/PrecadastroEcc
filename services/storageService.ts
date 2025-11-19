import { FormData } from '../types';

const STORAGE_KEY = 'ecc_registrations_v1';

export interface StoredRegistration extends FormData {
  id: string;
  date: string;
}

export const saveRegistration = (data: FormData): void => {
  try {
    const registrations = getRegistrations();
    const newRegistration: StoredRegistration = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      date: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newRegistration, ...registrations]));
  } catch (error) {
    console.error('Error saving registration:', error);
  }
};

export const getRegistrations = (): StoredRegistration[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading registrations:', error);
    return [];
  }
};

export const clearRegistrations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing registrations:', error);
  }
};