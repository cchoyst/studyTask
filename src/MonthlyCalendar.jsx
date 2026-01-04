import { useEffect, useRef, useState } from "react";

export default function MonthlyCalendar({ tasks, onTaskFocus }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // 1. 表示月を管理するState
  const [viewDate, setViewDate] = useState(new Date());

  // サイズ監視 (変更なし)
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      setSize({ w: width, h: width * 0.75 });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 月情報
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); 
  const firstDay = new Date(year, month, 1);
  const startWeek = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 月切り替え用関数
  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToToday = () => setViewDate(new Date());

  // ========== クリック検知 (修正版) ==========
  const handleClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rows = 6;
    const cols = 7;
    const cellW = size.w / cols;
    const cellH = size.h / rows;

    const c = Math.floor(x / cellW);
    const r = Math.floor(y / cellH);

    const idx = r * 7 + c;
    const day = idx - startWeek + 1;

    // 範囲外なら何もしない
    if (day < 1 || day > lastDate) return;

    // その日のタスクをフィルタリング
    const dayTasks = tasks.filter(t => {
      if (!t.startDate || !t.dueDate) return false;
      const s = new Date(t.startDate);
      const e = new Date(t.dueDate);
      
      // 当月・当日が含まれているかチェック
      const currentDayDate = new Date(year, month, day);
      // 時間をリセットして日付のみで比較
      currentDayDate.setHours(0, 0, 0, 0);
      const sComp = new Date(s).setHours(0, 0, 0, 0);
      const eComp = new Date(e).setHours(0, 0, 0, 0);

      return currentDayDate >= sComp && currentDayDate <= eComp;
    });

    if (dayTasks.length === 0) return;

    const insideY = y - r * cellH;
    const baseY = cellH * 0.45;
    const h = cellH * 0.18;
    const gap = 4;

    const taskIndex = Math.floor((insideY - baseY) / (h + gap));
    if (taskIndex >= 0 && taskIndex < dayTasks.length) {
      onTaskFocus(dayTasks[taskIndex].id);
    }
  };

  // ========== Canvas 描画 ==========
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const W = size.w;
    const H = size.h;
    if (W === 0 || H === 0) return;

    ctx.clearRect(0, 0, W, H);

    const rows = 6;
    const cols = 7;
    const cellW = W / cols;
    const cellH = H / rows;

    // 枠と日付
    ctx.font = `${cellH * 0.18}px sans-serif`;
    ctx.textBaseline = "top";

    let dayNum = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;
        ctx.strokeStyle = "#aaa";
        ctx.strokeRect(x, y, cellW, cellH);

        const cellIndex = r * cols + c;
        if (cellIndex >= startWeek && dayNum <= lastDate) {
          ctx.fillStyle = "#333";
          ctx.fillText(dayNum, x + 6, y + 4);
          dayNum++;
        }
      }
    }

    // タスク描画
    const dayMap = {};
    tasks.forEach(task => {
      if (!task.startDate || !task.dueDate) return;
      const s = new Date(task.startDate);
      const e = new Date(task.dueDate);

      for (let d = 1; d <= lastDate; d++) {
        const currentCheck = new Date(year, month, d);
        // 時刻を0時0分0秒に揃える（日付比較を正確にするため）
        const checkTime = currentCheck.setHours(0,0,0,0);
        const startTime = new Date(s).setHours(0,0,0,0);
        const endTime = new Date(e).setHours(0,0,0,0);

        if (checkTime >= startTime && checkTime <= endTime) {
          if (!dayMap[d]) dayMap[d] = [];
          dayMap[d].push(task);
        }
      }
    });

    Object.keys(dayMap).forEach(dStr => {
      const d = Number(dStr);
      const dayTasks = dayMap[d];
      const idx = d + startWeek - 1;
      const r = Math.floor(idx / 7);
      const c = idx % 7;
      const x = c * cellW + 4;
      const baseY = r * cellH + cellH * 0.45;
      const w = cellW - 8;
      const h = cellH * 0.18;
      const gap = 4;

      // --------- タスク描画 (3段階の色変化を復活) ----------
      dayTasks.forEach((task, i) => {
        if (i > 2) return; // セルからはみ出さないよう制限
        const y = baseY + i * (h + gap);

        // --- 進捗色ロジックの再実装 ---
        const s = new Date(task.startDate);
        const e = new Date(task.dueDate);
        
        // タイムスタンプで総日数を計算
        const totalMs = e.getTime() - s.getTime();
        const currentMs = new Date(year, month, d).getTime() - s.getTime();
        
        // 進捗率 (0.0 〜 1.0)
        const progress = totalMs === 0 ? 1 : currentMs / totalMs;

        let color;
        if (progress < 0.33) {
          color = "rgba(100,150,255,0.35)"; // 薄い
        } else if (progress < 0.66) {
          color = "rgba(100,150,255,0.65)"; // 中くらい
        } else {
          color = "rgba(100,150,255,1.0)";  // 濃い
        }

        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = "white";
        ctx.font = `${cellH * 0.13}px sans-serif`;
        ctx.fillText(task.title.slice(0, 10), x + 6, y + 2);
      });
    });

  }, [tasks, size, viewDate]); // viewDate が変われば再描画

  return (
    <div ref={containerRef} style={{ margin: "40px auto", textAlign: "center", maxWidth: "1000px" }}>
      <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px" }}>
        <button onClick={handlePrevMonth} style={{ padding: "8px 12px", cursor: "pointer" }}>◀ 前の月</button>
        <h2 style={{ margin: 0 }}>{year}年 {month + 1}月</h2>
        <button onClick={handleNextMonth} style={{ padding: "8px 12px", cursor: "pointer" }}>次の月 ▶</button>
        <button onClick={handleToToday} style={{ padding: "8px 12px", cursor: "pointer", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px" }}>今日</button>
      </div>

      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        onClick={handleClick}
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          display: "block",
          margin: "0 auto",
          cursor: "pointer"
        }}
      />
    </div>
  );
}