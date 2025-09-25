# ApkaRakshak Law Bot

A simple AI-powered law bot that can answer legal questions based on your law.pdf document.

## Features

- 🤖 AI-powered legal assistance using Google Gemini
- 📄 Queries your 402-page law.pdf document
- 💬 Simple web interface for asking questions
- ⚖️ Focused on Indian laws and government support
- 🔍 Accurate responses based only on the PDF content

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Server:**
   ```bash
   npm start
   ```

3. **Access the Bot:**
   Open your browser and go to: `http://localhost:3001`

## How It Works

1. The bot loads your `law.pdf` file on startup
2. When you ask a question, it sends the entire PDF content + your question to Google Gemini
3. Gemini analyzes the PDF and provides accurate legal information
4. The bot only provides information that exists in your PDF - no made-up content

## Example Questions

- "What are my rights if my husband beats me?"
- "What are the laws against cheating in marriage?"
- "What are women's rights in India?"
- "What are the laws for cyber crimes?"
- "What are my rights if I am arrested?"

## API Endpoints

- `GET /` - Main web interface
- `POST /api/query` - Send questions to the bot
- `GET /api/health` - Check server and PDF status

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (default: 3001)

## Files Structure

```
law-bot/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables
├── public/
│   └── index.html    # Web interface
└── README.md         # This file
```

## Troubleshooting

- Make sure your `law.pdf` is in the parent directory
- Check that your Gemini API key is valid
- Ensure the server is running on port 3001
- Check the console for any error messages

## For Hackathon

This is a quick and simple implementation perfect for hackathons. The bot provides reliable legal information based solely on your PDF content, making it trustworthy for legal queries.
