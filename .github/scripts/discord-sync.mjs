// 블로그 저장소 → 디스코드 알림
//
//   node discord-sync.mjs notice-create   고정 안내 메시지를 새로 올리고 메시지 ID를 출력
//   node discord-sync.mjs push            push로 바뀐 파일을 보고 알림 + 고정 안내 갱신
//
// 환경 변수: DISCORD_WEBHOOK_NOTICE / _WORK / _MEETING, BEFORE, AFTER, ACTOR, COMMIT_MSG
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const study = JSON.parse(readFileSync('_data/study.json', 'utf8'));
const SITE = study.links.site.replace(/\/$/, '');
const ch = (k) => `<#${study.discord.channels[k].id}>`;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

// ---------- 디스코드 ----------
async function webhook(urlEnv, { content, editId, wait }) {
  const url = process.env[urlEnv];
  if (!url) { console.log(`${urlEnv} 없음 → 건너뜀`); return null; }
  const target = editId ? `${url}/messages/${editId}` : `${url}${wait ? '?wait=true' : ''}`;
  const res = await fetch(target, {
    method: editId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.slice(0, 2000), allowed_mentions: { parse: [] } }),
  });
  if (!res.ok) throw new Error(`${urlEnv} ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// ---------- 고정 안내 ----------
function meetingLine() {
  const m = study.next_meeting;
  if (!m?.date) return '';
  const [y, mo, d] = m.date.split('-').map(Number);
  const wd = WEEKDAY[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  const link = m.page ? `\n<${SITE}/${m.page}>` : '';
  return `🎙 다음 미팅: **${m.title}** · ${mo}/${d}(${wd})${m.time ? ' ' + m.time : ''}${link}\n\n`;
}

export function noticeText() {
  const L = study.links;
  return [
    `📌 **${study.title} 안내**`,
    '',
    meetingLine() +
    `📒 **사이트** (일정 · 커리큘럼 · 블로그)\n<${L.site}>`,
    `✏️ **사이트 원본** (수정 · 삭제 · 글쓰기)\n<${L.blog_repo}>`,
    `❓ **질문 · 할 일** (GitHub 초대 수락 후 보여요)\n<${L.issues}>`,
    '',
    '🙋 **GitHub 초대 받기**',
    `${ch('invite')} 채널에서 \`@${study.discord.bot}\` 태그 + GitHub 아이디`,
    `예) @${study.discord.bot} octocat`,
    '→ 두 저장소에 초대가 가요. GitHub 메일에서 **수락**하면 끝!',
    '',
    '**채널**',
    `${ch('resources')} 자료 · ${ch('question')} 질문 · ${ch('meeting')} 미팅 일정 · ${ch('work')} 진행 공유 · ${ch('free')} 자유 대화`,
    '',
    `-# 사이트의 \`_data/study.json\`이 바뀌면 자동으로 갱신돼요 · ${ch('question')}에서 메시지에 📌를 누르면 GitHub 질문으로 등록돼요`,
  ].join('\n');
}

// ---------- 바뀐 파일 → 페이지 정보 ----------
function frontMatter(path) {
  if (!existsSync(path)) return {};
  const m = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  for (const line of (m?.[1] ?? '').split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

function pageUrl(path) {
  const post = path.match(/^_posts\/(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (post) return `${SITE}/blog/${post[1]}/${post[2]}/${post[3]}/${post[4]}/`;
  const p = path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '/');
  return `${SITE}/${p}`;
}

function changedFiles(before, after) {
  if (!before || /^0+$/.test(before)) return [];
  const out = execFileSync('git', ['diff', '--name-status', '--no-renames', before, after], { encoding: 'utf8' });
  return out.trim().split('\n').filter(Boolean).map(l => {
    const [status, path] = l.split('\t');
    return { status, path };
  });
}

async function onPush() {
  const files = changedFiles(process.env.BEFORE, process.env.AFTER);
  const actor = process.env.ACTOR || '누군가';
  const commit = (process.env.COMMIT_MSG || '').split('\n')[0];
  if (/\[skip discord\]/i.test(process.env.COMMIT_MSG || '')) { console.log('skip discord'); return; }

  const line = (f) => {
    const fm = frontMatter(f.path);
    const title = fm.title || f.path;
    return `- [${title}](<${pageUrl(f.path)}>)${fm.author ? ` — ${fm.author}` : ''}`;
  };
  const isPage = (p) => p.endsWith('.md') && !p.endsWith('/index.md') && p !== 'README.md';
  const live = files.filter(f => f.status !== 'D' && isPage(f.path));

  const posts = live.filter(f => f.status === 'A' && f.path.startsWith('_posts/'));
  const meetings = live.filter(f => f.path.startsWith('meetings/'));
  const tracks = live.filter(f => f.path.startsWith('tracks/'));
  const main = live.filter(f => /^(curriculum\.md|members\.md|guides\/|resources\/)/.test(f.path));
  const tail = commit ? `\n> ${commit}` : '';
  const soon = '\n-# 사이트 반영까지 1~2분 걸려요';

  if (posts.length) await webhook('DISCORD_WEBHOOK_WORK', { content: `📝 **새 블로그 글**\n${posts.map(line).join('\n')}${soon}` });
  if (tracks.length) await webhook('DISCORD_WEBHOOK_WORK', { content: `🛠 **개인 프로젝트 업데이트** — ${actor}\n${tracks.map(line).join('\n')}${tail}${soon}` });
  if (meetings.length) await webhook('DISCORD_WEBHOOK_MEETING', { content: `📅 **미팅 페이지 업데이트** — ${actor}\n${meetings.map(line).join('\n')}${tail}${soon}` });
  if (main.length) await webhook('DISCORD_WEBHOOK_NOTICE', { content: `📄 **사이트 업데이트** — ${actor}\n${main.map(line).join('\n')}${tail}${soon}` });

  if (files.some(f => f.path === '_data/study.json')) {
    const id = study.discord.notice_message_id;
    if (id) {
      await webhook('DISCORD_WEBHOOK_NOTICE', { content: noticeText(), editId: id });
      console.log('고정 안내 갱신');
    }
    const prev = (() => {
      try { return JSON.parse(execFileSync('git', ['show', `${process.env.BEFORE}:_data/study.json`], { encoding: 'utf8' })).next_meeting; }
      catch { return null; }
    })();
    if (prev && JSON.stringify(prev) !== JSON.stringify(study.next_meeting)) {
      await webhook('DISCORD_WEBHOOK_MEETING', { content: meetingLine().trim() || '📅 다음 미팅 정보가 바뀌었어요' });
    }
  }
}

const mode = process.argv[2];
if (mode === 'notice-create') {
  const msg = await webhook('DISCORD_WEBHOOK_NOTICE', { content: noticeText(), wait: true });
  console.log(`NOTICE_MESSAGE_ID=${msg?.id ?? ''}`);
} else if (mode === 'notice-preview') {
  console.log(noticeText());
} else {
  await onPush();
}
