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
      if (!existsSync(join(pluginPath, folder, 'plugin.json'))) {
        errors.push(`${folder}/plugin.json 없음 (platforms에 "${platform}" 선언됨)`);
      }
    }
  }

  return errors;
}

const pluginPath = process.argv[2];
if (!pluginPath) {
  console.error('사용법: node validate-plugin.mjs <plugin-path>');
  process.exit(1);
}

const errors = validate(pluginPath);
if (errors.length > 0) {
  console.error('❌ 검증 실패:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`✅ ${pluginPath} 검증 통과`);
}
