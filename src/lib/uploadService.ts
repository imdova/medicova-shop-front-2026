export interface UploadResponse {
  status: string;
  data: {
    url: string;
    filename: string;
  };
  message: string;
}

/**
 * Uploads an image file via the local Next.js API proxy route.
 * This avoids SSL/CORS issues by proxying through the server.
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
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data: any = await response.json();

    console.log("Upload response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }

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
