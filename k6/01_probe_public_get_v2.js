import http from "k6/http";
import { check, sleep } from "k6";

// 200~499는 서버가 응답한 것으로 본다.
// 401, 403, 404는 서버 장애가 아니라 인증 필요/권한 없음/경로 없음일 수 있기 때문이다.
http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 499 })
);

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:5000";

const endpoints = [
  "/",
  "/api/screen-settings",
  "/api/class-schedules",
  "/api/mealmap/places",
  "/api/exam-catalogs",
  "/api/ipep/exam-catalog",
  "/api/ipep/random-question",
  "/api/ranking",
  "/api/notices",
  "/api/posts"
];

function explainStatus(status) {
  if (status >= 200 && status < 300) return "OK";
  if (status === 401) return "AUTH_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status >= 500) return "SERVER_ERROR";
  return "OTHER";
}

export default function () {
  for (const path of endpoints) {
    const url = `${BASE_URL}${path}`;
    const res = http.get(url);
    const label = explainStatus(res.status);

    console.log(`${path} -> status=${res.status}, label=${label}, duration=${Math.round(res.timings.duration)}ms`);

    check(res, {
      [`${path} server responded`]: (r) => r.status > 0,
      [`${path} no server crash`]: (r) => r.status < 500
    });

    sleep(0.3);
  }
}
