# mcp-plugin-template

Claude Code와 Codex에서 공유 가능한 MCP 서버 플러그인 템플릿입니다.

## 구조

```
mcp-plugin-template/
├── .claude-plugin/
│   └── plugin.json       # Claude Code 플러그인 매니페스트
├── .codex-plugin/
│   └── plugin.json       # Codex 플러그인 매니페스트
├── .mcp.json             # Claude Code용 MCP 서버 설정
├── .codex.mcp.json       # Codex용 MCP 서버 설정
└── src/
    └── index.js          # MCP 서버 구현 (양쪽 플랫폼 공유)
```

## 사용 방법

### 1. 템플릿 복사

```bash
cp -r plugin-templates/mcp-plugin-template plugins/my-mcp-plugin
```

### 2. TODO 항목 수정

아래 파일의 `[TODO: ...]` 부분을 채워넣습니다.

- `.claude-plugin/plugin.json` — `name`, `author`, `homepage`, `repository`
- `.codex-plugin/plugin.json` — 동일 항목 + `interface.developerName`, `interface.websiteURL` 등

### 3. MCP 서버 구현

`src/index.js`에 MCP 서버 로직을 작성합니다.

```js
// src/index.js 예시
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer({ name: 'my-mcp-plugin', version: '1.0.0' });

server.tool('my-tool', '도구 설명', {}, async () => {
  return { content: [{ type: 'text', text: 'Hello!' }] };
});

server.run();
```

## 플랫폼별 MCP 설정 차이

| 파일 | 플랫폼 | `command` args |
|------|--------|----------------|
| `.mcp.json` | Claude Code | `${CLAUDE_PLUGIN_ROOT}/src/index.js` |
| `.codex.mcp.json` | Codex | `./src/index.js` |

Claude Code는 `${CLAUDE_PLUGIN_ROOT}` 변수로 플러그인 루트를 참조하고, Codex는 상대 경로를 사용합니다.

## 마켓플레이스 등록

`plugin.json`을 루트에 추가하고 [CONTRIBUTING.md](../../CONTRIBUTING.md)를 참고해 PR을 제출하세요.
