// =====================================================================
// 구글 시트 연결 (기록 저장 + 순위표) — 모든 게임이 같이 씀
//   SHEET_API: Apps Script '웹 앱 URL' (apps-script/Code.gs 참고)
//   비워 두면 시트 전송·순위표 없이 게임만 동작해요.
// =====================================================================
export const SHEET_API = "";

export function sendToSheet(payload) {
  if (!SHEET_API) return;
  // text/plain + no-cors: 브라우저의 사전 확인 요청 없이 Apps Script로 바로 전송
  fetch(SHEET_API, {
    method: "POST", mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  }).catch(e => console.warn("시트 전송 실패", e));
}

export async function fetchBoard(game, room, limit = 10) {
  if (!SHEET_API) return null;
  const u = `${SHEET_API}?game=${encodeURIComponent(game)}&room=${encodeURIComponent(room || "")}&limit=${limit}`;
  const r = await fetch(u);
  const j = await r.json();
  return j.board || [];
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 게임 화면 오른쪽 아래 '🏆 순위표' 버튼 + 펼쳐지는 순위 패널
export function setupLeaderboard(game, getInfo) {
  if (!SHEET_API) return;
  const tools = document.getElementById("tools");
  const btn = document.createElement("button");
  btn.textContent = "🏆 순위표";
  tools.prepend(btn);
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;right:12px;bottom:52px;z-index:6;width:300px;max-height:70vh;overflow:auto;" +
    "background:#fff;border:1px solid #dde1ea;border-radius:16px;box-shadow:0 10px 30px rgba(40,50,80,.18);" +
    "padding:16px 18px;display:none;font-family:inherit;color:#26262e";
  document.body.appendChild(box);
  let timer = null;
  async function refresh() {
    const { room, nickname } = getInfo();
    try {
      const board = await fetchBoard(game, room, 10);
      const rows = (board || []).map((b, i) => {
        const me = b.nickname === nickname;
        const medal = ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;
        return `<div style="display:flex;justify-content:space-between;padding:7px 4px;border-bottom:1px solid #eef0f4;${me ? "background:#f3eefe;font-weight:700;" : ""}">
          <span>${medal} ${escapeHtml(b.nickname)}</span><span style="color:#d99a00">${b.xp} XP</span></div>`;
      }).join("") || `<div style="color:#888;padding:8px 0">아직 기록이 없어요.</div>`;
      box.innerHTML = `<div style="font-weight:700;font-size:18px;margin-bottom:8px">🏆 ${room ? escapeHtml(room) + " " : ""}순위표</div>${rows}
        <div style="color:#999;font-size:12px;margin-top:8px">단계를 마칠 때마다 반영돼요 · 8초마다 새로고침</div>`;
    } catch (e) {
      box.innerHTML = `<div style="color:#e23b3b">순위표를 불러오지 못했어요.</div>`;
    }
  }
  btn.addEventListener("click", () => {
    const show = box.style.display === "none";
    box.style.display = show ? "block" : "none";
    clearInterval(timer);
    if (show) { box.innerHTML = "불러오는 중…"; refresh(); timer = setInterval(refresh, 8000); }
  });
}
