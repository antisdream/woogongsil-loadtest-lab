import http from "k6/http";
import { check, sleep } from "k6";

http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 499 })
);

export const options = {
  stages: [
    { duration: "20s", target: 1 },
    { duration: "20s", target: 3 },
    { duration: "20s", target: 5 },
    { duration: "20s", target: 0 }
  ],
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    http_req_failed: ["rate<0.01"]
  }
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

function explainStatus(status) {
  if (status >= 200 && status < 300) return "OK";
  if (status === 401) return "AUTH_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status >= 500) return "SERVER_ERROR";
  return "OTHER";
}

export default function () {
  for (const item of endpoints) {
    const url = `${BASE_URL}${item.path}`;

    const res = http.get(url, {
      tags: {
        endpoint: item.name
      }
    });

    const label = explainStatus(res.status);

    console.log(`${item.name} ${item.path} -> status=${res.status}, label=${label}, duration=${Math.round(res.timings.duration)}ms`);

    check(res, {
      [`${item.name} server responded`]: (r) => r.status > 0,
      [`${item.name} no server crash`]: (r) => r.status < 500
    });

    sleep(0.2);
  }
}
