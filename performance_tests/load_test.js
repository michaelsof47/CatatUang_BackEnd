import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // ramp up to 20 users over 30 seconds
    { duration: "1m", target: 20 }, // stay at 20 users for 1 minute
    { duration: "20s", target: 0 }, // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = "http://localhost:3000";

export default function () {
  // Test root or a simple route
  const res = http.get(`${BASE_URL}/user/profile/picture`);

  check(res, {
    "status is 200 or 404": (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);
}
