import { useCallback, useEffect, useState } from 'react';
import { storage } from '../utils/helpers';

/**
 * Custom hook for localStorage with React state synchronization
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
    // Get value from localStorage or use initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = storage.get(key);
            return item !== null ? item : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Set value in both state and localStorage
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to localStorage
            storage.set(key, valueToStore);
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove value from both state and localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            storage.remove(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    // Listen for changes to localStorage from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error(`Error parsing localStorage value for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for form data persistence
 * @param {string} key - localStorage key
 * @param {object} initialFormData - Initial form data
 * @returns {object} Form data and handlers
 */
export const useFormPersistence = (key, initialFormData = {}) => {
    const [formData, setFormData] = useLocalStorage(key, initialFormData);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, [setFormData]);

    const updateFields = useCallback((fields) => {
        setFormData(prev => ({
            ...prev,
            ...fields
        }));
    }, [setFormData]);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, [setFormData, initialFormData]);

    const clearForm = useCallback(() => {
        setFormData({});
    }, [setFormData]);

    return {
        formData,
        updateField,
        updateFields,
        resetForm,
        clearForm,
        setFormData
    };
};

/**
 * Custom hook for user preferences
 * @returns {object} User preferences and handlers
 */
export const useUserPreferences = () => {
    const [preferences, setPreferences] = useLocalStorage('userPreferences', {
        theme: 'light',
        language: 'en',
        currency: 'USD',
        notifications: true,
        autoPlay: true,
        slideshowSpeed: 5000
    });

    const updatePreference = useCallback((key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    }, [setPreferences]);

    const resetPreferences = useCallback(() => {
        setPreferences({
            theme: 'light',
            language: 'en',
            currency: 'USD',
            notifications: true,
            autoPlay: true,
            slideshowSpeed: 5000
        });
    }, [setPreferences]);

    return {
        preferences,
        updatePreference,
        resetPreferences,
        setPreferences
    };
};

/**
 * Custom hook for recently viewed items
 * @param {number} maxItems - Maximum number of items to store
 * @returns {object} Recently viewed items and handlers
 */
export const useRecentlyViewed = (maxItems = 10) => {
    const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);

    const addToRecentlyViewed = useCallback((item) => {
        setRecentlyViewed(prev => {
            // Remove item if it already exists
            const filtered = prev.filter(existingItem => existingItem.id !== item.id);

            // Add item to beginning and limit to maxItems
            return [item, ...filtered].slice(0, maxItems);
        });
    }, [setRecentlyViewed, maxItems]);

    const removeFromRecentlyViewed = useCallback((itemId) => {
        setRecentlyViewed(prev => prev.filter(item => item.id !== itemId));
    }, [setRecentlyViewed]);

    const clearRecentlyViewed = useCallback(() => {
        setRecentlyViewed([]);
    }, [setRecentlyViewed]);

    return {
        recentlyViewed,
        addToRecentlyViewed,
        removeFromRecentlyViewed,
        clearRecentlyViewed
    };
};
