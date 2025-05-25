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

    // Call DALL-E API
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    // Safely extract URL from response
    if (!response.data || response.data.length === 0) {
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
