---
title: AI 하나로 다 하기 (작업 공간 세팅)
parent: 가이드
nav_order: 4
---

# 🧠 AI 하나로 다 하기 — 내 작업 공간 세팅

> **목표**: 사이트나 GitHub에 들어가지 않고, **Claude Code에 말로 지시해서** 글 쓰기 · 할 일 확인 · 질문 · 진행 공유를 다 하기.
> 킥오프에서 말한 「AI OS」의 첫 버전이에요. 한 번 세팅하는 데 30분~1시간이면 됩니다.

## 전체 그림

```
              나 (말로 지시)
                   │
             Claude Code ──── CLAUDE.md (나는 누구 · 규칙)
              │         │
             git        gh (GitHub CLI)
              │         │
      사이트 저장소      질문 · 할 일 이슈
              │         │
         사이트 반영      │
              └─── 디스코드 자동 알림 ───┘
```

이 세팅이 킥오프 때 본 **에이전트 4요소** 그대로예요.

| 4요소 | 이 세팅에서 |
|---|---|
| 모델 | Claude (기본 Sonnet — [20달러 원칙](usage-principles.md)) |
| 지시 · 컨텍스트 | `CLAUDE.md` — 나는 누구 · 저장소 주소 · 지킬 규칙 |
| 도구 | `git`(파일 기록 · 올리기) · `gh`(이슈 다루기) |
| 반복 · 검증 | 바뀐 내용 보여주기 → 내가 확인 → 올리기 → 사이트 · 디스코드에서 결과 확인 |

디스코드는 직접 연결하지 않아도 돼요. 사이트나 이슈가 바뀌면 GitHub이 알아서 디스코드에 알려줍니다.

## 1. 도구 설치

