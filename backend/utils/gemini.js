import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const AImodel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(buffer_data, mimeType) {
    return {
        inlineData: {
            data: buffer_data.toString("base64"),
            mimeType,
        },
    };
}

export { AImodel, fileToGenerativePart }