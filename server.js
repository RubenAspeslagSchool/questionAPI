const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

app.get('/api/questions', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to read database' });
            return;
        }
        const db = JSON.parse(data);
        res.json(db.questions);
    });
});

app.post('/api/questions', (req, res) => {
    const newQuestion = req.body;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to read database' });
            return;
        }
        const db = JSON.parse(data);
        newQuestion.id = db.questions.length + 1;
        db.questions.push(newQuestion);
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), err => {
            if (err) {
                res.status(500).send({ error: 'Failed to update database' });
                return;
            }
            res.status(201).send(newQuestion);
        });
    });
});

app.post('/api/answers', (req, res) => {
    const { questionId, answer } = req.body;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({ error: 'Failed to read database' });
            return;
        }
        const db = JSON.parse(data);
        const question = db.questions.find(q => q.id === questionId);
        if (question) {
            question.answers.push(answer);
            fs.writeFile(dbPath, JSON.stringify(db, null, 2), err => {
                if (err) {
                    res.status(500).send({ error: 'Failed to update database' });
                    return;
                }
                res.status(201).send({ message: 'Answer added successfully' });
            });
        } else {
            res.status(404).send({ error: 'Question not found' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
