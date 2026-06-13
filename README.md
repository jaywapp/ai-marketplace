# jaywapp-marketplace

Claude Code 플러그인, MCP 서버, OpenAI Codex 플러그인, Cursor 확장 등 AI 도구를 등록하고 공유하는 마켓플레이스입니다.

## 등록된 플러그인

| 플러그인 | 설명 |
|---------|------|
| [claude-skills](plugins/claude-skills) | 개인용 Claude Code 스킬 라이브러리 |
| [qa-workflow](plugins/qa-workflow) | QA 리포트 → 코드 수정 → GitHub PR 자동화 워크플로우 |
| [debate](plugins/debate) | Claude ↔ Codex 멀티라운드 토론 + 중립 판정 |

## 구조

```
jaywapp-marketplace/
├── plugins/              # 플러그인 저장소
│   └── <plugin-name>/
│       ├── plugin.json         # 공통 메타데이터
│       ├── README.md
│       ├── .claude-plugin/     # Claude Code 설정
│       ├── .codex-plugin/      # Codex 설정
│       └── .cursor-plugin/     # Cursor 설정
├── registry.json         # 전체 플러그인 인덱스
└── scripts/
    ├── validate-plugin.mjs   # 플러그인 스키마 검증
    └── build-registry.mjs    # registry.json 빌드
```

## 플러그인 등록

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.

## 스크립트

```bash
# 플러그인 검증
node scripts/validate-plugin.mjs plugins/<name>

# registry.json 재빌드
node scripts/build-registry.mjs
```
