import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_duration: ["p(95)<1500"]
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

export default function () {
  for (const path of endpoints) {
    const url = `${BASE_URL}${path}`;
    const res = http.get(url);

    console.log(`${path} -> status=${res.status}, duration=${Math.round(res.timings.duration)}ms`);

    check(res, {
      [`${path} responded`]: (r) => r.status > 0,
      [`${path} did not crash server`]: (r) => r.status < 500
    });

    sleep(0.3);
  }
}
