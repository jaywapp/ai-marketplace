# claude-plugin-qa

QA 워크플로우 자동화 플러그인. Claude for Chrome에서 내보낸 QA 리포트 파일을 입력받아
리포트 저장 → 태스크 분리 → 서브에이전트 실행 → GitHub PR 생성까지 자동화한다.

## 설치

Claude Code settings.json의 extraKnownMarketplaces에 로컬 마켓플레이스를 추가하고 enabledPlugins에 등록한다.

## 사용법

| 호출 | 동작 |
|------|------|
| `/qa` | 프로젝트명과 파일 경로를 순서대로 확인 후 진행 |
| `/qa D:\path\to\report.md` | 파일 직접 지정 |
| `/qa {프로젝트명}` | 프로젝트 qa 폴더에서 최근 리포트 자동 탐색 |

## 워크플로우

1. QA 리포트 파일 파싱 & `D:\workspace\{project}\qa\{project}_QA_report.md` 저장
2. TODO 목록 생성 & `D:\workspace\{project}\qa\{project}_TODO.md` 저장
3. 우선순위별 태스크 분류 (🔴 버그 / 🟡 UI / 🟢 기타)
4. `superpowers:subagent-driven-development`로 태스크 자동 실행
5. GitHub PR 생성 (`fix: QA {날짜} 반영`)
