import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 1,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<1000"]
  }
};

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:5000";

export default function () {
  const res = http.get(`${BASE_URL}/`);

  check(res, {
    "server responded with any HTTP status": (r) => r.status > 0,
    "status is 200 or 404": (r) => r.status === 200 || r.status === 404,
    "response time under 1000ms": (r) => r.timings.duration < 1000
  });

  sleep(1);
}
