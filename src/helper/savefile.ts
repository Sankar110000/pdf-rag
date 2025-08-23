import path from "path";
import { writeFile } from "fs/promises";

export default async function saveFile(file: any) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");
  try {
    await writeFile(
      path.join(process.cwd(), "public/assets/" + filename),
      buffer
    );
    console.log("file saved successfully");
    return {filename};
  } catch (error) {
    console.log("Error occured ", error);
    return null;
  }
}
