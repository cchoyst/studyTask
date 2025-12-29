//メイン画面。ログイン対応に変更
import { useEffect, useState } from "react";
import { auth, login, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

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
        </>
      )}
    </div>
  );
}

export default App;
