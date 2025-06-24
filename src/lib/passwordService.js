import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Helper function to get the user's passwords collection reference
const getUserPasswordsRef = (userId) => {
  return collection(db, 'users', userId, 'passwords');
};

/**
 * Get all passwords for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of password objects
 */
export const getPasswords = async (userId) => {
  try {
    const q = query(
      getUserPasswordsRef(userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting passwords:', error);
    throw error;
  }
};

/**
 * Get a single password by ID
 * @param {string} userId - The ID of the user
 * @param {string} passwordId - The ID of the password
 * @returns {Promise<Object>} The password object
 */
export const getPassword = async (userId, passwordId) => {
  try {
    const docRef = doc(db, 'users', userId, 'passwords', passwordId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Password not found');
    }
  } catch (error) {
    console.error('Error getting password:', error);
    throw error;
  }
};

/**
 * Add a new password
 * @param {string} userId - The ID of the user
 * @param {Object} passwordData - The password data to add
 * @returns {Promise<string>} The ID of the newly created password
 */
export const addPassword = async (userId, passwordData) => {
  try {
    const docRef = doc(getUserPasswordsRef(userId));
    
    await setDoc(docRef, {
      ...passwordData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding password:', error);
    throw error;
  }
};

/**
 * Update an existing password
 * @param {string} userId - The ID of the user
 * @param {string} passwordId - The ID of the password to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<void>}
 */
export const updatePassword = async (userId, passwordId, updates) => {
  try {
    const docRef = doc(db, 'users', userId, 'passwords', passwordId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

/**
 * Delete a password
 * @param {string} userId - The ID of the user
 * @param {string} passwordId - The ID of the password to delete
 * @returns {Promise<void>}
 */
export const deletePassword = async (userId, passwordId) => {
  try {
    const docRef = doc(db, 'users', userId, 'passwords', passwordId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting password:', error);
    throw error;
  }
};

/**
 * Search passwords by title, username, or website
 * @param {string} userId - The ID of the user
 * @param {string} searchTerm - The term to search for
 * @returns {Promise<Array>} Array of matching password objects
 */
export const searchPasswords = async (userId, searchTerm) => {
  try {
    if (!searchTerm.trim()) {
      return getPasswords(userId);
    }
    
    const searchLower = searchTerm.toLowerCase();
    const passwords = await getPasswords(userId);
    
    return passwords.filter(password => {
      return (
        password.title.toLowerCase().includes(searchLower) ||
        (password.username && password.username.toLowerCase().includes(searchLower)) ||
        (password.website && password.website.toLowerCase().includes(searchLower))
      );
    });
  } catch (error) {
    console.error('Error searching passwords:', error);
    throw error;
  }
};

/**
 * Get passwords by category
 * @param {string} userId - The ID of the user
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} Array of password objects in the specified category
 */
export const getPasswordsByCategory = async (userId, category) => {
  try {
    if (category === 'all') {
      return getPasswords(userId);
    }
    
    const q = query(
      getUserPasswordsRef(userId),
      where('category', '==', category),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting passwords by category:', error);
    throw error;
  }
};

/**
 * Get favorite passwords
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of favorite password objects
 */
export const getFavoritePasswords = async (userId) => {
  try {
    const q = query(
      getUserPasswordsRef(userId),
      where('favorite', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorite passwords:', error);
    throw error;
  }
};
