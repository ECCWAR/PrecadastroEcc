import { FormData } from '../types';

const STORAGE_KEY = 'ecc_registrations_v1';

// ---------------------------------------------------------------------------
// ATENÇÃO: COLE AQUI A URL DO SEU APP DA WEB DO GOOGLE APPS SCRIPT
// Exemplo: 'https://script.google.com/macros/s/AKfycbx.../exec'
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxGcHbFKmlFHKiZq5lJoZqbP5bORxzm-EVKownuyR4t0xsgDngfMXtJ9pN9FFc0Xeopaw/exec'; 
// ---------------------------------------------------------------------------

export interface StoredRegistration extends FormData {
  id: string;
  date: string;
}

export const saveRegistration = async (data: FormData): Promise<void> => {
  const newRegistration: StoredRegistration = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    date: new Date().toISOString()
  };

  // 1. Save to Local Storage (Backup & Local Admin View)
  try {
    const registrations = getRegistrations();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newRegistration, ...registrations]));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }

  // 2. Send to Google Sheets
  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Important: 'no-cors' is required for Google Apps Script simple triggers
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      console.log('Data sent to Google Sheet');
    } catch (error) {
      console.error('Error sending to Google Sheet:', error);
      // We don't throw here to ensure the user still sees the success screen
      // since the local save worked.
    }
  } else {
    console.warn('GOOGLE_SCRIPT_URL not configured. Data saved locally only.');
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