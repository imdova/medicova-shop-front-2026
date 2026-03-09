import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("images") as File | null;
    const category = formData.get("category") as string | null;

    if (!file) {
      return NextResponse.json(
        { status: "error", message: "No image file provided" },
        { status: 400 },
      );
    }

    // Build the backend URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
    if (baseUrl) {
      baseUrl = baseUrl.replace(/\/$/, "");
      if (!baseUrl.includes("/api/v1")) {
        baseUrl = `${baseUrl}/api/v1`;
      }
    } else {
      baseUrl = "https://shop-api.medicova.net/api/v1";
    }



    // Forward the file to the backend upload endpoint
    const backendFormData = new FormData();
    backendFormData.append("images", file);
    if (category) {
      backendFormData.append("category", category);
    }

    // Extract auth token from request headers
    const authHeader = req.headers.get("authorization");

    const backendResponse = await fetch(`${baseUrl}/upload/images`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: backendFormData,
    }).catch((err) => {
      console.error(`DEBUG: Upload Proxy fetch failed for ${baseUrl}/upload/images:`, err);
      throw err;
    });

    console.log(`DEBUG: Upload Proxy backend status: ${backendResponse.status} for ${baseUrl}/upload/images`);
    const responseText = await backendResponse.text();
    console.log("DEBUG: Upload Proxy backend response text sample:", responseText.substring(0, 200));

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Backend upload response (not JSON):", responseText);
      return NextResponse.json(
        {
          status: "error",
          message: `Backend returned invalid response (Status ${backendResponse.status})`,
        },
        { status: 502 },
      );
    }

    if (!backendResponse.ok) {
      console.error("Backend upload error:", data);
      return NextResponse.json(
        {
          status: "error",
          message:
            data.message ||
            data.error ||
            `Upload failed with status ${backendResponse.status}`,
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Upload proxy failed",
      },
      { status: 500 },
    );
  }
}
