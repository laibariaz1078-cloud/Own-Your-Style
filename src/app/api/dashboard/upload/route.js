import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "seller" && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}-${file.name}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error("Error creating uploads directory:", err);
    }

    // Save file to public/uploads
    const filepath = path.join(uploadsDir, filename);
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(buffer));

    // Return the image URL
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        url: imageUrl,
        filename,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
