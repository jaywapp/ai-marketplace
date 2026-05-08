# AI Marketplace MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub 중앙 저장소 기반 AI 플러그인 마켓플레이스 + CLI 도구 MVP 구축

**Architecture:** `plugins/<name>/` 폴더에 플러그인을 저장하고 PR 시 GitHub Actions가 스키마를 검증한다. main 머지 시 `registry.json`이 자동 빌드되며, CLI(`ai-market`)는 이 JSON을 fetch해 검색·설치를 제공한다.

**Tech Stack:** TypeScript, Node.js 20+, Commander.js, Vitest, GitHub Actions

---

## 파일 맵

```
ai-marketplace/
├── plugins/
│   └── example-plugin/              # Task 7
│       ├── plugin.json
│       ├── README.md
│       └── .claude-plugin/plugin.json
├── registry.json                    # Task 9 (Actions 생성)
├── scripts/
│   ├── validate-plugin.mjs          # Task 8
│   └── build-registry.mjs          # Task 9
├── cli/
│   ├── package.json                 # Task 1
│   ├── tsconfig.json                # Task 1
│   ├── src/
│   │   ├── types.ts                 # Task 2
│   │   ├── registry.ts              # Task 3
│   │   ├── detector.ts              # Task 4
│   │   ├── installer.ts             # Task 5
│   │   ├── index.ts                 # Task 6
│   │   └── commands/
│   │       ├── search.ts            # Task 6
│   │       ├── list.ts              # Task 6
│   │       ├── info.ts              # Task 6
│   │       ├── install.ts           # Task 6
│   │       └── submit.ts            # Task 6
│   └── tests/
│       ├── registry.test.ts         # Task 3
│       ├── detector.test.ts         # Task 4
│       └── installer.test.ts        # Task 5
├── .github/workflows/
│   ├── validate-plugin.yml          # Task 8
│   └── build-registry.yml          # Task 9
└── CONTRIBUTING.md                  # Task 10
```

---

## Task 1: CLI 프로젝트 스캐폴드

**Files:**
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`

- [ ] **Step 1: `cli/package.json` 생성**

```json
{
  "name": "@jaywapp/ai-market",
  "version": "0.1.0",
  "description": "CLI for the AI plugin marketplace",
  "type": "module",
  "bin": {
    "ai-market": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: `cli/tsconfig.json` 생성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["tests/**/*", "dist/**/*"]
}
```

- [ ] **Step 3: 의존성 설치**

```bash
cd cli && npm install
```

Expected: `node_modules/` 생성, `package-lock.json` 생성

- [ ] **Step 4: 커밋**

```bash
git add cli/package.json cli/tsconfig.json cli/package-lock.json
git commit -m "chore: scaffold CLI project"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `cli/src/types.ts`

- [ ] **Step 1: `cli/src/types.ts` 생성**

```typescript
export type Platform = 'claude' | 'codex' | 'cursor' | 'mcp';

export const PLATFORM_FOLDER: Record<Platform, string> = {
  claude: '.claude-plugin',
  codex: '.codex-plugin',
  cursor: '.cursor-plugin',
  mcp: '.mcp-plugin',
};

export interface PluginMeta {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  tags: string[];
  platforms: Platform[];
}

export interface RegistryEntry extends PluginMeta {
  path: string;
}

export interface Registry {
  updatedAt: string;
  count: number;
  plugins: RegistryEntry[];
}

export interface PlatformInfo {
  platform: Platform;
  installPath: string;
}
```

- [ ] **Step 2: 커밋**

```bash
git add cli/src/types.ts
git commit -m "feat: add core type definitions"
```

---

## Task 3: 레지스트리 패처

**Files:**
- Create: `cli/src/registry.ts`
- Create: `cli/tests/registry.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`cli/tests/registry.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPlugins } from '../src/registry.js';
import type { Registry } from '../src/types.js';

