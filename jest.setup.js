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
