---
name: debate
description: Use when the user wants two AI models (Claude and Codex) to debate a topic from opposing positions before making a decision — architecture choices, design trade-offs, pro/con analysis. Triggers - "토론", "/debate", "debate", "찬반", "양쪽 입장", "devil's advocate".
---

# /debate — Claude ↔ Codex 멀티라운드 토론

## Overview

Claude(토론자 A)와 Codex(토론자 B)가 공유 transcript 파일 위에서 구조화된 토론을 진행하고, 토론에 참여하지 않은 새 서브에이전트가 판정한다. Codex 쪽은 `codex exec resume`으로 세션을 유지하므로 라운드마다 transcript 전체를 재전송하지 않는다.

토론 기록은 **대화형 형식**으로 저장한다. 저장 위치와 공유(commit/push) 여부는
환경 설정에 따른다 — 아래 "토론 기록 저장 위치" 참고.

## 전제조건

- **Codex CLI**가 설치·인증돼 있어야 한다 (`codex exec` 사용).
  미설치 시 `npm install -g @openai/codex` 후 `codex login`.
- (선택) `codex@openai-codex` 플러그인이 있으면 `/codex:*` 명령도 함께 쓸 수 있다.

## 사용법

```
/debate <주제> [--rounds N] [--dir <코드경로>]
```
- `rounds` 기본 2, 최대 4 (LLM 토론은 3라운드 이후 수렴함)
- 코드 관련 주제면 `--dir`로 대상 저장소 지정 → Codex가 `-C <dir>`로 직접 읽음

## 절차

1. **저장 위치 결정**: 아래 "토론 기록 저장 위치" 규칙에 따라
   transcript 파일 경로를 정하고 헤더(날짜·라운드·입장)를 작성한다.
2. **입론 (Claude)**: A 입장 옹호 논거 최대 3개, 500자 이내. transcript에 append.
3. **Codex 첫 호출**:
   ```bash
   codex exec --skip-git-repo-check --json -o "$TMP" "$PROMPT" > "$EVENTS" 2>/dev/null
   grep -o '"thread_id":"[^"]*"' "$EVENTS" | head -1
   ```
   - **stdout을 head로 직접 파이프하지 말 것** — 파이프가 일찍 닫히면 codex가 SIGPIPE로
     중단된다(exit 1, 출력 파일 미생성). 반드시 파일로 받은 뒤 파싱.
   - `thread.started` 이벤트의 **thread_id를 transcript 헤더에 기록** (이후 resume에 필수)
   - `$PROMPT` = 아래 역할 템플릿 + 주제 + Claude 입론
   - 코드 주제면 `-C <dir>` 추가
   - `$TMP` 내용을 transcript에 append
4. **라운드 반복** (rounds만큼):
   - Claude 반박 작성 → append
   - `codex exec resume $THREAD_ID --skip-git-repo-check --json -o "$TMP" "<Claude 반박만 전달>" > "$EVENTS" 2>/dev/null` → append
   - **resume에도 `--json`을 붙여** `turn.completed` 이벤트의 usage를 매 호출 수집
5. **판정**: Agent 도구로 **새 서브에이전트** 스폰(토론 이력 없이 transcript 파일만 읽게 함).
   출력: ① 합의점 ② 남은 대립점 ③ 판정 + 근거 ④ 실행 권고. transcript에 append.
   Agent 결과의 `subagent_tokens`도 기록.
6. **토큰 사용량 표**: transcript 말미에 호출별 usage 기록 —
   Codex는 `turn.completed`의 input/cached/output, 판정자는 `subagent_tokens`,
   Claude 메인 세션은 측정 불가로 표기.
7. **저장·공유**: "토론 기록 저장 위치" 규칙에 따라 처리.
8. **보고**: 사용자에게 판정 요약 전달.

## 토론 기록 저장 위치

저장 동작은 **환경 규칙**에 의해 결정된다. 다음 순서로 판단한다:

1. **환경에 토론 기록 규칙이 정의돼 있으면 그것을 따른다.**
   현재 컨텍스트(작업 디렉토리의 `CLAUDE.md`/`AGENTS.md`, 또는 사용자 전역 규칙)에
   "`/debate` 기록을 저장할 저장소 경로와 commit/push 여부"가 명시돼 있으면,
   그 규칙대로 저장소에 기록하고 README 목차 갱신 + commit + push까지 수행한다.
2. **규칙이 없으면 로컬 저장만 한다.**
   현재 작업 디렉토리에 `./debates/YYYY-MM-DD-<slug>.md`로 저장한다.
   **commit·push하지 않는다** — 사용자에게 파일 경로만 안내한다.

> 이 스킬은 특정 저장소에 묶이지 않는다. 토론 기록을 전용 저장소로 push하고 싶다면
> 환경 규칙(예: 사용자 `CLAUDE.md`)에 저장소 경로와 push 절차를 정의하라.
> README의 "토론 기록 저장소 연결" 참고.

## 대화형 기록 형식

```markdown
# <주제>

> YYYY-MM-DD · N라운드 · **판정: ...**
> 🔵 **A — Claude** (입장) vs 🟠 **B — Codex** (입장)
> Codex thread: `<thread_id>`

🔵 **Claude** (입론)
> ...

🟠 **Codex**
> ... / **양보:** ... / **새 논거:** ...

(라운드 반복)

## ⚖️ 판정 (중립 서브에이전트)
...

## 📊 토큰 사용량
| 호출 | input | (cached) | output | 비고 |
```

## 형식 규칙 (양측 프롬프트에 반드시 포함)

- 상대 주장 중 **가장 약한 것 1개**를 지목해 공격
- 동의하는 부분은 `양보:`로 명시
- 새 논거는 라운드당 1개만
- 라운드당 500자 이내 (사용자 언어에 맞춤)

## Codex 역할 프롬프트 템플릿

```
너는 토론자 B다. 다음 주제에 대해 토론자 A와 반대 입장을 옹호하라.
전면 동의 금지 — 악마의 변호인 역할을 끝까지 유지하라.
규칙: (1) A의 가장 약한 주장 1개를 지목·반박 (2) 동의하는 부분은 "양보:"로 명시
(3) 새 논거는 라운드당 1개 (4) 500자 이내 (5) 사용자 언어로 작성.

[주제] ...
[토론자 A의 입론] ...
```

## Common Mistakes

| 실수 | 결과 / 해결 |
|------|------------|
| thread_id 캡처 누락 | resume 불가 → 매번 transcript 재전송으로 토큰 낭비. `--json`의 `thread.started`에서 반드시 파싱 |
| 토론자 A(현재 세션)가 판정까지 작성 | 자기편 편향. 반드시 새 컨텍스트 서브에이전트로 판정 |
| 역할 비대칭 없이 "토론해라"만 지시 | 2라운드 만에 상호 동의로 수렴. 악마의 변호인 강제 필수 |
| 라운드 과다 (5+) | 새 논거 고갈, 토큰만 소모. 기본 2 유지 |
| git 저장소 밖에서 `--skip-git-repo-check` 누락 | codex exec 즉시 실패 |
| `--json` stdout을 `head`로 직접 파이프 | SIGPIPE로 codex 중단(exit 1, `-o` 파일 미생성). 파일로 받은 뒤 파싱 |
| 저장소 규칙 없는데 임의 저장소로 push | 규칙 없으면 로컬 저장만. push는 환경 규칙이 있을 때만 |
