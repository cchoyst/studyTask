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
      <h1>Task Calendar App</h1>

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
