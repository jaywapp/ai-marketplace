name: qa-tasks
description: QA 리포트를 기반으로 TODO 목록을 생성하고, superpowers:subagent-driven-development로 태스크를 실행한 뒤 GitHub PR을 생성한다. qa 스킬 내부에서 호출된다.
---

# qa-tasks 스킬 — TODO 생성 & 실행 & PR

## 입력

- `{project}`: 프로젝트명
- `{qa_report_path}`: `D:\workspace\{project}\qa\{project}_QA_report.md`

## 처리 절차

### 1. TODO 파일 생성

`{qa_report_path}` 를 Read하고 아래 형식으로 `D:\workspace\{project}\qa\{project}_TODO.md` 에 Write한다.

저장 형식:

```
# {project} TODO (QA 기반)

> 출처: `{project}_QA_report.md` (저장 일시: {YYYY-MM-DD})

---

## 🔴 버그 수정

### [BUG-N] {버그 제목} `심각도: {높음|중간|낮음}`
- **위치**: {화면/기능}
- **현상**: {재현 증상}
- **기대 동작**: {정상 동작}

---

## 🟡 UI/UX 개선

### [UI-N] {개선 항목}
- **현상**: {현재 상태}
- **개선안**: {제안}

---

## 🟢 기타

### [ETC-N] {항목}
- **내용**: {설명}
```

버그는 심각도 높음 → 중간 → 낮음 순서로 정렬한다.

### 2. TODO 요약 출력

```
✅ TODO 저장 완료: D:\workspace\{project}\qa\{project}_TODO.md

📋 태스크 목록
  🔴 [BUG-1] {제목}
  🔴 [BUG-2] {제목}
  🟡 [UI-1] {제목}
  🟢 [ETC-1] {제목}

총 N개 태스크를 서브에이전트로 실행합니다.
```

### 3. 서브에이전트 실행

`superpowers:subagent-driven-development` 스킬을 호출한다.
- plan 파일: `D:\workspace\{project}\qa\{project}_TODO.md`
- 각 태스크를 독립 서브에이전트로 실행
- 태스크 완료 후 커밋

### 4. GitHub PR 생성

모든 태스크 완료 후 아래 명령으로 PR을 생성한다.

```bash
cd "D:/workspace/{project}"
gh pr create \
  --title "fix: QA {YYYY-MM-DD} 반영" \
  --body "$(cat <<'EOF'
## QA 반영 내역

> 기반 리포트: `qa/{project}_QA_report.md`

### 처리된 태스크

- [x] [BUG-1] {제목}
- [x] [UI-1] {제목}

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

### 5. 완료 보고

```
🎉 QA 워크플로우 완료

📌 PR: {PR URL}
✅ 처리된 태스크: N개
  - [BUG-1] {제목}
  - [UI-1] {제목}
```

---
