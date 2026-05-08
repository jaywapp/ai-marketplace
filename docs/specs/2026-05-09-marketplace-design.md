# AI Marketplace — 설계 문서

**작성일:** 2026-05-09  
**상태:** 확정

---

## 개요

`jaywapp/ai-marketplace`는 Claude Code 플러그인, MCP 서버, OpenAI Codex 플러그인, Cursor 확장 등 AI 도구 전반을 등록·배포하는 중앙 저장소 방식의 마켓플레이스다.

---

## 1. 레포 구조

```
ai-marketplace/
├── plugins/
│   └── <plugin-name>/              # 플러그인 단위 폴더
│       ├── plugin.json             # 마켓플레이스 공통 메타데이터
│       ├── README.md
│       ├── .claude-plugin/
│       │   └── plugin.json         # Claude Code 네이티브 스키마
│       ├── .codex-plugin/
│       │   └── plugin.json         # Codex 네이티브 스키마
│       └── .cursor-plugin/
│           └── plugin.json         # Cursor 네이티브 스키마
│
├── registry.json                   # Actions가 자동 빌드하는 통합 인덱스
│
├── cli/                            # ai-market CLI (TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── validate-plugin.yml     # PR 시 스키마 검증
│       └── build-registry.yml     # 머지 시 registry.json 빌드
│
└── CONTRIBUTING.md
```

**핵심 원칙:** 플랫폼별 폴더(`.claude-plugin/` 등)는 각 플랫폼의 네이티브 스키마를 그대로 따른다. 마켓플레이스 전용 변환 로직 없음.

---

## 2. 스키마

### 2-1. `plugin.json` (공통 메타데이터)

```json
{
  "name": "git-assistant",
  "version": "1.0.0",
  "description": "Git 작업을 AI로 자동화하는 플러그인",
  "author": "jaywapp",
  "license": "MIT",
  "tags": ["git", "productivity"],
  "platforms": ["claude", "codex"]
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `name` | ✅ | 고유 식별자 (kebab-case) |
| `version` | ✅ | semver |
| `description` | ✅ | 한 줄 설명 |
| `author` | ✅ | GitHub 사용자명 |
| `license` | ✅ | SPDX 식별자 |
| `tags` | ✅ | 검색 태그 배열 |
| `platforms` | ✅ | 지원 플랫폼 배열 (`claude`, `codex`, `cursor`, `mcp`) |

### 2-2. 플랫폼별 파일

`platforms` 배열에 선언된 플랫폼의 네이티브 폴더가 반드시 존재해야 한다. 누락 시 Actions 검증 실패.

```
platforms: ["claude", "codex"]
→ .claude-plugin/plugin.json  ✅ 필요
→ .codex-plugin/plugin.json   ✅ 필요
→ .cursor-plugin/plugin.json  (선언 안 됨, 없어도 됨)
```

---

## 3. CLI (`ai-market`)

### 배포

```bash
npm install -g @jaywapp/ai-market
```

### 명령어

```bash
ai-market search <keyword>
ai-market list --platform claude
ai-market info <plugin-name>
ai-market install <plugin-name>
ai-market install <plugin-name> --platform codex
ai-market submit <path>              # PR 생성 도우미
```

### 동작 흐름 (install)

```
ai-market install git-assistant
  → registry.json fetch (GitHub Raw, 캐시 5분)
  → 플러그인 존재 확인
  → 현재 디렉토리에서 플랫폼 자동 감지
  → 해당 플랫폼 폴더 다운로드
  → 플랫폼 기본 설치 경로에 배치
```

### 플랫폼 자동 감지

| 플랫폼 | 감지 기준 | 설치 경로 |
|--------|----------|----------|
| Claude Code | `CLAUDE.md` 또는 `.claude/` 존재 | `.claude/plugins/` |
| Codex | `.codex-plugin/` 존재 | 프로젝트 루트 |
| Cursor | `.cursor/` 존재 | `.cursor/plugins/` |

---

## 4. GitHub Actions 파이프라인

### 4-1. `validate-plugin.yml` (PR 트리거)

- `plugins/` 변경이 포함된 PR 감지
- 변경된 플러그인 폴더에서 `plugin.json` 필수 필드 검증
- `platforms` 선언 대비 네이티브 폴더 존재 여부 확인
- `README.md` 존재 여부 확인
- 실패 시 PR에 상세 코멘트 자동 작성

### 4-2. `build-registry.yml` (main 머지 트리거)

- `plugins/` 전체 순회
- 각 `plugin.json` 읽어 `registry.json` 빌드 후 커밋

### `registry.json` 구조

```json
{
  "updatedAt": "2026-05-09T00:00:00Z",
  "count": 1,
  "plugins": [
    {
      "name": "git-assistant",
      "version": "1.0.0",
      "description": "Git 작업을 AI로 자동화",
      "author": "jaywapp",
      "tags": ["git", "productivity"],
      "platforms": ["claude", "codex"],
      "path": "plugins/git-assistant"
    }
  ]
}
```

---

## 5. 플러그인 제출 워크플로우

1. `plugins/<name>/` 폴더 생성
2. `plugin.json`, `README.md`, 플랫폼별 폴더 작성
3. PR 생성 → Actions 자동 검증
4. 머지 → `registry.json` 자동 업데이트
5. CLI로 즉시 설치 가능

---

## 6. 향후 확장 고려사항 (현재 스코프 외)

- 웹 UI (정적 사이트, GitHub Pages)
- semver 버전 히스토리
- 다운로드 통계
- 평점/리뷰 시스템
