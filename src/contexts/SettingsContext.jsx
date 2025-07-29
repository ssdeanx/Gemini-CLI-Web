import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('gemini-tools-settings');
      return savedSettings ? JSON.parse(savedSettings) : {};
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return {};
    }
  });

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem('gemini-tools-settings', JSON.stringify(updated));
        // Dispatch a storage event to notify other components/tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'gemini-tools-settings',
          newValue: JSON.stringify(updated)
        }));
      } catch (error) {
        console.error('Error saving settings to localStorage:', error);
      }
      return updated;
    });
  };
  
  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'gemini-tools-settings' && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    settings,
    updateSettings,
    // Convenience accessors
    allowedTools: settings.allowedTools || [],
    disallowedTools: settings.disallowedTools || [],
    skipPermissions: settings.skipPermissions || false,
    projectSortOrder: settings.projectSortOrder || 'name',
    selectedModel: settings.selectedModel || 'gemini-2.5-flash',
    enableNotificationSound: settings.enableNotificationSound || false,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
