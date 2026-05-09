#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const PLUGINS_DIR = 'plugins';

function buildRegistry() {
  const dirs = readdirSync(PLUGINS_DIR).filter((name) =>
    statSync(join(PLUGINS_DIR, name)).isDirectory(),
  );

  const plugins = [];

  for (const dir of dirs) {
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
      console.warn(`건너뜀 (plugin.json 없음 또는 파싱 실패): ${dir}`);
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
