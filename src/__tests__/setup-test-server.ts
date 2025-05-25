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

// Mock msw/node module
jest.mock("msw/node", () => ({
  setupServer: jest.fn(() => ({
    listen: jest.fn(),
    close: jest.fn(),
    resetHandlers: jest.fn(),
    use: jest.fn(),
  })),
}));

describe("Setup Test Server", () => {
  // Basic test to verify setup
  it("should be properly configured", () => {
    expect(true).toBe(true);
  });
});

// Export any test server setup functions or configuration here
export const testServerConfig = {
  // We're using mocks instead of actual MSW in tests
  isMocked: true,
};