const mockRegistry: Registry = {
  updatedAt: '2026-05-09T00:00:00Z',
  count: 2,
  plugins: [
    {
      name: 'git-assistant',
      version: '1.0.0',
      description: 'Git 작업 자동화',
      author: 'jaywapp',
      license: 'MIT',
      tags: ['git', 'productivity'],
      platforms: ['claude'],
      path: 'plugins/git-assistant',
    },
    {
      name: 'code-reviewer',
      version: '1.0.0',
      description: 'AI 코드 리뷰',
      author: 'alice',
      license: 'MIT',
      tags: ['code', 'review'],
      platforms: ['claude', 'codex'],
      path: 'plugins/code-reviewer',
    },
  ],
};

describe('searchPlugins', () => {
  it('이름으로 검색', () => {
    const results = searchPlugins(mockRegistry, 'git');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('git-assistant');
  });

  it('설명으로 검색', () => {
    const results = searchPlugins(mockRegistry, '코드');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('code-reviewer');
  });

  it('태그로 검색', () => {
    const results = searchPlugins(mockRegistry, 'productivity');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('git-assistant');
  });

  it('없는 키워드는 빈 배열', () => {
    const results = searchPlugins(mockRegistry, 'nonexistent');
    expect(results).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd cli && npm test -- tests/registry.test.ts
```

Expected: FAIL — "Cannot find module '../src/registry.js'"

- [ ] **Step 3: `cli/src/registry.ts` 구현**

```typescript
import type { Registry, RegistryEntry } from './types.js';

const REGISTRY_URL =
  'https://raw.githubusercontent.com/jaywapp/ai-marketplace/main/registry.json';
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { data: Registry; timestamp: number } | null = null;

export async function fetchRegistry(): Promise<Registry> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }
  const res = await fetch(REGISTRY_URL);
  if (!res.ok) throw new Error(`레지스트리 로드 실패: ${res.status}`);
  const data = (await res.json()) as Registry;
  cache = { data, timestamp: Date.now() };
  return data;
}

export function searchPlugins(registry: Registry, keyword: string): RegistryEntry[] {
  const kw = keyword.toLowerCase();
  return registry.plugins.filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      p.tags.some((t) => t.toLowerCase().includes(kw)),
  );
}

export function findPlugin(registry: Registry, name: string): RegistryEntry | undefined {
  return registry.plugins.find((p) => p.name === name);
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd cli && npm test -- tests/registry.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add cli/src/registry.ts cli/tests/registry.test.ts
git commit -m "feat: add registry fetcher and search"
```

---

## Task 4: 플랫폼 감지기

**Files:**
- Create: `cli/src/detector.ts`
- Create: `cli/tests/detector.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`cli/tests/detector.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { detectPlatform } from '../src/detector.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `ai-market-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('detectPlatform', () => {
  it('CLAUDE.md 있으면 claude 감지', () => {
    writeFileSync(join(tmpDir, 'CLAUDE.md'), '');
    const result = detectPlatform(tmpDir);
    expect(result?.platform).toBe('claude');
    expect(result?.installPath).toBe(join(tmpDir, '.claude', 'plugins'));
  });

  it('.claude 폴더 있으면 claude 감지', () => {
    mkdirSync(join(tmpDir, '.claude'));
    const result = detectPlatform(tmpDir);
    expect(result?.platform).toBe('claude');
  });

  it('.codex-plugin 폴더 있으면 codex 감지', () => {
    mkdirSync(join(tmpDir, '.codex-plugin'));
    const result = detectPlatform(tmpDir);
    expect(result?.platform).toBe('codex');
    expect(result?.installPath).toBe(tmpDir);
  });

  it('.cursor 폴더 있으면 cursor 감지', () => {
    mkdirSync(join(tmpDir, '.cursor'));
    const result = detectPlatform(tmpDir);
    expect(result?.platform).toBe('cursor');
    expect(result?.installPath).toBe(join(tmpDir, '.cursor', 'plugins'));
  });

  it('아무것도 없으면 null', () => {
    const result = detectPlatform(tmpDir);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd cli && npm test -- tests/detector.test.ts
```

Expected: FAIL — "Cannot find module '../src/detector.js'"

- [ ] **Step 3: `cli/src/detector.ts` 구현**

```typescript
import { existsSync } from 'fs';
import { join } from 'path';
import type { PlatformInfo } from './types.js';

export function detectPlatform(cwd: string = process.cwd()): PlatformInfo | null {
  if (existsSync(join(cwd, 'CLAUDE.md')) || existsSync(join(cwd, '.claude'))) {
    return { platform: 'claude', installPath: join(cwd, '.claude', 'plugins') };
  }
  if (existsSync(join(cwd, '.codex-plugin'))) {
    return { platform: 'codex', installPath: cwd };
  }
  if (existsSync(join(cwd, '.cursor'))) {
    return { platform: 'cursor', installPath: join(cwd, '.cursor', 'plugins') };
  }
  return null;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd cli && npm test -- tests/detector.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add cli/src/detector.ts cli/tests/detector.test.ts
git commit -m "feat: add platform auto-detector"
```

---

## Task 5: 플러그인 인스톨러

**Files:**
- Create: `cli/src/installer.ts`
- Create: `cli/tests/installer.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`cli/tests/installer.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { installPlugin } from '../src/installer.js';
import type { RegistryEntry } from '../src/types.js';

const mockEntry: RegistryEntry = {
  name: 'git-assistant',
  version: '1.0.0',
  description: 'Git 작업 자동화',
  author: 'jaywapp',
  license: 'MIT',
  tags: ['git'],
  platforms: ['claude'],
  path: 'plugins/git-assistant',
};

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `ai-market-install-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });

  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    text: async () => `content of ${url}`,
  })));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  vi.unstubAllGlobals();
});

