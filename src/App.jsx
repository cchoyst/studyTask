//メイン画面。ログイン対応に変更
import { useEffect, useState } from "react";
import { auth, login, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createTask } from "./utils/firestoreFunctions";
import { getDocs, collection, query, where } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // ログイン状態監視
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (!u) return;

      // Firestore 読み込み
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", u.uid)
      );

      const snapshot = await getDocs(q);
      const task = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log("🔥 Firestore から取得:", tasks);
      setTasks(tasks);
    });

    return () => unsubscribe();
  }, []);


  const handleAddTask = async () => {
    if (!auth.currentUser) return;
    createTask({
      userId: auth.currentUser.uid,
      title: "サンプルタスク",
      startDate: "2025-12-30",
      dueDate: "2026-01-05",
      duration: 5,
      comment: "テスト",
      orderIndex: 1
    });
  };

  return (
    <div style={{ padding: "40px", fontSize: "20px" }}>
      <h1>Study-TASK</h1>
      <h2>大学生のための視認しやすいタスク管理アプリ</h2>

      {!user && (
        <button onClick={login}>
          Googleでログイン
        </button>
      )}

      {user && (
        <>
          <p>こんにちは {user.displayName} さん！</p>
          <button onClick={logout}>ログアウト</button>

         <br /><br />

          <button onClick={handleAddTask}>
            🔥 Firestore にタスク登録
          </button>

          <br /><br />
          <h3>📋 あなたのタスク一覧</h3>

          {tasks.length === 0 && <p>まだタスクがありません</p>}

          {tasks.map(task => (
            <div key={task.id} style={{ marginBottom: "10px" }}>
              <strong>{task.title}</strong><br />
              期間: {task.startDate} → {task.dueDate}<br />
              コメント: {task.comment}
            </div>
          ))}

        </>

      )}
    </div>
  );
}

export default App;
