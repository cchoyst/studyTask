//メイン画面。ログイン対応に変更
import { useEffect, useState } from "react";
import { auth, login, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createTask } from "./utils/firestoreFunctions";
import { getDocs, collection, query, where, onSnapshot, addDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);//tasksのstate追加
  const [title, setTitle] = useState("");//入力フォーム用state追加
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  const [categories, setCategories] = useState([]);//カテゴリー用state追加
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");


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

  //カテゴリのリアルタイム取得
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "categories"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    });

    return () => unsubscribe();
  }, [user]);

  //カテゴリ追加ボタン
  const handleAddCategory = async () => {
  if (!newCategory || !auth.currentUser) return;

  await addDoc(collection(db, "users", auth.currentUser.uid, "categories"), 
  {
    name: newCategory,
    userId: auth.currentUser.uid,
    createdAt: Date.now()
  });

  setNewCategory("");
};



  const handleAddTask = async () => {
    if (!auth.currentUser) return;
    if (!title || !startDate || !dueDate) {
      alert("タイトル / 期間は必須です");
      return;
    }

    const cat = categories.find(c => c.id === selectedCategory);

    await createTask({
      userId: auth.currentUser.uid,
      categoryId: selectedCategory || null,
      categoryName: cat?.name || "未分類",
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
    setSelectedCategory("");
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
          border: "1px solid #ccc",//フォームの枠線
          padding: "40px",//フォームの内側の余白
          borderRadius: "40px",//角丸
          width: "400px",//フォームの幅
          marginBottom: "30px"//下の余白
        }}>
          <label>タスク名</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: レポート提出"
            style={{ width: "100%", padding: "10px", marginBottom: "30px" }}
          />
          <label>開始日</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <label>締切</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "30px" }}
          />
          <label>コメント</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="補足メモ"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          
          <label>カテゴリー</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width:"100%", padding:"8px", marginBottom:"10px" }}
          >
            <option value="">未選択</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
                ))}
          </select>
          <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="新しいカテゴリ名"
              style={{ flex:1, padding:"8px" }}
            />
            <button onClick={handleAddCategory}>
              ➕ 追加
            </button>
          </div>
          <button
            onClick={handleAddTask}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              background: "#88d4d2ff",
              color: "black",
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
          gridTemplateColumns: "3fr 2fr 2fr 2fr 2fr",
          gap: "10px",
          padding: "10px 0",
          borderBottom: "2px solid #333",
          width: "800px"
        }}>
          <div>タイトル</div>
          <div>開始日</div>
          <div>期限</div>
          <div>カテゴリー</div>
          <div>コメント</div>

        </div>


        {/* タスク一覧 */}
        {tasks.map(task => (
          <div 
            key={task.id}
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr 2fr 2fr 2fr",
              gap: "10px",
              padding: "12px 0",
              borderBottom: "1px solid #ccc",
              width: "800px"
            }}
          >
            <div>{task.title}</div>
            <div>{task.startDate}</div>
            <div>{task.dueDate}</div>
            <div>{task.categoryName || "未分類"}</div>
            <div>{task.comment}</div>
          </div>
        ))}

        </>

      )}
    </div>
  );
}

export default App;
