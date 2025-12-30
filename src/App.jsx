//メイン画面。ログイン対応に変更
import { useEffect, useState } from "react";
import { auth, login, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createTask } from "./utils/firestoreFunctions";
import { getDocs, collection, query, where, onSnapshot } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);//tasksのstate追加
  const [title, setTitle] = useState("");//入力フォーム用state追加
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");



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

      return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id, ...doc.data(),
        }));
        console.log("リアルタイム更新:", tasks);
        setTasks(tasks);
      });
    });

    return () => unsubscribe();
  }, []);


  const handleAddTask = async () => {
    if (!auth.currentUser) return;
    if (!title || !startDate || !dueDate) {
      alert("タイトル / 期間は必須です！");
      return;
    }
    await createTask({
      userId: auth.currentUser.uid,
      title,
      startDate,
      dueDate,
      duration: 0,
      comment,
      orderIndex: 1
    });
    setTitle("");
    setStartDate("");
    setDueDate("");
    setComment("");
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
        

        
        <h2>📌 タスク追加フォーム</h2>
        <div style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "12px",
          width: "400px",
          marginBottom: "30px"
        }}>
          <label>タスク名</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: レポート提出"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <label>いつから</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <label>いつまで</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <label>コメント</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="補足メモ"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <button
            onClick={handleAddTask}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            ➕ タスクを追加
          </button>
        </div>



        <h2>📝 あなたのタスク一覧</h2>
        {/* ヘッダ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 2fr",
          fontWeight: "bold",
          padding: "10px 0",
          borderBottom: "2px solid #333",
          width: "800px"
        }}>
          <div>タイトル</div>
          <div>開始日</div>
          <div>期限</div>
          <div>コメント</div>
        </div>

        {/* タスク一覧 */}
        {tasks.map(task => (
          <div 
            key={task.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 2fr",
              padding: "12px 0",
              borderBottom: "1px solid #ccc",
              width: "800px"
            }}
          >
            <div>{task.title}</div>
            <div>{task.startDate}</div>
            <div>{task.dueDate}</div>
            <div>{task.comment}</div>
          </div>
        ))}

        </>

      )}
    </div>
  );
}

export default App;
