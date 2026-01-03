import { db, collection, addDoc } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";


export const createTask = async ({
  userId, 
  categoryId,
  categoryName,
  title, 
  startDate, 
  dueDate, 
  duration, 
  comment, 
  orderIndex 
}) => {


    try {
    const docRef = await addDoc(collection(db, "tasks"), {
      userId,
      categoryId: categoryId || null,
      categoryName: categoryName || "未分類",
      title,
      startDate,
      dueDate,
      duration,
      comment,
      orderIndex,
      createdAt: new Date()
    });
    console.log("Task added with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding task:", e);
  }
};


// 更新
export const updateTask = async (taskId, data) => {
  await updateDoc(doc(db, "tasks", taskId), data);
};

// 削除
export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

// 並び替え index 更新
export const updateTaskOrder = async (tasks) => {
  const promises = tasks.map((task, index) =>
    updateDoc(doc(db, "tasks", task.id), {
      orderIndex: index
    })
  );
  await Promise.all(promises);
};