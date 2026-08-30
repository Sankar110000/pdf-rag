import indexFile from "@/helper/indexing";
import saveFile from "@/helper/savefile";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("pdf") as File | null;
    if(!file){
      return NextResponse.json({success: false, message: "Please provide a file"})
    }
    const filename = await saveFile(file);
    await indexFile(filename?.filename);
    return NextResponse.json({ message: "working" });
  } catch (error) {
    console.log(error);
  }
}
