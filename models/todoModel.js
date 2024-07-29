const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["todo", "inprogress", "done"]
    },
    content: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: new Date()
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
