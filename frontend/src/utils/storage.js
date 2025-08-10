// Local storage utilities for user session management

const USER_STORAGE_KEY = 'whiteboard_user';

/**
 * Store user data in localStorage
 * @param {Object} userData - User data to store
 */
export const storeUser = (userData) => {
  try {
    const dataToStore = {
      ...userData,
      timestamp: Date.now()
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Retrieve user data from localStorage
 * @returns {Object|null} User data or null if not found/expired
 */
export const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;

    const userData = JSON.parse(stored);
    
    // Check if data is older than 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - userData.timestamp > twentyFourHours) {
      clearStoredUser();
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    clearStoredUser();
    return null;
  }
};

/**
 * Clear user data from localStorage
 */
export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Update stored user data
 * @param {Object} updates - Updates to apply to stored user data
 */
export const updateStoredUser = (updates) => {
  try {
    const currentUser = getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      storeUser(updatedUser);
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};