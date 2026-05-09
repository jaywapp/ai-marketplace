# 플러그인 제출 가이드

## 폴더 구조

`plugins/<your-plugin-name>/` 폴더를 생성하고 아래 파일을 작성합니다.

```
plugins/my-plugin/
├── plugin.json              # 필수 — 공통 메타데이터
├── README.md                # 필수
├── .claude-plugin/
│   └── plugin.json          # platforms에 "claude" 선언 시 필수
├── .codex-plugin/
│   └── plugin.json          # platforms에 "codex" 선언 시 필수
└── .cursor-plugin/
    └── plugin.json          # platforms에 "cursor" 선언 시 필수
```

## plugin.json 스키마

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "한 줄 설명",
  "author": "your-github-username",
  "license": "MIT",
  "tags": ["tag1", "tag2"],
  "platforms": ["claude"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | ✅ | 고유 식별자 (kebab-case) |
| `version` | ✅ | semver (예: 1.0.0) |
| `description` | ✅ | 한 줄 설명 |
| `author` | ✅ | GitHub 사용자명 |
| `license` | ✅ | SPDX 식별자 (예: MIT) |
| `tags` | ✅ | 검색 태그 배열 |
| `platforms` | ✅ | 지원 플랫폼 배열 |

## 지원 플랫폼

| 값 | 폴더 | 비고 |
|---|---|---|
| `claude` | `.claude-plugin/` | Claude Code |
| `codex` | `.codex-plugin/` | OpenAI Codex |
| `cursor` | `.cursor-plugin/` | Cursor IDE |
| `mcp` | `.mcp-plugin/` | MCP 서버 |

## 검증

제출 전 로컬에서 검증 스크립트를 실행하세요.

```bash
node scripts/validate-plugin.mjs plugins/my-plugin
```

## registry.json 업데이트

플러그인 추가 후 registry.json을 재빌드합니다.

```bash
node scripts/build-registry.mjs
```

## PR 제출

1. 이 레포를 Fork
2. `plugins/<name>/` 폴더 추가
3. 검증 통과 확인 후 `registry.json` 재빌드
4. PR 생성
