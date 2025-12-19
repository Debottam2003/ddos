import express from 'express';
import fs from 'node:fs/promises';
const app = express();
const PORT = 3333;

app.set('trust proxy', true);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', async () => {
        try {
            await fs.appendFile("dataset.csv", `\n${req.ip},${req.method},${req.url},${res.statusCode},${Date.now() - start}`);
        } catch (err) {
            console.error('Error writing to file', err.message);
        }
    });
    next();
});

app.get('/', async (req, res) => {
    let data = await fs.readFile("data.txt", "utf-8");
    res.send(data);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});