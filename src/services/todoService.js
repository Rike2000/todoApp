import { db } from "../firebaseConfig";
import { 
  collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, getDoc, writeBatch, setDoc 
} from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const LISTS_COLLECTION = "todoLists";
const TASKS_COLLECTION = "tasks";
const USERS_COLLECTION = "users";



// Get todo lists for the logged-in user
export const getTodoLists = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, LISTS_COLLECTION),
      where("userIds", "array-contains", user.uid) 
    );

    const listsSnapshot = await getDocs(q);
    return listsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching lists:", error);
    return [];
  }
};

export const getTasks = async (listId) => {
    try {
      const q = query(
        collection(db, "tasks"),
        where("listId", "==", listId) // ✅ Make sure this correctly matches
      );
  
      const tasksSnapshot = await getDocs(q);
      return tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };
  

// Create a new todo list
export const createTodoList = async (listName, users = []) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const newList = {
      name: listName,
      userIds: [user.uid, ...users], 
      createdAt: new Date().toISOString()
    };

    const newListRef = await addDoc(collection(db, LISTS_COLLECTION), newList);
    return { id: newListRef.id, ...newList };
  } catch (error) {
    console.error("Error creating list:", error);
    return null;
  }
};

// Add a task to a todo list
export const addTask = async (listId, text) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);
    const userColor = userDoc.exists() ? userDoc.data().color : "#000000";

    const newTask = {
      text,
      completed: false,
      listId,
      userId: user.uid,
      userColor,
      createdAt: new Date().toISOString()
    };

    const newTaskRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);
    return { id: newTaskRef.id, ...newTask };
  } catch (error) {
    console.error("Error adding task:", error);
    return null;
  }
};

// Invite user to a todo list by email
export const inviteUserToList = async (listId, newUserEmail) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", newUserEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found in Firestore");
    }

    const invitedUserId = querySnapshot.docs[0].id;

    const listRef = doc(db, LISTS_COLLECTION, listId);
    const listDoc = await getDoc(listRef);

    if (!listDoc.exists()) {
      throw new Error("List not found");
    }

    const listData = listDoc.data();
    if (!listData.userIds.includes(user.uid)) {
      throw new Error("Permission denied: You don't have access to invite users.");
    }

    if (!listData.userIds.includes(invitedUserId)) {
      await updateDoc(listRef, {
        userIds: [...listData.userIds, invitedUserId],
      });
      console.log(`User ${newUserEmail} invited to list.`);
      return true;
    } else {
      console.log(`User ${newUserEmail} is already in the list.`);
      return "User already in the list";
    }
  } catch (error) {
    console.log("Error inviting user:", error);
    return "User not found";
  }
};

// Delete a todo list
export const deleteTodoList = async (listId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const listRef = doc(db, LISTS_COLLECTION, listId);
    const listDoc = await getDoc(listRef);

    if (!listDoc.exists()) {
      throw new Error("List not found");
    }

    const listData = listDoc.data();
    if (!listData.userIds.includes(user.uid)) {
      throw new Error("Permission denied.");
    }

    const updatedUserIds = listData.userIds.filter(uid => uid !== user.uid);

    if (updatedUserIds.length === 0) {
      const batch = writeBatch(db);
      const tasksQuery = query(collection(db, TASKS_COLLECTION), where("listId", "==", listId));
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.forEach((taskDoc) => {
        batch.delete(doc(db, TASKS_COLLECTION, taskDoc.id));
      });
      batch.delete(listRef);
      await batch.commit();
      console.log("List and tasks deleted.");
    } else {
      await updateDoc(listRef, { userIds: updatedUserIds });
      console.log("User removed from list.");
    }
  } catch (error) {
    console.error("Error deleting list:", error);
  }
};

// Fetch user color
export const getUserColor = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const userRef = doc(db, USERS_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);
    
    return userDoc.exists() ? userDoc.data().color : "#000000";
  } catch (error) {
    console.error("Error fetching user color:", error);
    return "#000000";
  }
};

// Update tasks status between false and true
export const updateTaskStatus = async (taskId) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      const taskDoc = await getDoc(taskRef);
  
      if (!taskDoc.exists()) {
        throw new Error("Task not found");
      }
  
      const currentStatus = taskDoc.data().completed;
  
      await updateDoc(taskRef, {
        completed: !currentStatus, 
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      throw error;
    }
  };

  // Update users color
  export const updateUserColor = async (uid, color) => {
    try{
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

        const userRef = doc(db, USERS_COLLECTION, user.uid)
        const userDoc = await getDoc(userRef)

        if(!userDoc.exists()){
          throw new Error("User not found")
        }

        await updateDoc(userRef, {
          color: color
        })
        console.log("updated user color to: " + color);
        
        
    } catch(error) {
      throw error
    }
  }

  // delete task from a list
  export const deleteTask = async (taskId) => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");
  
        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        const taskDoc = await getDoc(taskRef);
  
        if (!taskDoc.exists()) {
            throw new Error("Task not found");
        }
  
        const taskData = taskDoc.data();
  
        const listRef = doc(db, LISTS_COLLECTION, taskData.listId);
        const listDoc = await getDoc(listRef);
  
        if (!listDoc.exists()) {
            throw new Error("List not found");
        }
  
        const listData = listDoc.data();
        if (!listData.userIds.includes(user.uid)) {
            throw new Error("Permission denied: You don't have access to this list");
        }

        await deleteDoc(taskRef);
  
    } catch (error) {
        console.error("Error deleting task:", error);
    }
  };