const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String },
    content: { type: String, required: true },
    tags: { type: [String], defaults: [] },
    isPinned: { type: Boolean, default: false },
    userId: { type: String, required: true },
    createOn: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("Note", noteSchema);