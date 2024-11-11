// app/api/upload/route.js
import { NextResponse } from "next/server"
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request) {
    try {
      const data = await request.formData();
      const file = data.get('file');
  
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
  
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
  
      // Ensure directory exists
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
  
      // Simple filename
      const filename = Date.now() + '-' + file.name;
      const path = join(uploadDir, filename);
  
      // Save file
      await writeFile(path, buffer);
  
      return NextResponse.json({ url: `uploads/${filename}` });
    } catch (error) {
      console.error('Upload Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }