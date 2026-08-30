import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { query, prevMessages }: {query: string, prevMessages: []} = await req.json();

    const embedding_model = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2",
      apiKey: process.env.API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embedding_model,
      {
        url: "https://6a0c8f3e-a357-4cb5-8b2d-4907449fde78.eu-west-1-0.aws.cloud.qdrant.io",
        collectionName: "pdf-rag",
        apiKey: process.env.QDRANT_KEY
      }
    );

    const search_results = await vectorStore.similaritySearch(query);

    let context = "";

    search_results.forEach((obj) => {
      context =
        context +
        `Page content : ${obj.pageContent} \n PageNumber: ${obj.metadata.loc.pageNumber} \n\n\n`;
    });

    const SYSTEM_PROMPT = `
      you are a helpful ai assistant to solve the user query based on a pdf document provided

      you have to answer only according to the context given below, also provide the page no (only of the pdf is on more than 1 page) for better navigation

      Context: 
      ${context}
    `;

    const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = client.chats.create({
      model: "gemini-3.1-flash-lite",
      history: prevMessages.map((ele: {role: string, message: string}) => {
        return {role: ele.role, parts: [{text: ele.message}]}
      }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    const response = await chat.sendMessage({ message: query });

    return NextResponse.json({ success: true, reponse: response.text });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, messgae: "error" });
  }
}
