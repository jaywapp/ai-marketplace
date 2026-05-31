# agent-team-manager

AI 에이전트 팀의 동작, 효율성, 토큰 낭비·절약 포인트를 점검하는 Claude Code 플러그인.

## 제공 스킬

### `inspect`

에이전트 팀 디렉터리를 분석하여 다음을 제공한다:

- **모델 비용 분포** — High/Mid/Low 등급별 에이전트 비율
- **낭비 포인트** — 과도한 모델 배정, 중복 역할, 비효율적 컨텍스트 전달
- **절약 기회** — 모델 다운그레이드, 역할 통합, Skill/Plugin화 대상
- **종합 점수** — 효율성 10점 척도 평가

## 지원 팀

- `AgentTeam/` — 소프트웨어 업체 에이전트 팀
- `ClaudeBuffett/` — 투자 분석 에이전트 팀
- `productivity-engineering-team/` — 생산성 엔지니어링 에이전트 팀
- 사용자 정의 에이전트 팀 디렉터리

## 사용 예시

```
/agent-team-manager:inspect
AgentTeam 점검해줘
productivity-engineering-team 토큰 효율 분석
```

## 설치

이 플러그인은 [AI Marketplace](https://github.com/jaywapp/ai-marketplace)에서 설치할 수 있다.
