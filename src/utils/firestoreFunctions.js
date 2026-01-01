import { db, collection, addDoc } from "../firebase";


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
