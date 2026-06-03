---
name: qa-report
description: QA 리포트 파일을 파싱해 D:\workspace\{project}\qa\{project}_QA_report.md 로 저장하고 요약을 출력한다. qa 스킬 내부에서 호출된다.
---

# qa-report 스킬 — 리포트 파싱 & 저장

## 입력

- `{project}`: 프로젝트명
- `{input_file}`: QA 리포트 원본 파일 경로

## 처리 절차

1. **저장 디렉토리 생성** — `D:\workspace\{project}\qa\` 가 없으면 Bash로 생성한다

```bash
mkdir -p "D:/workspace/{project}/qa"
```

2. **원본 파일 Read** — `{input_file}` 을 Read 도구로 읽는다

3. **구조화 저장** — 아래 형식으로 `D:\workspace\{project}\qa\{project}_QA_report.md` 에 Write한다

저장 형식:
```markdown
# {project} QA 리포트

> 원본 파일: {input_file}
> 저장 일시: {YYYY-MM-DD}

---

{원본 내용 그대로}
```

4. **요약 출력** — 리포트 내용을 분석해 아래 형식으로 출력한다

```
✅ QA 리포트 저장 완료: D:\workspace\{project}\qa\{project}_QA_report.md

📊 요약
  🔴 버그: N건
  🟡 UI/UX 개선: N건
  🟢 기타: N건
```

버그/UI/기타 건수는 리포트 내 항목을 카운트해 채운다. 명확히 분류하기 어려운 항목은 기타로 분류한다.
