import http from "k6/http";
import { check, sleep } from "k6";

http.setResponseCallback(
  http.expectedStatuses({ min: 200, max: 499 })
);

export const options = {
  stages: [
    { duration: "30s", target: 5 },
    { duration: "30s", target: 15 },
    { duration: "30s", target: 30 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 0 }
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"]
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"]
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:5000";
const WGS_COOKIE = __ENV.WGS_COOKIE || "";

const endpoints = [
  { name: "written-random-all", path: "/api/random-question" },
  { name: "written-random-subject-1", path: "/api/random-question?subject=1" },
  { name: "written-random-subject-2", path: "/api/random-question?subject=2" },
  { name: "written-random-subject-3", path: "/api/random-question?subject=3" },
  { name: "written-random-subject-4", path: "/api/random-question?subject=4" },
  { name: "written-random-subject-5", path: "/api/random-question?subject=5" },
  { name: "written-exam-catalogs", path: "/api/exam-catalogs" },
  { name: "written-past-2026-1", path: "/api/past-exam?year=2026&session=1" },
  { name: "written-past-2025-1", path: "/api/past-exam?year=2025&session=1" },
  { name: "ipep-random-all", path: "/api/ipep/random-question?subjectCode=ALL" },
  { name: "ipep-random-01", path: "/api/ipep/random-question?subjectCode=01" },
  { name: "ipep-random-02", path: "/api/ipep/random-question?subjectCode=02" },
  { name: "ipep-exam-catalog", path: "/api/ipep/exam-catalog" },
  { name: "ipep-past-2024-1", path: "/api/ipep/past-exam?year=2024&session=1" },
  { name: "ipep-past-2025-1", path: "/api/ipep/past-exam?year=2025&session=1" }
];

function requestHeaders() {
  return {
    headers: {
      "Cookie": WGS_COOKIE,
      "Accept": "application/json, text/plain, */*",
      "X-Wgs-Client-Id": "wgs-k6-question-bank"
    }
  };
}

export default function () {
  if (__ITER % 5 === 0) {
    console.log(`[WGS QUESTION BANK LOAD] VU=${__VU}, ITER=${__ITER}, target=${BASE_URL}`);
  }

  for (const item of endpoints) {
    const res = http.get(`${BASE_URL}${item.path}`, {
      ...requestHeaders(),
      tags: {
        endpoint: item.name,
        group: "question-bank"
      }
    });

    check(res, {
      [`${item.name} responded`]: (r) => r.status > 0,
      [`${item.name} no server crash`]: (r) => r.status < 500,
      [`${item.name} auth passed or known route issue`]: (r) => r.status === 200 || r.status === 404
    });

    sleep(0.05);
  }

  sleep(0.2);
}
