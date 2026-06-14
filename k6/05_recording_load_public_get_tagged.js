import http from "k6/http";
import { check, sleep } from "k6";

// 200~499는 서버가 응답한 것으로 본다.
// 401은 인증 필요, 404는 경로 없음일 수 있으므로 서버 장애로 보지 않는다.
http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 499 })
);

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 30 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 0 }
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"]
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"]
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:5000";

const endpoints = [
  { name: "home-root", path: "/" },
  { name: "screen-settings", path: "/api/screen-settings" },
  { name: "class-schedules", path: "/api/class-schedules" },
  { name: "mealmap-places", path: "/api/mealmap/places" },
  { name: "exam-catalogs", path: "/api/exam-catalogs" },
  { name: "ipep-catalog", path: "/api/ipep/exam-catalog" },
  { name: "ipep-random", path: "/api/ipep/random-question" },
  { name: "ranking", path: "/api/ranking" },
  { name: "notices", path: "/api/notices" },
  { name: "posts", path: "/api/posts" }
];

export default function () {
  for (const item of endpoints) {
    const res = http.get(`${BASE_URL}${item.path}`, {
      tags: {
        endpoint: item.name
      }
    });

    check(res, {
      [`${item.name} no server crash`]: (r) => r.status > 0 && r.status < 500
    });

    sleep(0.1);
  }
}
