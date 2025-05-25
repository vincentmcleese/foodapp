import OpenAI from "openai";

/**
 * Generates an image for an ingredient using DALL-E 3
 * @param ingredientName The name of the ingredient to generate an image for
 * @returns URL of the generated image or null if generation failed
 */
export async function generateIngredientImage(
  ingredientName: string
): Promise<string | null> {
  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Use the exact prompt specified in the masterdoc
    const prompt = `A photorealistic, high-resolution food photograph of a ${ingredientName}, elegantly plated on a round, off-white, lightly speckled ceramic plate. The plate sits centered on a warm, medium-tone wooden table with visible wood grain. The image is captured from a top-down (90-degree overhead) angle with soft, natural lighting from the top left. Use shallow depth of field, neutral shadows, and a clean white background outside the plate. The composition should follow consistent proportions: plate fills 80% of the frame, centered precisely. The overall style matches high-end editorial food photography.`;

    console.log(`Generating image for ingredient: ${ingredientName}`);

    // Implement retry logic with exponential backoff
    const MAX_RETRIES = 3;
    let retries = 0;
    let response: OpenAI.Images.ImagesResponse | undefined;

    while (retries < MAX_RETRIES) {
      try {
        // Call DALL-E API
        response = await openai.images.generate({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        });

        // If successful, break out of retry loop
        break;
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error?.status === 429) {
          retries++;
          if (retries >= MAX_RETRIES) {
            console.error(
              `Rate limit hit, max retries (${MAX_RETRIES}) exceeded for ${ingredientName}`
            );
            throw error;
          }

          // Calculate exponential backoff time: 2^retries seconds (2, 4, 8, etc.)
          const backoffTime = Math.pow(2, retries) * 1000;
          console.log(
            `Rate limit hit, retrying in ${
              backoffTime / 1000
            } seconds for ${ingredientName}`
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } else {
          // Not a rate limit error, rethrow
          throw error;
        }
      }
    }

    // Safely extract URL from response
    if (!response || !response.data || response.data.length === 0) {
      console.error("No image data returned from DALL-E API");
      return null;
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      console.error("No image URL returned from DALL-E API");
      return null;
    }

    console.log(`Image generated successfully for ${ingredientName}`);

    return imageUrl;
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    return null;
  }
}
