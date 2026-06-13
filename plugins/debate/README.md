# debate

Claude(토론자 A)와 Codex(토론자 B)가 한 주제를 두고 **반대 입장**에서 멀티라운드
토론을 벌이고, 토론에 참여하지 않은 **중립 서브에이전트**가 판정하는 Claude Code 스킬.

아키텍처 결정, 설계 트레이드오프, 찬반 분석처럼 한쪽 모델의 자기 편향을 피하고
양측 논거를 모두 확보하고 싶을 때 사용한다.

## 전제조건

- **Codex CLI** 설치·인증: `npm install -g @openai/codex` → `codex login`
- (선택) `codex@openai-codex` 플러그인 — `/codex:*` 명령 연동

## 설치

```
/plugin marketplace add jaywapp/jaywapp-marketplace
/plugin install debate@jaywapp-marketplace
/reload-plugins
```

## 사용

```
/debate <주제> [--rounds N] [--dir <코드경로>]
```

- `--rounds` 기본 2, 최대 4
- `--dir` 코드 관련 주제일 때 대상 저장소 경로 → Codex가 직접 읽음

예시:
```
/debate 모노레포 vs 멀티레포 전환
/debate 이 모듈 구조가 타당한가 --dir ./src/auth --rounds 3
```

## 토론 기록 저장

토론 기록은 대화형 형식(🔵 Claude / 🟠 Codex / ⚖️ 판정 + 📊 토큰 사용량)으로 저장된다.

- **기본**: 현재 작업 디렉토리 `./debates/<날짜>-<슬러그>.md`에 **로컬 저장만** (push 안 함)
- **전용 저장소로 push하고 싶다면** — 아래 "토론 기록 저장소 연결" 참고

## 토론 기록 저장소 연결 (선택)

토론 기록을 전용 GitHub 저장소에 모으고 싶다면, 사용하는 환경의 `CLAUDE.md`
(또는 사용자 전역 규칙)에 저장 규칙을 추가한다. 스킬은 이 규칙을 감지해 자동으로
해당 저장소에 저장하고 commit/push한다.

예시 (`CLAUDE.md` 또는 `~/.claude/CLAUDE.md`):

```markdown
## /debate 토론 기록

`/debate` 스킬의 토론 기록은 아래 저장소에 보관한다.
- 저장소: `<로컬 경로>` (없으면 `git clone <repo-url>` 먼저)
- 위치: `debates/YYYY-MM-DD-<slug>.md` (대화형 형식)
- 종료 시: README 목차 갱신 → commit "docs: <주제> 토론 기록" → push
```

이 규칙은 **그 환경에서만** 적용되므로, 스킬 자체는 어떤 저장소에도 묶이지 않는다.

## 라이선스

MIT
