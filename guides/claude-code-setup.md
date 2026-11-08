---
title: Claude Code 설치
parent: 가이드
nav_order: 1
---

# 🖥 Claude Code 설치 가이드

> 킥오프 직후 설치 세션에서 같이 합니다. 막히면 화면 공유로 같이 풀어요.

## 준비물

- **Claude Pro 이상 구독** (월 20달러). 무료 플랜으로는 Claude Code를 쓸 수 없습니다.
- 맥(macOS 13 이상) 또는 윈도우(Windows 10 1809 이상) 노트북

## 1. 설치

### 맥

터미널을 열고:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### 윈도우

1. **Git for Windows** 설치: https://git-scm.com/downloads/win (권장 — 있으면 Claude Code가 Bash를 써서 맥과 거의 같은 환경이 됩니다)
2. **PowerShell**을 열고 (프롬프트가 `PS C:\`로 시작):

```powershell
irm https://claude.ai/install.ps1 | iex
```

- 관리자 권한은 필요 없습니다.
- **WSL은 설치하지 않아도 됩니다.**
- 대신 `winget install Anthropic.ClaudeCode`로 설치해도 됩니다 (이 경우 자동 업데이트가 안 되니 가끔 `winget upgrade Anthropic.ClaudeCode`).

## 2. 확인

**새 터미널 창**을 열고:

```bash
claude --version
claude doctor
```

버전 번호가 나오면 성공입니다.

| 증상 | 해결 |
|---|---|
| `claude`를 찾을 수 없다고 나옴 | 새 터미널 창을 다시 열기 (설치 경로가 아직 반영 안 된 것) |
| `'irm' is not recognized` | CMD에서 실행한 것 → PowerShell에서 다시 |
| `The token '&&' is not a valid statement separator` | PowerShell에서 CMD용 명령을 실행한 것 → 위 PowerShell 명령 사용 |

## 3. 로그인 · 첫 실행

```bash
mkdir my-agent
cd my-agent
claude
```

처음 실행하면 브라우저가 열리고 Claude 계정으로 로그인합니다. 로그인 후 아무 말이나 걸어서 답이 오면 끝.

## 4. 첫 지시 파일

프로젝트 폴더에 `CLAUDE.md`를 만들면 Claude Code가 매번 읽는 지시가 됩니다.

```markdown
# 이 프로젝트
- 목적: (한 줄)
- 답변은 한국어로
- 결과물은 이 폴더 안에 마크다운 파일로 저장
```

Codex도 같이 쓸 거라면 지시는 `AGENTS.md`에 쓰고, `CLAUDE.md`에는 `@AGENTS.md` 한 줄만 두면 두 도구가 같은 지시를 공유합니다.

## 막히면

- **Claude 데스크톱 앱**으로 시작해도 됩니다 (https://claude.com/download). CLI와 같은 설정 폴더(`~/.claude/`)를 써서 나중에 CLI로 그대로 넘어올 수 있습니다.
- 공식 문서: https://code.claude.com/docs/en/setup

## 참고: WSL이 필요한 경우

처음에는 필요 없습니다. 아래 경우에만 WSL2로 옮기면 됩니다.

1. 명령 실행을 격리하는 **샌드박스 기능**을 쓰고 싶을 때 (윈도우 기본 환경은 미지원)
2. tmux · Docker 같은 **리눅스 전용 도구**를 쓸 때
3. **Codex CLI**를 쓸 때 (윈도우에서는 Codex 앱 권장)
