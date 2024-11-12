// app/api/upload/route.js
import { NextResponse } from "next/server"
import path from 'path'
import fs from 'fs/promises'

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
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
  
      // Simple filename
      const filename = Date.now() + '-' + file.name;
      const path = path.join(uploadDir, filename);
  
      // Save file
      await fs.writeFile(path, buffer);
  
      return NextResponse.json({ url: `uploads/${filename}` });
    } catch (error) {
      console.error('Upload Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }