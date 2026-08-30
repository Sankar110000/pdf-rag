import indexFile from "@/helper/indexing";
import saveFile from "@/helper/savefile";

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("pdf") as File | null;
    if(!file){
      return Response.json({success: false, message: "Please provide a file"})
    }
    const filename = await saveFile(file);
    await indexFile(filename?.filename);
    return Response.json({ message: "working" });
  } catch (error) {
    console.log(error);
  }
}
