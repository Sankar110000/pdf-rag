import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

import path from "path";

export default async function indexFile(filename: string | undefined) {
  try {

    if(!filename) {return Response.json({success: false, message: "Not a valid file"})}

    const filepath = path.resolve(process.cwd(), "public/assets/", filename);
    const loader = new PDFLoader(filepath);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200,
      chunkOverlap: 10,
    });
    const splitText = await textSplitter.splitDocuments(docs);

    const embedding_model = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.API_KEY,
      model: "gemini-embedding-2",
    });

    const client = new QdrantClient({ url: "https://6a0c8f3e-a357-4cb5-8b2d-4907449fde78.eu-west-1-0.aws.cloud.qdrant.io", apiKey: process.env.QDRANT_KEY});
    
    await client.deleteCollection("pdf-rag")
    console.log("previous data cleared")

    await QdrantVectorStore.fromDocuments(splitText, embedding_model, {
      collectionName: "pdf-rag",
      client,
    });

    console.log("indexing done");
    return { message: "indexing is compelte" };
  } catch (error) {
    console.log(error);
    NextResponse.json({ message: "Error while indexing the file in the db" });
  }
}
