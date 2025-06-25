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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Handle email and username fields
      let email = data.email || "";
      let username = data.username || "";
      
      return {
        id: doc.id,
        title: data.title || "",
        email: email,
        username: username,
        password: data.password || "",
        website: data.website || "",
        notes: data.notes || "",
        category: data.category || "Personal",
        favorite: data.favorite || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });
  } catch (error) {
    console.error("Error getting passwords:", error);
    throw error;
  }
};

// Add a new password
export const addPassword = async (userId, passwordData) => {
  try {
    const passwordToSave = {
      title: passwordData.title || "",
      email: passwordData.email || "",
      username: passwordData.username || "",
      password: passwordData.password || "",
      website: passwordData.website || "",
      notes: passwordData.notes || "",
      category: passwordData.category || "Personal",
      favorite: Boolean(passwordData.favorite),
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, PASSWORDS_COLLECTION), passwordToSave);
    return { id: docRef.id, ...passwordToSave };
  } catch (error) {
    console.error("Error adding password:", error);
    throw error;
  }
};

// Update an existing password
export const updatePassword = async (userId, passwordId, updates) => {
  try {
    const passwordRef = doc(db, PASSWORDS_COLLECTION, passwordId);

    // Only update the fields that are provided in updates
    const updateData = {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.email !== undefined && { email: String(updates.email) }),
      ...(updates.username !== undefined && { username: String(updates.username) }),
      ...(updates.password !== undefined && { password: updates.password }),
      ...(updates.website !== undefined && { website: updates.website }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.favorite !== undefined && { favorite: Boolean(updates.favorite) }),
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(passwordRef, updateData);
    return { id: passwordId, ...updateData };
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
