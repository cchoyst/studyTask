import { db, collection, addDoc } from "../firebase";

export const createTask = async ({ userId, themeId, title, startDate, dueDate, duration, comment, orderIndex }) => {


    try {
    const docRef = await addDoc(collection(db, "tasks"), {
      userId,
      themeId: themeId || null,
      title,
      startDate,
      dueDate,
      duration,
      comment,
      orderIndex
    });
    console.log("Task added with ID:", docRef.id);
  } catch (e) {
    console.error("Error adding task:", e);
  }
};
