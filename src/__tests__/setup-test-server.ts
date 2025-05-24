import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { setupServer } from "msw";

// Create an MSW server for testing
export const createTestServer = () => {
  return setupServer();
};
