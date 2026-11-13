/**
 * Move to Learn AI — 게임 기록 수집 + 순위표 (Google Apps Script)
 *
 * 설치 방법
 *  1) 구글 시트를 새로 만든다.
 *  2) 확장 프로그램 → Apps Script → 이 코드를 전부 붙여넣고 저장.
 *  3) 배포 → 새 배포 → 유형: 웹 앱
 *       - 실행 사용자: 나
 *       - 액세스 권한이 있는 사용자: 모든 사용자
 *     → 배포 → 권한 승인 → 나오는 '웹 앱 URL'을 복사.
 *  4) 그 URL을 common/sheet.js 의 SHEET_API 에 넣는다.
 *
 * 시트 구성 (자동 생성)
 *  - fruit_log / knn_log : 게임별 상세 기록 (연구용, 학번 포함)
 *  - scores              : 단계가 끝날 때마다의 누적 XP (순위표용)
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (d.kind === 'score') {
      appendRow_(ss, 'scores', {
        time: new Date(), game: d.game, room: d.room, nickname: d.nickname,
        player: d.player, condition: d.condition, stage: d.stage, xp: d.xp,
      });
    } else {
      appendRow_(ss, String(d.game || 'game') + '_log', d.row || {});
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** 순위표: ?game=fruit&room=1-7&limit=10  → 닉네임별 최고 XP (학번은 내보내지 않음) */
function doGet(e) {
  const p = e.parameter || {};
  const game = String(p.game || '').trim();
  const room = String(p.room || '').trim();
  const limit = Number(p.limit) || 10;
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('scores');
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, board: [] });

  const v = sh.getDataRange().getValues();
  const h = v[0];
  const col = k => h.indexOf(k);
  const best = {};
  for (let i = 1; i < v.length; i++) {
    const r = v[i];
    if (game && String(r[col('game')]) !== game) continue;
    if (room && String(r[col('room')]) !== room) continue;
    const nick = String(r[col('nickname')] || '익명');
    const xp = Number(r[col('xp')]) || 0;
    if (!best[nick] || xp > best[nick].xp) best[nick] = { nickname: nick, xp: xp, stage: String(r[col('stage')]) };
  }
  const board = Object.keys(best).map(k => best[k]).sort((a, b) => b.xp - a.xp).slice(0, limit);
  return json_({ ok: true, board: board });
}

function appendRow_(ss, name, row) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  const header = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  Object.keys(row).forEach(k => { if (header.indexOf(k) < 0) header.push(k); });
  sh.getRange(1, 1, 1, header.length).setValues([header]);
  // 글자는 앞에 ' 를 붙여 그대로 저장 ('1-7'이 날짜로 바뀌거나 '=' 수식이 실행되는 것 방지)
  sh.appendRow(header.map(k => {
    const val = row[k];
    if (val === undefined || val === null) return '';
    return typeof val === 'string' ? "'" + val : val;
  }));
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
