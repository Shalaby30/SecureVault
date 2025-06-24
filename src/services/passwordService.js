import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

const PASSWORDS_COLLECTION = "passwords";

// Get all passwords for a user
export const getPasswords = async (userId) => {
  try {
    const q = query(
      collection(db, PASSWORDS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting passwords:", error);
    throw error;
  }
};

// Add a new password
export const addPassword = async (passwordData, userId) => {
  try {
    const docRef = await addDoc(collection(db, PASSWORDS_COLLECTION), {
      ...passwordData,
      userId,
      isFavorite: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...passwordData };
  } catch (error) {
    console.error("Error adding password:", error);
    throw error;
  }
};

// Update an existing password
export const updatePassword = async (passwordId, updates) => {
  try {
    const passwordRef = doc(db, PASSWORDS_COLLECTION, passwordId);
    await updateDoc(passwordRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: passwordId, ...updates };
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

// Delete a password
export const deletePassword = async (passwordId) => {
  try {
    await deleteDoc(doc(db, PASSWORDS_COLLECTION, passwordId));
    return passwordId;
  } catch (error) {
    console.error("Error deleting password:", error);
    throw error;
  }
};

// Toggle favorite status
export const toggleFavorite = async (passwordId, currentStatus) => {
  try {
    const passwordRef = doc(db, PASSWORDS_COLLECTION, passwordId);
    await updateDoc(passwordRef, {
      isFavorite: !currentStatus,
      updatedAt: serverTimestamp()
    });
    return !currentStatus;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};
