import { imageQueue } from "./image-generation-queue";

// Mock fetch
global.fetch = jest.fn();

describe("ImageGenerationQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Access the private queue property to reset it
    // @ts-ignore - Accessing private property for testing
    imageQueue.queue = [];

    // Reset other private properties
    // @ts-ignore
    imageQueue.isProcessing = false;
    // @ts-ignore
    imageQueue.processingCount = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should enqueue an ingredient for image generation", () => {
    // Spy on console.log
    jest.spyOn(console, "log").mockImplementation();

    // Spy on the processQueue method
    // @ts-ignore - Accessing private method for testing
    const processQueueSpy = jest.spyOn(imageQueue, "processQueue");

    // Add an ingredient to the queue
    imageQueue.enqueue("test-ingredient-id");

    // Verify console.log was called
    expect(console.log).toHaveBeenCalledWith(
      "Enqueueing ingredient for image generation: test-ingredient-id"
    );

    // Verify processQueue was called
    expect(processQueueSpy).toHaveBeenCalled();

    // Verify the item was added to the queue
    // @ts-ignore - Accessing private property for testing
    expect(imageQueue.queue.length).toBe(0); // It should be 0 because processQueue will remove it
  });

  it("should not add duplicate ingredients to the queue", () => {
    // Spy on console.log
    jest.spyOn(console, "log").mockImplementation();

    // Mock processQueue to do nothing so items stay in queue
    // @ts-ignore - Accessing private method for testing
    jest.spyOn(imageQueue, "processQueue").mockImplementation(() => {});

    // Add the same ingredient twice
    imageQueue.enqueue("test-ingredient-id");
    imageQueue.enqueue("test-ingredient-id");

    // Verify it was only added once
    // @ts-ignore - Accessing private property for testing
    expect(imageQueue.queue.length).toBe(1);
    // @ts-ignore
    expect(imageQueue.queue[0]).toBe("test-ingredient-id");
  });

  it("should process the queue and call the API", async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    // Add an ingredient to the queue
    imageQueue.enqueue("test-ingredient-id");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/ingredients/generate-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: "test-ingredient-id",
          name: "",
        }),
      }
    );

    // Verify the queue is empty after processing
    // @ts-ignore - Accessing private property for testing
    expect(imageQueue.queue.length).toBe(0);

    // Verify isProcessing is reset to false
    // @ts-ignore
    expect(imageQueue.isProcessing).toBe(false);
  });

  it("should handle API errors gracefully", async () => {
    // Spy on console.error
    jest.spyOn(console, "error").mockImplementation();

    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: "API error" }),
      statusText: "Internal Server Error",
    });

    // Add an ingredient to the queue
    imageQueue.enqueue("test-ingredient-id");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error generating image: API error"
    );

    // Verify the queue is empty (item was processed despite error)
    // @ts-ignore - Accessing private property for testing
    expect(imageQueue.queue.length).toBe(0);

    // Verify isProcessing is reset to false
    // @ts-ignore
    expect(imageQueue.isProcessing).toBe(false);
  });

  it("should handle fetch exceptions gracefully", async () => {
    // Spy on console.error
    jest.spyOn(console, "error").mockImplementation();

    // Mock fetch to throw an error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    // Add an ingredient to the queue
    imageQueue.enqueue("test-ingredient-id");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error processing image queue:",
      expect.any(Error)
    );

    // Verify the queue is empty (item was processed despite error)
    // @ts-ignore - Accessing private property for testing
    expect(imageQueue.queue.length).toBe(0);

    // Verify isProcessing is reset to false
    // @ts-ignore
    expect(imageQueue.isProcessing).toBe(false);
  });

  it("should process multiple items in the queue sequentially", async () => {
    // Mock fetch to resolve immediately to ensure sequential processing
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

    // Add multiple ingredients
    imageQueue.enqueue("test-ingredient-id-1");
    imageQueue.enqueue("test-ingredient-id-2");
    imageQueue.enqueue("test-ingredient-id-3");

    // Wait for all processing to complete (longer wait time)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify all items were processed
    // @ts-ignore
    expect(imageQueue.queue.length).toBe(0);

    // Fetch should have been called 3 times
    expect(global.fetch).toHaveBeenCalledTimes(3);

    // Verify the final state
    // @ts-ignore
    expect(imageQueue.isProcessing).toBe(false);
  });
});
