import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { setupServer } from "msw/node";

// Create an MSW server for testing
export const createTestServer = () => {
  return setupServer();
};

// This file is used to set up common test server configuration

/**
 * Add this dummy test to prevent Jest from failing with "Your test suite must contain at least one test"
 */
describe("Test Setup", () => {
  it("is just a setup file, not actual tests", () => {
    expect(true).toBe(true);
  });
});

// Export any test server setup functions or configuration here
export const testServerConfig = {
  // Add any configuration options for test server here
  baseUrl: "http://localhost:3000",
  mockMode: true,
};
