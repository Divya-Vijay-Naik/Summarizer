const mongoose = require("mongoose");

const SummarySchema = new mongoose.Schema({
    text: { type: String, required: true },
    summary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Summary", SummarySchema);