| 도구 | 윈도우 (PowerShell) | 맥 (터미널) |
|---|---|---|
| Claude Code | [설치 가이드](claude-code-setup.md) | [설치 가이드](claude-code-setup.md) |
| Git | [Git for Windows](https://git-scm.com/downloads/win) (Claude Code 설치 때 했으면 넘어가기) | `git --version` 입력 → 없으면 설치 창이 뜸 |
| GitHub CLI (`gh`) | `winget install --id GitHub.cli` | `brew install gh` (Homebrew가 없으면 [cli.github.com](https://cli.github.com/)) |

설치가 끝나면 **새 터미널 창**을 열고 확인:

```bash
claude --version
git --version
gh --version
```

## 2. GitHub 로그인

> 먼저 디스코드 **#🙋github-초대**에서 초대를 받고 **수락**해두세요. 수락 전에는 글을 올릴 수 없어요.

터미널에서 직접:

```bash
gh auth login
```

| 물어보는 것 | 고를 것 |
|---|---|
| Where do you use GitHub? | `GitHub.com` |
| Preferred protocol for Git operations? | `HTTPS` |
| Authenticate Git with your GitHub credentials? | `Yes` |
| How would you like to authenticate? | `Login with a web browser` → 화면의 코드를 브라우저에 붙여넣기 |

`gh auth status`에 `Logged in`이 나오면 성공.

## 3. 작업 폴더 만들기

```bash
mkdir study
cd study
gh repo clone Dominic-DK/agent-study-blog
claude
```

```
study/
├── CLAUDE.md              ← 내 지시 파일 (다음 단계에서 만들기)
└── agent-study-blog/      ← 사이트 원본 (방금 받은 것)
```

`CLAUDE.md`는 사이트 저장소 **밖**에 두는 거라 공개되지 않아요. 내 정보와 규칙을 편하게 적어도 됩니다.

Claude가 열리면 처음 한 번 이렇게 말하세요.

> 「git 사용자 이름이랑 이메일 설정해줘. 이메일은 내 GitHub noreply 주소로 (공개 저장소라 진짜 이메일은 안 보이게)」

## 4. 지시 파일 `CLAUDE.md`

`study/CLAUDE.md`에 아래를 복사해서 `우주` · 아이디 부분만 바꾸세요. Claude에게 「아래 내용으로 CLAUDE.md 만들어줘」라고 붙여넣어도 돼요.

```markdown
# 나와 이 폴더
- 나: 우주 (AI Agent 스터디 멤버, GitHub 아이디: ____)
- 답변은 한국어로, 쉬운 말로. 명령을 실행하기 전에 무엇을 왜 하는지 한 줄로 설명
- 이 폴더는 스터디 작업 공간

# 저장소
- 사이트 원본: ./agent-study-blog (공개 — https://dominic-dk.github.io/agent-study-blog/)
- 질문 · 할 일: GitHub Issues `Dominic-DK/agent-study` (비공개), gh로 다룸
  - 내 할 일: gh issue list -R Dominic-DK/agent-study --label 우주 --state open
  - 다 같이 할 일: --label 전체
  - 질문 올리기: 라벨 `질문`, 제목 앞에 [질문]

# 규칙
- 사이트는 인터넷에 공개돼 있음 → 실명 · 연락처 · 회사 내부 정보는 쓰지 않기
- 파일을 고친 뒤에는 바뀐 내용을 보여주고, 내가 확인한 다음에 올리기
- 올릴 때: 최신 내용 먼저 받기(pull) → 커밋 메시지는 한국어 한 줄 → push
- 블로그 글: agent-study-blog/_posts/YYYY-MM-DD-영어제목.md, 맨 위에 title · author
- 할 일 이슈를 닫을 땐 결과를 한 줄 댓글로 남기고 닫기
- push --force, reset --hard처럼 기록을 지우는 명령은 쓰지 않기
- 비밀번호 · 토큰은 파일에 쓰지 않기
```

## 5. 이렇게 말해보기

| 하고 싶은 것 | Claude에게 | Claude가 하는 일 | 디스코드 알림 |
|---|---|---|---|
| 내 할 일 보기 | 「이번 주 내 할 일 보여줘」 | `gh issue list …` | — |
| 할 일 끝내기 | 「#30 끝났어. 가입 완료라고 남기고 닫아줘」 | `gh issue close 30 -c "…"` | — |
| 질문하기 | 「도미닉님께 질문 올려줘: …」 | `gh issue create --label 질문` | #❓질문 |
| 페이지 고치기 | 「내 프로젝트 페이지 목표 칸 채우는 거 도와줘」 | 파일 수정 → 확인 → 커밋 · 푸시 | #🛠작업공유 |
| 블로그 글 쓰기 | 「이번 주 진행 로그 글 써줘」 | `_posts/`에 새 파일 → 확인 → 커밋 · 푸시 | #🛠작업공유 |
| 남이 바꾼 것 받기 | 「사이트 최신 내용 받아줘」 | `git pull` | — |

올린 뒤 1~2분 지나서 사이트와 디스코드를 열어 **결과를 직접 확인**하세요. 시키고 → 확인하고 → 고쳐달라고 하는 이 반복이 4요소의 「반복 · 검증」이에요.

## 허락 묻는 창

Claude는 명령을 실행하거나 파일을 고치기 전에 허락을 물어봐요.

- 처음엔 내용을 읽고 하나씩 허락하기 → 어떤 명령이 왜 쓰이는지 익숙해져요
- `gh issue list`처럼 읽기만 하는 명령은 「다시 묻지 않기」를 골라도 괜찮아요
- `git push`는 매번 확인하는 걸 추천해요

## 사용량 아끼기

- `/model`에서 **Sonnet**인지 확인 (이 정도 작업은 Sonnet으로 충분)
- 작업 하나가 끝나면 `/clear`로 대화를 비우고 다음 작업
- 자세히: [20달러 플랜에서 쓰는 원칙](usage-principles.md)

## 다음 단계 (미리보기)

지금은 **내가 Claude를 켜야** 움직여요. 앞으로 이렇게 넓혀갑니다.

1. 자주 하는 지시를 **스킬**로 저장 → 「주간 로그 써줘」 한마디로 같은 절차 반복
2. 이슈가 생기면 **알아서 깨어나는** 에이전트 (웹훅 · 주기적 확인) → 상시 프로세스
