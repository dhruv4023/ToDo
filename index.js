// Install dependencies: express, mongoose, body-parser, cors, ejs, dotenv
// Run: npm install express mongoose body-parser cors ejs dotenv

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB,
     {dbName:"TaskManager",
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const TaskSchema = new mongoose.Schema({
    title: String,
    description: String,
    stage: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    timestamp: { type: Date, default: Date.now },
    userid: String
});

const Task = mongoose.model('Task', TaskSchema);

// Routes
app.get('/', async (req, res) => {
    const tasks = await Task.find();
    res.render('index', { tasks });
});

app.post('/task', async (req, res) => {
    const { title, description, stage, userid } = req.body;
    const newTask = new Task({ title, description, stage, userid });
    await newTask.save();
    res.redirect('/');
});

app.put('/task/:id', async (req, res) => {
    const { stage } = req.body;
    await Task.findByIdAndUpdate(req.params.id, { stage });
    res.sendStatus(200);
});

app.delete('/task/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

// Drag-and-drop route to update task stages
app.put('/task/drag/:id', async (req, res) => {
    const { stage } = req.body;
    try {
        await Task.findByIdAndUpdate(req.params.id, { stage });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: 'Error updating task' });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
