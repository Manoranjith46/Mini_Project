import axios from "axios";

// Using Pollinations AI - completely free, no API key needed!
const POLLINATIONS_API = "https://image.pollinations.ai/prompt";

// Improved prompts for different issue types to get better images
const getPromptForIssueType = (issueType: string, title: string, description: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  // Check for water-related keywords and use simple prompt
  if (lowerTitle.includes("water") || lowerTitle.includes("leak") || lowerTitle.includes("pipe") || 
      lowerDesc.includes("water") || lowerDesc.includes("leak") || lowerDesc.includes("pipe")) {
    return `Water leak pipe burst damage infrastructure`;
  }
  
  if (issueType.includes("Road")) {
    return `Road pothole damage street`;
  }
  
  if (issueType.includes("Waste")) {
    return `Garbage debris litter waste`;
  }
  
  if (issueType.includes("Environmental")) {
    return `Environmental pollution damage`;
  }
  
  if (issueType.includes("Utilities")) {
    return `Utility infrastructure pipes damage`;
  }
  
  if (issueType.includes("Safety")) {
    return `Public safety hazard danger`;
  }
  
  return `${issueType} problem issue`;
};

export const generateImageFromIssue = async (
  issueType: string,
  title: string,
  description: string
): Promise<Buffer | null> => {
  try {
    // Create a better descriptive prompt based on issue type
    const prompt = getPromptForIssueType(issueType, title, description);

    console.log("🎨 Generating realistic image with Pollinations AI for:", issueType);
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");

    // Use Pollinations AI - free, fast, no authentication needed
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `${POLLINATIONS_API}/${encodedPrompt}`;

    console.log("🔗 Image URL (first 100 chars):", imageUrl.substring(0, 100) + "...");

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 60000, // 60 second timeout for image generation
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (response.status === 200 && response.data && response.data.length > 100) {
      console.log("✅ AI Image generated successfully, size:", response.data.length, "bytes");
      return Buffer.from(response.data);
    } else {
      console.warn("⚠️  Invalid response from Pollinations:", {
        status: response.status,
        dataLength: response.data?.length || 0,
      });
      return null;
    }
  } catch (error: any) {
    console.error("❌ Error generating AI image:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data length:", error.response.data?.length || 0);
    }
    // Return null if generation fails - fallback will be used
    return null;
  }
};

// Fallback: Generate a placeholder image using a reliable service
export const generatePlaceholderImage = async (
  issueType: string
): Promise<Buffer> => {
  try {
    console.log("Generating placeholder image for:", issueType);
    
    // Color map for different issue types
    const colorMap: { [key: string]: string } = {
      "Road Infrastructure": "FF6B6B",
      "Waste Management": "4ECDC4",
      "Environmental Issues": "45B7D1",
      "Utilities & Infrastructure": "FFA07A",
      "Public Safety": "98D8C8",
      Other: "A8A8A8",
    };

    const color = colorMap[issueType] || "A8A8A8";
    const text = encodeURIComponent(issueType.substring(0, 20));
    
    // Use dummyimage.com - very reliable
    const placeholderUrl = `https://dummyimage.com/640x480/${color}/FFFFFF.jpg&text=${text}`;
    
    console.log("Fetching placeholder from dummyimage.com");

    const response = await axios.get(placeholderUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    console.log("Placeholder image generated successfully, size:", response.data.length);
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Error generating placeholder image:", error);
    
    // Fallback 2: Try alternate service
    try {
      console.log("Trying fallback placeholder service...");
      
      const colorMap: { [key: string]: string } = {
        "Road Infrastructure": "ff6b6b",
        "Waste Management": "4ecdc4",
        "Environmental Issues": "45b7d1",
        "Utilities & Infrastructure": "ffa07a",
        "Public Safety": "98d8c8",
        Other: "a8a8a8",
      };

      const color = colorMap[issueType.toLowerCase()] || "a8a8a8";
      const text = encodeURIComponent(issueType.substring(0, 20));
      
      // Try via.placeholder.com
      const fallbackUrl = `https://via.placeholder.com/640x480/${color}?text=${text}`;
      
      const fallbackResponse = await axios.get(fallbackUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });

      console.log("Fallback placeholder generated successfully");
      return Buffer.from(fallbackResponse.data);
    } catch (fallbackError) {
      console.error("Error with fallback placeholder:", fallbackError);
      
      // Last resort: Generate a simple solid color JPEG
      console.log("Creating minimal JPEG fallback...");
      
      // Generate a minimal valid JPEG (solid color)
      const colorMap: { [key: string]: string } = {
        "Road Infrastructure": "#FF6B6B",
        "Waste Management": "#4ECDC4",
        "Environmental Issues": "#45B7D1",
        "Utilities & Infrastructure": "#FFA07A",
        "Public Safety": "#98D8C8",
        Other: "#A8A8A8",
      };

      const hexColor = colorMap[issueType] || "#A8A8A8";
      
      // Minimal valid JPEG marker sequence (1x1 red pixel)
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
        0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
        0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
        0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
        0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
        0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00,
        0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
        0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
        0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x34, 0x35,
        0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55,
        0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
        0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x92, 0x93, 0x94,
        0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2,
        0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
        0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6,
        0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA,
        0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD0, 0xFF, 0xD9,
      ]);

      return jpegBuffer;
    }
  }
};
