import { AImodel, fileToGenerativePart } from "./gemini.js";

async function AIAnalyser(req, res) {
    console.log(req.body)
    console.log(req.file)

    const { description = "", title = "" } = req.body;

    const complaint_data = {}

    const prompt =
        `You are an AI assistant specialized in classifying and describing complaints based on the description and image provided. Your primary task is to analyze the input data, considering both the textual description and the image, and describe the title, crime type, image description,severity,suspect description and victim description.
        If description is not provided then only consider the image.
        If the image and description does not match always consider the image as your primary source of information.
            Description:
                ${description}

            Task Requirements:
            Description Generation and Image Analysis: Thoroughly analyze the provided description and image. Generate a detailed description based on this analysis, combining insights from the image and the user's provided text. Use the combined information to classify the complaint and describe the image. The priority should reflect the urgency of the issue, considering both the textual context and the visual evidence.
            Categorization & Prioritization: The priority should be categorized as "high," "medium," or "low."
            JSON Output: Provide the analysis in the following JSON format:
            {
            "title": "",
            "category": "",
            "crime_type": "",
            "AI_description": "",
            "priority": "",
            "severity": "",
            "suspect_description": "",
            "victim_description": ""
            }
    
            Ensure that the analysis strictly adheres to this output pattern and that the data extracted from the description, images, and videos is accurate.
        `;

    const imagePart = fileToGenerativePart(
        req.file.buffer,
        req.file.mimetype,
    );

    try {
        const result = await AImodel.generateContent([prompt, imagePart]);

        const AI_response = result.response.text();

        const first_index = AI_response.indexOf('{')
        const last_index = AI_response.lastIndexOf('}')

        const AI_json = AI_response.slice(first_index, last_index + 1)

        console.log(AI_json)

        complaint_data.AI_analysis = JSON.parse(AI_json)

        console.log(complaint_data)
        
        
    }
    catch (err) {
        console.error(err)
        res.status(500).send("Internal server error")
    }

}

export { AIAnalyser }