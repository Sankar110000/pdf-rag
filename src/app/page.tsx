"use client";
import Image from "next/image";
import { Children, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiUpload } from "react-icons/fi";

export default function Home() {
  const [messages, setMessages] = useState([{role: "", message: ""}]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [input, setInput] = useState("")

  const handleFileUplaod = () => {
    const ele = document.createElement("input");
    ele.setAttribute("type", "file");
    ele.addEventListener("change", async () => {
      setLoading(true)
      if (ele.files) {
        const file = ele.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append("pdf", ele.files[0]);
          const response = await fetch("/api", {
            method: "POST",
            body: formData,
          });
          const jsonRes = await response.json();
          if (jsonRes.message == "working") {
            setIsFileUploaded(true);
            setLoading(false)
          }
        }
      }
    });
    if (!loading) ele.click()
  };

  const handleSend = async () => {
    try {
      if (input.trim() == "") return
      setMessages((prev) => [...prev, {role: "user", message: input}]) 
      setInput("")
      setIsThinking(true)
      const res = await fetch("/api/chat", {method: "POST", body: JSON.stringify({query: input, prevMessages: messages.filter((msg, idx) => idx != 0 && idx != messages.length)})})
      const jsonRes = await res.json()
      console.log(jsonRes)
      setIsThinking(false)
      setMessages((prev) => [...prev, {role: "model", message: jsonRes.reponse}])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div>
        <div>
          <div className="text-center mb-5">
            <h1 className="text-3xl tracking-tight font-semibold">Notebook LM</h1>
          <p className="tracking-tight">Upload ur notes here & let AI be ur friend 😊</p>
          </div>
          {isFileUploaded ? (
            <div>
            <div className="bg-gray-800 w-100 h-110 rounded-lg p-4 overflow-auto">
              {messages.map((msg, idx) => {
                if (msg.message.trim() == "") return null
                return (
                  <div key={idx} className={`flex text-sm flex-wrap ${msg.role === "user" ? "justify-start flex-row-reverse" : "justify-start" }`}>
                    <img src={msg.role == "model" ? "https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937555.jpg" : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" } className="rounded-[50%] w-9 h-9  ms-2 mt-2 mr-2"></img>
                    <div className={`py-2 px-4 my-2 max-w-full rounded bg-slate-900 `}><ReactMarkdown>{msg.message}</ReactMarkdown></div>
                    
                  </div>
                )
              })}
              {isThinking && (
                      <div className="flex items-center mt-2">
                        <img src="https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937555.jpg" className="rounded-[50%] w-9 h-9 mr-2" />
                        <div className="bg-slate-900 py-2 px-4 rounded animate-pulse">
                          <span className="dot dot1">●</span>
                          <span className="dot dot2">●</span>
                          <span className="dot dot3">●</span>
                        </div>
                      </div>
                    )}
            </div>  
              <div className="w-full mt-4 px-2">
                <input type="text" placeholder="Ask anything about the pdf" className="rounded focus:ring-gray-600 bg-gray-600 mr-2 w-[80%] h-9 ps-2 text-lg" onChange={(e) => setInput(e.target.value)} value={input}/>
                <button className="bg-sky-600 hover:bg-sky-700 px-4 py-1 rounded h-10" onClick={handleSend}>send</button>
              </div>
            </div>
          ) : (
            <div onClick={handleFileUplaod}>
              
              <div className="text-2xl font-bold tracking-tight pb-2 text-center">{loading ? "Ananysing ur file...." : "Upload your file"}</div>
              <div className={`w-100 h-35 border-dashed border border-gray-500 text-gray-500 rounded-lg flex flex-col justify-center items-center ${loading ? "text-gray-700 border-gray-700" : "cursor-pointer"}`}>
                <div className="text-2xl mb-3"><FiUpload/></div>
                <div>File upload</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
