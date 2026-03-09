import { apiClient } from "./apiClient";

export interface UploadResponse {
  status: string;
  data: {
    url: string;
    filename: string;
  };
  message: string;
}

/**
 * Uploads an image file directly via apiClient.
 * @param file The image file to upload
 * @param category The upload category (e.g. "category", "brand")
 * @param token Optional authorization token
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(
  file: File,
  category: string,
  token?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("images", file);
  formData.append("category", category);

  try {
    const data = await apiClient<any>({
      endpoint: "/upload/images",
      method: "POST",
      body: formData,
      token,
    });

    console.log("Upload response:", JSON.stringify(data));

    // Try to extract the image URL from various possible response shapes
    const url =
      data?.data?.url ||
      data?.data?.image ||
      data?.data?.images?.[0] ||
      data?.url ||
      data?.image ||
      data?.images?.[0] ||
      (typeof data?.data === "string" ? data.data : null);

    if (url) {
      return url;
    }

    throw new Error("Upload succeeded but could not extract image URL from response");
  } catch (error: any) {
    console.error("Image upload error:", error);
    throw error;
  }
}
