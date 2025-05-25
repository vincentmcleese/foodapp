import { supabaseAdmin } from "@/lib/supabase";

/**
 * Manages a queue of ingredient IDs to generate images for,
 * ensuring we don't overload the API and track generation status
 */
class ImageGenerationQueue {
  private queue: string[] = [];
  private isProcessing = false;
  private maxConcurrent = 1;
  private processingCount = 0;

  /**
   * Add an ingredient to the image generation queue
   * @param ingredientId The ID of the ingredient to generate an image for
   */
  enqueue(ingredientId: string) {
    console.log(`Enqueueing ingredient for image generation: ${ingredientId}`);

    // Don't add duplicates to the queue
    if (!this.queue.includes(ingredientId)) {
      this.queue.push(ingredientId);
      this.processQueue();
    }
  }

  /**
   * Process the next item in the queue
   */
  private async processQueue() {
    if (
      this.isProcessing ||
      this.queue.length === 0 ||
      this.processingCount >= this.maxConcurrent
    ) {
      return;
    }

    this.isProcessing = true;

    try {
      const ingredientId = this.queue.shift();
      if (!ingredientId) return;

      this.processingCount++;

      // Directly call the image generation API
      // The API will handle status updates server-side
      const response = await fetch("/api/ingredients/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: ingredientId,
          name: "", // The API will fetch the name on the server side
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `Error generating image: ${errorData.error || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error processing image queue:", error);
    } finally {
      this.isProcessing = false;
      this.processingCount--;

      // Process next item in queue
      this.processQueue();
    }
  }
}

// Export a singleton instance
export const imageQueue = new ImageGenerationQueue();
