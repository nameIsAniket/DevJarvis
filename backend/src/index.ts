require("dotenv").config();
import express from "express";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {getSystemPrompt} from './prompt';
import {additionalReactBasePromt, reactBasePromt, SystemPromt1, SystemPromt2, SystemPromt3} from './text'
import { nodeTemplate, reactTemplate } from "./baseTemplate";

const GeminiApiKey = process.env.api_key

if(!GeminiApiKey) throw new Error("Invalid Api Key")
const genAI = new GoogleGenerativeAI(GeminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express()

app.use(express.json())
 
app.post("/template",async(req,res) => {
  try{
    const prompt:string = req.body.prompt;
    const systemPrompt = "base on prompt given return which project this should be. only answer in one word 'node' or 'react' ";
    let result= await model.generateContent(`prompt : ${prompt} \n` + `systemPrompt : ${systemPrompt}`);

    const responsetext =result.response.text().trim();
    // console.log(responsetext);

    if(responsetext === "undefined"){
      res.status(400).json({msg : "Undefined reponse"});
      return;
    }

    if(responsetext !== "node" && responsetext !== "react"){
      res.status(400).json({msg: "invalid request"});
      return;
    }
  
    if(responsetext === "node"){
      res.status(200).json({
        template : nodeTemplate,
        default : ""
      });
      return;
    }

    if(responsetext === "react"){
      res.status(200).json({
        template : reactTemplate.template,
        default : reactBasePromt,
        additionalPromt : additionalReactBasePromt
      });
      return;
    }

  }catch(err){
    res.status(500).json({error : err})
    return;
  }
})

app.post("/chat", async(req,res) => {
  const baseFilePrompt = req.body.default;
  const baseTemplate = req.body.template;
  const additionalPromt = req.body.additionalPromt;

  const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `${getSystemPrompt}`}],
        },
        // {
        //   role: "model",
        //   parts: [{ text: "Great to meet you. What would you like to know?" }],
        // },
      ],
  });

  let result = await chat.sendMessageStream(`${SystemPromt1}`);

  for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
  }

  let result2 = await chat.sendMessageStream(`${SystemPromt2}`);

  for await (const chunk of result2.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
  }

  let result3 = await chat.sendMessageStream(`${SystemPromt3}`);

  for await (const chunk of result3.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
  }
})

app.listen(3000,()=>{console.log("app is listing on port 3000")})

