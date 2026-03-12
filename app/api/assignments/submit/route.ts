import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignmentId") as string;
    const studentId = formData.get("studentId") as string;

    if (!file || !assignmentId || !studentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create storage path
    const timestamp = Date.now();
    const fileName = `${file.name.split(".")[0]}-${timestamp}.${file.name.split(".").pop()}`;
    const filePath = `assignments/${assignmentId}/${studentId}/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get download URL
    const fileUrl = await getDownloadURL(storageRef);

    return NextResponse.json({ fileUrl, fileName }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "File upload failed" },
      { status: 500 }
    );
  }
}
