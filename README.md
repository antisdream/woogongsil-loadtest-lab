# Woogongsil Load Test Lab

우공실 서비스의 성능 검증을 별도로 관리하기 위한 부하 테스트 저장소입니다.

이 저장소는 서비스 코드 저장소인 [antisdream/woogongsil](https://github.com/antisdream/woogongsil)과 분리해 운영합니다. 우공실 본 저장소는 애플리케이션 코드와 배포 문서를 중심으로 관리하고, 이 저장소는 k6, Prometheus, Grafana 기반의 성능 테스트 환경과 테스트 기록을 관리합니다.

## 관련 저장소

| 구분 | 저장소 | 역할 |
|---|---|---|
| 서비스 코드 | [antisdream/woogongsil](https://github.com/antisdream/woogongsil) | 우공실 애플리케이션 코드, 배포 문서, 운영 기준 관리 |
| 성능 테스트 | [antisdream/woogongsil-loadtest-lab](https://github.com/antisdream/woogongsil-loadtest-lab) | k6, Prometheus, Grafana 기반 부하 테스트 환경과 테스트 기록 관리 |

## 구성

| 경로 | 설명 |
|---|---|
| `k6/` | smoke test, 공개 GET API 테스트, 문제은행 조회 API 부하 테스트 스크립트 |
| `prometheus/` | k6 remote write 결과를 수집하기 위한 Prometheus 설정 |
| `grafana/` | Prometheus datasource와 k6 대시보드 설정 |
| `scripts/` | Windows 환경에서 모니터링 스택을 시작/중지하는 보조 스크립트 |
| `docs/` | 회차별 성능 테스트 기록과 공개용 요약 문서 |

## 실행 준비

```powershell
Copy-Item .env.example .env
```

`.env`에서 Grafana 관리자 계정 값을 로컬 환경에 맞게 조정합니다.

```env
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=change-me-local-only
```

## 모니터링 스택 실행

```powershell
.\scripts\start-monitor.ps1
```

또는 CMD 환경에서는 다음 명령을 사용합니다.

```cmd
scripts\start-monitor.cmd
```

접속 주소는 다음과 같습니다.

| 도구 | 주소 |
|---|---|
| Grafana | `http://localhost:3001` |
| Prometheus | `http://localhost:9090` |

## k6 테스트 실행 예시

공개 GET API 테스트:

```powershell
docker compose -f docker-compose.monitor.yml run --rm `
  -e BASE_URL=http://host.docker.internal:5000 `
  k6 run /scripts/06_final_recording_public_get.js
```

문제은행 조회 API 테스트:

```powershell
docker compose -f docker-compose.monitor.yml run --rm `
  -e BASE_URL=http://host.docker.internal:5000 `
  -e WGS_COOKIE="브라우저에서 확인한 테스트용 Cookie 값" `
  k6 run /scripts/07_question_bank_get_loadtest.js
```

`WGS_COOKIE` 값은 인증이 필요한 API 테스트에만 사용합니다. Cookie, session token, 관리자 계정 정보는 결과 파일이나 Git 저장소에 남기지 않습니다.

## 테스트 기록

| 회차 | 게시일 | 문서 | 원문 |
|---:|---|---|---|
| 1차 | 2026-05-31 15:19 | [2026-05-31-loadtest-01.md](./docs/2026-05-31-loadtest-01.md) | [Naver Blog](https://blog.naver.com/andisdream/224301694314) |
| 2차 | 2026-06-03 20:10 | [2026-06-03-loadtest-02.md](./docs/2026-06-03-loadtest-02.md) | [Naver Blog](https://blog.naver.com/andisdream/224304996395) |
| 3차 | 2026-06-07 14:58 | [2026-06-07-loadtest-03.md](./docs/2026-06-07-loadtest-03.md) | [Naver Blog](https://blog.naver.com/andisdream/224308514804) |

## 공개 관리 기준

다음 항목은 Git 추적 대상에서 제외합니다.

- Cookie, session token, API key, DB 접속 정보
- 원시 로그, CSV 결과, API discovery 결과
- 로컬 절대 경로가 포함된 스캔 결과
- 운영 서버 내부 구조를 과도하게 드러내는 파일
- 테스트 중간 백업 파일

회차별 문서는 원문 블로그와 로컬 결과를 바탕으로 공개 가능한 수준의 목적, 조건, 결과, 개선 방향만 정리합니다.
