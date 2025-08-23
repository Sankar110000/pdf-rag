import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";

import path from "path";

export default async function indexFile(filename: any) {
  try {
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
      model: "text-embedding-004",
    });

    const client = new QdrantClient({ url: "http://localhost:6333/" });
    
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