describe('installPlugin', () => {
  it('플랫폼 폴더와 plugin.json을 설치 경로에 생성', async () => {
    await installPlugin(mockEntry, 'claude', tmpDir);
    expect(existsSync(join(tmpDir, 'git-assistant', '.claude-plugin', 'plugin.json'))).toBe(true);
    expect(existsSync(join(tmpDir, 'git-assistant', 'plugin.json'))).toBe(true);
  });

  it('fetch가 실패해도 README는 무시하고 계속', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
      ok: url.includes('plugin.json'),
      text: async () => 'content',
    })));
    await expect(installPlugin(mockEntry, 'claude', tmpDir)).resolves.not.toThrow();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd cli && npm test -- tests/installer.test.ts
```

Expected: FAIL — "Cannot find module '../src/installer.js'"

- [ ] **Step 3: `cli/src/installer.ts` 구현**

```typescript
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import type { RegistryEntry, Platform } from './types.js';
import { PLATFORM_FOLDER } from './types.js';

const BASE_URL =
  'https://raw.githubusercontent.com/jaywapp/ai-marketplace/main';

export async function installPlugin(
  entry: RegistryEntry,
  platform: Platform,
  installPath: string,
): Promise<void> {
  const platformFolder = PLATFORM_FOLDER[platform];
  const destRoot = join(installPath, entry.name);
  const destPlatform = join(destRoot, platformFolder);

  await mkdir(destPlatform, { recursive: true });

  const files: Array<{ url: string; dest: string; required: boolean }> = [
    {
      url: `${BASE_URL}/${entry.path}/plugin.json`,
      dest: join(destRoot, 'plugin.json'),
      required: true,
    },
    {
      url: `${BASE_URL}/${entry.path}/${platformFolder}/plugin.json`,
      dest: join(destPlatform, 'plugin.json'),
      required: true,
    },
    {
      url: `${BASE_URL}/${entry.path}/README.md`,
      dest: join(destRoot, 'README.md'),
      required: false,
    },
  ];

  for (const { url, dest, required } of files) {
    const res = await fetch(url);
    if (!res.ok) {
      if (required) throw new Error(`파일 다운로드 실패: ${url}`);
      continue;
    }
    await writeFile(dest, await res.text(), 'utf-8');
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd cli && npm test -- tests/installer.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add cli/src/installer.ts cli/tests/installer.test.ts
git commit -m "feat: add plugin installer"
```

---

## Task 6: CLI 명령어

**Files:**
- Create: `cli/src/commands/search.ts`
- Create: `cli/src/commands/list.ts`
- Create: `cli/src/commands/info.ts`
- Create: `cli/src/commands/install.ts`
- Create: `cli/src/commands/submit.ts`
- Create: `cli/src/index.ts`

- [ ] **Step 1: `cli/src/commands/search.ts`**

```typescript
import type { Command } from 'commander';
import { fetchRegistry, searchPlugins } from '../registry.js';

export function registerSearch(program: Command): void {
  program
    .command('search <keyword>')
    .description('키워드로 플러그인 검색')
    .action(async (keyword: string) => {
      const registry = await fetchRegistry();
      const results = searchPlugins(registry, keyword);
      if (results.length === 0) {
        console.log('검색 결과가 없습니다.');
        return;
      }
      for (const p of results) {
        console.log(`${p.name}@${p.version} — ${p.description} [${p.platforms.join(', ')}]`);
      }
    });
}
```

- [ ] **Step 2: `cli/src/commands/list.ts`**

```typescript
import type { Command } from 'commander';
import { fetchRegistry } from '../registry.js';
import type { Platform } from '../types.js';

export function registerList(program: Command): void {
  program
    .command('list')
    .description('모든 플러그인 목록')
    .option('--platform <platform>', '플랫폼 필터 (claude, codex, cursor, mcp)')
    .action(async (opts: { platform?: Platform }) => {
      const registry = await fetchRegistry();
      const plugins = opts.platform
        ? registry.plugins.filter((p) => p.platforms.includes(opts.platform!))
        : registry.plugins;

      if (plugins.length === 0) {
        console.log('등록된 플러그인이 없습니다.');
        return;
      }
      for (const p of plugins) {
        console.log(`${p.name}@${p.version} — ${p.description}`);
      }
    });
}
```

- [ ] **Step 3: `cli/src/commands/info.ts`**

```typescript
import type { Command } from 'commander';
import { fetchRegistry, findPlugin } from '../registry.js';

export function registerInfo(program: Command): void {
  program
    .command('info <name>')
    .description('플러그인 상세 정보')
    .action(async (name: string) => {
      const registry = await fetchRegistry();
      const plugin = findPlugin(registry, name);
      if (!plugin) {
        console.error(`플러그인을 찾을 수 없습니다: ${name}`);
        process.exit(1);
      }
      console.log(`이름: ${plugin.name}`);
      console.log(`버전: ${plugin.version}`);
      console.log(`설명: ${plugin.description}`);
      console.log(`작성자: ${plugin.author}`);
      console.log(`라이선스: ${plugin.license}`);
      console.log(`태그: ${plugin.tags.join(', ')}`);
      console.log(`플랫폼: ${plugin.platforms.join(', ')}`);
    });
}
```

- [ ] **Step 4: `cli/src/commands/install.ts`**

```typescript
import type { Command } from 'commander';
import { fetchRegistry, findPlugin } from '../registry.js';
import { detectPlatform } from '../detector.js';
import { installPlugin } from '../installer.js';
import type { Platform } from '../types.js';

export function registerInstall(program: Command): void {
  program
    .command('install <name>')
    .description('플러그인 설치')
    .option('--platform <platform>', '플랫폼 지정 (claude, codex, cursor, mcp)')
    .action(async (name: string, opts: { platform?: Platform }) => {
      const registry = await fetchRegistry();
      const plugin = findPlugin(registry, name);
      if (!plugin) {
        console.error(`플러그인을 찾을 수 없습니다: ${name}`);
        process.exit(1);
      }

      let platform: Platform;
      let installPath: string;

      if (opts.platform) {
        platform = opts.platform;
        installPath = process.cwd();
      } else {
        const detected = detectPlatform();
        if (!detected) {
          console.error(
            '플랫폼을 자동 감지할 수 없습니다. --platform 옵션을 사용하세요.',
          );
          process.exit(1);
        }
        platform = detected.platform;
        installPath = detected.installPath;
      }

      if (!plugin.platforms.includes(platform)) {
        console.error(`${name}은 ${platform}을 지원하지 않습니다.`);
        console.error(`지원 플랫폼: ${plugin.platforms.join(', ')}`);
        process.exit(1);
      }

      console.log(`설치 중: ${name} → ${installPath}`);
      await installPlugin(plugin, platform, installPath);
      console.log(`✅ ${name} 설치 완료`);
    });
}
```

- [ ] **Step 5: `cli/src/commands/submit.ts`**

```typescript
import type { Command } from 'commander';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export function registerSubmit(program: Command): void {
  program
    .command('submit <path>')
    .description('플러그인 제출 (PR 생성 도우미)')
    .action((pluginPath: string) => {
      const metaPath = join(pluginPath, 'plugin.json');
      if (!existsSync(metaPath)) {
        console.error(`plugin.json이 없습니다: ${metaPath}`);
        process.exit(1);
      }
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      console.log(`플러그인: ${meta.name}@${meta.version}`);
      console.log('');
      console.log('제출 방법:');
      console.log('1. https://github.com/jaywapp/ai-marketplace 를 Fork');
      console.log(`2. plugins/${meta.name}/ 폴더에 플러그인 파일 복사`);
      console.log('3. PR 생성');
      console.log('');
      console.log('또는 gh CLI 사용:');
      console.log(`  gh repo fork jaywapp/ai-marketplace --clone`);
      console.log(`  cp -r ${pluginPath} ai-marketplace/plugins/${meta.name}`);
      console.log(`  cd ai-marketplace && git add . && git commit -m "feat: add ${meta.name}"`);
      console.log(`  gh pr create --title "feat: add ${meta.name}" --body ""`);
    });
}
```

- [ ] **Step 6: `cli/src/index.ts`**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { registerSearch } from './commands/search.js';
import { registerList } from './commands/list.js';
import { registerInfo } from './commands/info.js';
import { registerInstall } from './commands/install.js';
import { registerSubmit } from './commands/submit.js';

const program = new Command();

program
  .name('ai-market')
  .description('AI 플러그인 마켓플레이스 CLI')
  .version('0.1.0');

registerSearch(program);
registerList(program);
registerInfo(program);
registerInstall(program);
registerSubmit(program);

program.parse();
```

- [ ] **Step 7: 빌드 확인**

```bash
cd cli && npm run build
```

Expected: `dist/` 폴더 생성, 에러 없음

- [ ] **Step 8: 커밋**

```bash
git add cli/src/
git commit -m "feat: add CLI commands (search, list, info, install, submit)"
```

---

## Task 7: 예제 플러그인

**Files:**
- Create: `plugins/example-plugin/plugin.json`
- Create: `plugins/example-plugin/README.md`
- Create: `plugins/example-plugin/.claude-plugin/plugin.json`

- [ ] **Step 1: `plugins/example-plugin/plugin.json`**

```json
{
  "name": "example-plugin",
  "version": "1.0.0",
  "description": "AI Marketplace 예제 플러그인",
  "author": "jaywapp",
  "license": "MIT",
  "tags": ["example", "template"],
  "platforms": ["claude"]
}
```

- [ ] **Step 2: `plugins/example-plugin/.claude-plugin/plugin.json`**

```json
{
  "name": "example-plugin",
  "description": "AI Marketplace 예제 플러그인",
  "version": "1.0.0",
  "skills": [],
  "interface": {
    "displayName": "Example Plugin",
    "shortDescription": "AI Marketplace 예제 플러그인"
  }
}
```

- [ ] **Step 3: `plugins/example-plugin/README.md`**

```markdown
# example-plugin

AI Marketplace 예제 플러그인입니다.

## 설치

```bash
ai-market install example-plugin
```

## 지원 플랫폼

- Claude Code
```

- [ ] **Step 4: 커밋**

```bash
git add plugins/
git commit -m "feat: add example plugin"
```

---

## Task 8: validate-plugin GitHub Action

**Files:**
- Create: `scripts/validate-plugin.mjs`
- Create: `.github/workflows/validate-plugin.yml`

- [ ] **Step 1: `scripts/validate-plugin.mjs`**

```javascript
#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_FIELDS = ['name', 'version', 'description', 'author', 'license', 'tags', 'platforms'];
const PLATFORM_FOLDERS = {
  claude: '.claude-plugin',
  codex: '.codex-plugin',
  cursor: '.cursor-plugin',
  mcp: '.mcp-plugin',
};

function validate(pluginPath) {
  const errors = [];
  const metaPath = join(pluginPath, 'plugin.json');

  if (!existsSync(metaPath)) {
    errors.push('plugin.json이 없습니다');
    return errors;
  }

  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  } catch {
    errors.push('plugin.json 파싱 실패');
    return errors;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!meta[field]) errors.push(`필수 필드 누락: ${field}`);
  }

  if (!existsSync(join(pluginPath, 'README.md'))) {
    errors.push('README.md가 없습니다');
  }

  if (Array.isArray(meta.platforms)) {
    for (const platform of meta.platforms) {
      const folder = PLATFORM_FOLDERS[platform];
      if (!folder) {
        errors.push(`알 수 없는 플랫폼: ${platform}`);
        continue;
      }
      const platformPluginJson = join(pluginPath, folder, 'plugin.json');
      if (!existsSync(platformPluginJson)) {
        errors.push(`${folder}/plugin.json이 없습니다 (platforms에 ${platform} 선언됨)`);
      }
    }
  }

  return errors;
}

const pluginPath = process.argv[2];
if (!pluginPath) {
  console.error('사용법: validate-plugin.mjs <plugin-path>');
  process.exit(1);
}

const errors = validate(pluginPath);
if (errors.length > 0) {
  console.error('❌ 검증 실패:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log('✅ 검증 통과');
}
```

- [ ] **Step 2: `.github/workflows/validate-plugin.yml`**

```yaml
name: Validate Plugin

on:
  pull_request:
    paths:
      - 'plugins/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 변경된 플러그인 폴더 감지 및 검증
        run: |
          git fetch origin ${{ github.base_ref }}
          CHANGED=$(git diff --name-only origin/${{ github.base_ref }}...HEAD \
            | grep '^plugins/' \
            | cut -d'/' -f1-2 \
            | sort -u)
          for plugin_path in $CHANGED; do
            echo "검증 중: $plugin_path"
            node scripts/validate-plugin.mjs "$plugin_path"
          done
```

- [ ] **Step 3: 예제 플러그인으로 검증 스크립트 테스트**

```bash
node scripts/validate-plugin.mjs plugins/example-plugin
```

Expected: `✅ 검증 통과`

- [ ] **Step 4: 커밋**

```bash
git add scripts/validate-plugin.mjs .github/workflows/validate-plugin.yml
git commit -m "feat: add plugin validation script and GitHub Action"
```

---

## Task 9: build-registry GitHub Action

**Files:**
- Create: `scripts/build-registry.mjs`
- Create: `.github/workflows/build-registry.yml`

- [ ] **Step 1: `scripts/build-registry.mjs`**

```javascript
#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const PLUGINS_DIR = 'plugins';

function buildRegistry() {
  const pluginDirs = readdirSync(PLUGINS_DIR).filter((name) => {
    const path = join(PLUGINS_DIR, name);
    return statSync(path).isDirectory();
  });

  const plugins = [];

  for (const dir of pluginDirs) {
    const metaPath = join(PLUGINS_DIR, dir, 'plugin.json');
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      plugins.push({
        name: meta.name,
        version: meta.version,
        description: meta.description,
        author: meta.author,
        license: meta.license,
        tags: meta.tags,
        platforms: meta.platforms,
        path: `${PLUGINS_DIR}/${dir}`,
      });
    } catch {
      console.warn(`건너뜀 (plugin.json 없음): ${dir}`);
    }
  }

  const registry = {
    updatedAt: new Date().toISOString(),
    count: plugins.length,
    plugins,
  };

  writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n', 'utf-8');
  console.log(`✅ registry.json 빌드 완료 (플러그인 ${plugins.length}개)`);
}

buildRegistry();
```

- [ ] **Step 2: `.github/workflows/build-registry.yml`**

```yaml
name: Build Registry

on:
  push:
    branches:
      - main
    paths:
      - 'plugins/**'

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: registry.json 빌드
        run: node scripts/build-registry.mjs

      - name: 변경사항 커밋
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add registry.json
          git diff --cached --quiet || git commit -m "chore: rebuild registry.json [skip ci]"
          git push
```

- [ ] **Step 3: 스크립트 로컬 테스트**

```bash
node scripts/build-registry.mjs
```

Expected: `registry.json` 생성, `✅ registry.json 빌드 완료 (플러그인 1개)`

- [ ] **Step 4: 커밋**

```bash
git add scripts/build-registry.mjs .github/workflows/build-registry.yml registry.json
git commit -m "feat: add registry builder script and GitHub Action"
```

---

## Task 10: CONTRIBUTING.md + README.md

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `README.md`

- [ ] **Step 1: `CONTRIBUTING.md`**

```markdown
# 플러그인 제출 가이드

## 1. 폴더 구조 준비

`plugins/<your-plugin-name>/` 폴더를 생성하고 아래 파일을 작성합니다.

```
plugins/my-plugin/
├── plugin.json           # 필수
├── README.md             # 필수
└── .claude-plugin/
    └── plugin.json       # platforms에 claude 선언 시 필수
```

## 2. plugin.json 작성

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

## 3. 플랫폼별 설정 파일

| platforms 값 | 필요한 폴더 |
|---|---|
| `claude` | `.claude-plugin/plugin.json` |
| `codex` | `.codex-plugin/plugin.json` |
| `cursor` | `.cursor-plugin/plugin.json` |
| `mcp` | `.mcp-plugin/plugin.json` |

## 4. PR 제출

1. 이 레포를 Fork
2. 플러그인 폴더 추가
3. PR 생성 → 자동 검증 실행
4. 머지 후 `registry.json` 자동 업데이트
```

- [ ] **Step 2: `README.md`**

```markdown
# AI Marketplace

AI 도구(Claude Code 플러그인, MCP 서버, Codex 플러그인 등)를 등록하고 설치하는 중앙 마켓플레이스입니다.

## CLI 설치

```bash
npm install -g @jaywapp/ai-market
```

## 사용법

```bash
# 검색
ai-market search <keyword>

# 목록
ai-market list
ai-market list --platform claude

# 상세 정보
ai-market info <plugin-name>

# 설치
ai-market install <plugin-name>
ai-market install <plugin-name> --platform codex

# 플러그인 제출
ai-market submit <path>
```

## 플러그인 등록

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.
```

- [ ] **Step 3: 커밋**

```bash
git add CONTRIBUTING.md README.md
git commit -m "docs: add README and CONTRIBUTING guide"
```

- [ ] **Step 4: GitHub push**

```bash
git push -u origin main
```

---

## 전체 완료 확인

```bash
cd cli && npm test
```

Expected: PASS (모든 테스트)

```bash
node scripts/validate-plugin.mjs plugins/example-plugin
node scripts/build-registry.mjs
```

Expected: 검증 통과 + registry.json 빌드 성공
