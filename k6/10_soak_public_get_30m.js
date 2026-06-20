import http from "k6/http";
import { check, sleep } from "k6";

http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 499 })
);

export const options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "30m", target: 20 },
    { duration: "2m", target: 0 }
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"]
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"]
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:5000";
const WGS_COOKIE = __ENV.WGS_COOKIE || "";

const endpoints = [
  { name: "home-root", path: "/" },
  { name: "screen-settings", path: "/api/screen-settings" },
  { name: "class-schedules", path: "/api/class-schedules" },
  { name: "mealmap-places", path: "/api/mealmap/places" },
  { name: "exam-catalogs", path: "/api/exam-catalogs" },
  { name: "ipep-catalog", path: "/api/ipep/exam-catalog" },
  { name: "ipep-random", path: "/api/ipep/random-question" },
  { name: "rankings-random", path: "/api/rankings?type=random" },
  { name: "posts", path: "/api/posts" }
];

function params(endpoint) {
  return {
    headers: {
      "Cookie": WGS_COOKIE,
      "Accept": "application/json, text/plain, */*",
      "X-Wgs-Client-Id": "wgs-k6-soak"
    },
    tags: {
      endpoint,
      group: "soak"
    }
  };
}

export default function () {
  for (const item of endpoints) {
    const res = http.get(`${BASE_URL}${item.path}`, params(item.name));

    check(res, {
      [`${item.name} responded`]: (r) => r.status > 0,
      [`${item.name} no server crash`]: (r) => r.status < 500
    });

    sleep(0.1);
  }

  sleep(0.2);
}
