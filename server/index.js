const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend requests

// ✅ Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/summarizerDB"; // Change if using MongoDB Atlas
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define a Schema for Summaries
const summarySchema = new mongoose.Schema({
    text: String,
    summary: String,
    createdAt: { type: Date, default: Date.now }
});

const Summary = mongoose.model("Summary", summarySchema);

// ✅ Text Summarization Function
function summarizeText(text, numSentences = 2) {
    if (!text || text.length === 0) return "No text provided for summarization.";

    const sentences = text.match(/[^.!?]+[.!?]/g) || []; 
    const stopWords = new Set(["the", "is", "in", "and", "to", "a", "of", "for", "on", "with", "as", "at", "an", "this", "it", "by", "that", "from", "or", "but", "be"]);
    const words = text.toLowerCase().match(/\b\w+\b/g) || []; 
    
    let wordFreq = {};
    words.forEach(word => {
        if (!stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    let sentenceScores = {};
    sentences.forEach(sentence => {
        let sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        let score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
        sentenceScores[sentence] = score;
    });

    const sortedSentences = Object.entries(sentenceScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, numSentences)
        .map(entry => entry[0]);

    return sortedSentences.join(' ');
}

// ✅ API Route for Summarization (Saves to MongoDB)
app.post('/summarize', async (req, res) => {
    const { text, numSentences } = req.body;
    const summary = summarizeText(text, numSentences);

    try {
        const newSummary = new Summary({ text, summary });
        await newSummary.save(); // Save to MongoDB
        res.json({ summary });
    } catch (error) {
        console.error("❌ Error saving summary:", error);
        res.status(500).json({ message: "Error saving summary" });
    }
});

// ✅ API Route to Get All Summaries
app.get('/summaries', async (req, res) => {
    try {
        const summaries = await Summary.find().sort({ createdAt: -1 });
        res.json(summaries);
    } catch (error) {
        console.error("❌ Error fetching summaries:", error);
        res.status(500).json({ message: "Error fetching summaries" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
