//メイン画面。ログイン対応に変更
import "./App.css";
import { useEffect, useState } from "react";
import { auth, login, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { createTask, updateTask, deleteTask, updateTaskOrder } from "./utils/firestoreFunctions";
import { collection, query, where, onSnapshot, addDoc, orderBy } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";//ドラッグアンドドロップ用ライブラリ
import MonthlyCalendar from "./MonthlyCalendar";



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

  // 編集・削除タスクの state 追加
  const [editingTask, setEditingTask] = useState(null);

  // タスク追加モーダルの state 追加
  const [showAddModal, setShowAddModal] = useState(false);


  const focusTask = (id) => {
    const el = document.getElementById(`task-${id}`);
    if (!el) return;

    // 画面をそのタスク位置までスクロールさせる
    el.scrollIntoView({
      behavior: "smooth",   // なめらかに移動
      block: "center",      // 画面の中央に表示
      inline: "nearest"
    });


    el.animate(
      [
        { background: "rgba(100,150,255,0.2)" },
        { background: "rgba(100,150,255,0.8)" },
        { background: "rgba(100,150,255,0.0)" },
      ],
      {
        duration: 700,
        easing: "ease-in-out"
      }
    );
  };

  



  useEffect(() => {
    // ログイン状態監視
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) return;

      // Firestore 読み込み
      const q = query(
        collection(db, "tasks"),
        where("userId", "==", u.uid),
        orderBy("orderIndex", "asc")
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


  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const newTasks = Array.from(tasks);
    const [moved] = newTasks.splice(result.source.index, 1);
    newTasks.splice(result.destination.index, 0, moved);

    setTasks(newTasks);

    await updateTaskOrder(newTasks);
  };

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
      orderIndex: tasks.length
    });

    setTitle("");
    setStartDate("");
    setDueDate("");
    setComment("");
    setSelectedCategory("");
  };



  return (
    <div style={{ padding: "40px", fontSize: "20px" }}>
      <h1>見れば理解るカレンダー</h1>
      <h2>私のためのタスク管理サイト</h2>

      {!user && (
        <button onClick={login}>
          Googleでログイン
        </button>
      )}

      {user && (
        <>
          <p>こんにちは {user.displayName} さん！</p>
          <br /> {/*空行追加*/}
          <button onClick={logout} className="logout-btn">
            ログアウト
          </button>


          <div
            style={{
              display: "flex",
              justifyContent: "center",   // ← これ！
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px"
            }}
          >
            <h2>📝 あなたのタスク一覧</h2>

            <button 
              onClick={() => setShowAddModal(true)}
              style={{
                padding:"6px 10px",
                borderRadius:"50%",
                border:"none",
                background:"#4caf50",
                color:"white",
                fontSize:"20px",
                cursor:"pointer"
              }}
            >
              ＋
            </button>
          </div>


          {/* ヘッダ */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr 2fr 2fr 2fr 80px",
            gap: "10px",
            padding: "10px 0",
            borderBottom: "2px solid #333",
            width: "1000px",
            margin:"0 auto"
          }}>
            <div>タイトル</div>
            <div>開始日</div>
            <div>期限</div>
            <div>カテゴリー</div>
            <div>コメント</div>

          </div>


          {/* タスク一覧 */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="taskList">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  
                  {tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          id={`task-${task.id}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}

                          style={{
                            display: "grid",
                            gridTemplateColumns: "3fr 2fr 2fr 2fr 2fr 80px",
                            gap: "10px",
                            padding: "12px 0",
                            borderBottom: "1px solid #ccc",
                            width: "1000px",
                            margin:"0 auto",
                            background: "white",
                            transition: "background 0.3s",
                          }}
                        >
                          <div>{task.title}</div>
                          <div>{task.startDate}</div>
                          <div>{task.dueDate}</div>
                          <div>{task.categoryName || "未分類"}</div>
                          <div>{task.comment}</div>
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => setEditingTask(task)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: "1px solid #888",
                                cursor: "pointer"
                              }}
                            >
                              ⋯
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>


          <br /> {/*空行追加*/}
          
          <MonthlyCalendar
            tasks={tasks}
            onTaskFocus={focusTask}
          />



          {/* 編集モーダル */}
          {editingTask && (
            <div className="modal">
              <div className="modal-content">

                <h3>タスク編集</h3>

                <div className="input-group">
                  <label>タイトル</label>
                  <input
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>開始日</label>
                  <input
                    type="date"
                    value={editingTask.startDate}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>期限</label>
                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, dueDate: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label>コメント</label>
                  <textarea
                    value={editingTask.comment}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, comment: e.target.value })
                    }
                  />
                </div>


                {/* ← ここで保存＆削除を横並びにまとめる */}
              <div className="modal-button-row">
                <button className="btn save"
                  onClick={async () => {
                    await updateTask(editingTask.id, editingTask);
                    setEditingTask(null);
                  }}
                >
                  保存
                </button>

                <button className="btn delete"
                  onClick={async () => {
                    await deleteTask(editingTask.id);
                    setEditingTask(null);
                  }}
                >
                  削除
                </button>
              </div>

              {/* ← キャンセルだけ下段 */}
              <button className="btn cancel" onClick={() => setEditingTask(null)}>
                閉じる
              </button>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="modal">
              <div className="modal-content">
                <h3>📌 タスク追加フォーム</h3>
                <div className="input-group">
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
                  <label>期限</label>
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
                </div>


                <div className="modal-button-row">
                  <button
                    className="btn save"
                    onClick={async () => {
                      await handleAddTask();
                      setShowAddModal(false);
                    }}
                  >
                    追加
                  </button>

                  <button
                    className="btn cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}
        </>

      )}
    </div>
  );
}

export default App;
