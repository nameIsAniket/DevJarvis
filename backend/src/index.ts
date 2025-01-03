require("dotenv").config();
import {GoogleGenerativeAI} from "@google/generative-ai";
console.log(process.env.api_key);

const GeminiApiKey = process.env.api_key

if(!GeminiApiKey) throw new Error("Invalid Api Key")
const genAI = new GoogleGenerativeAI(GeminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function main(){
    const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
    });

    let result = await chat.sendMessageStream("create a todo app in react");
    for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
    }
}
 
main();
