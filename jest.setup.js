// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// MSW needs TextEncoder in Node.js environment
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}

if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

// For MSW to work properly in Node.js environment
global.Request = require("node-fetch").Request;
global.Response = require("node-fetch").Response;
global.Headers = require("node-fetch").Headers;
global.fetch = require("node-fetch");

// Add any global setup needed for Jest tests

// Mock fetch
global.fetch = require("node-fetch");

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Polyfill for MSW
class BroadcastChannelPolyfill {
  constructor(channel) {
    this.channel = channel;
    this.listeners = [];
  }

  postMessage(message) {
    this.listeners.forEach((listener) => listener({ data: message }));
  }

  addEventListener(type, listener) {
    if (type === "message") {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type, listener) {
    if (type === "message") {
      this.listeners = this.listeners.filter((l) => l !== listener);
    }
  }

  close() {
    this.listeners = [];
  }
}

global.BroadcastChannel = BroadcastChannelPolyfill;

// Add any additional test setup here
