import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const OPENAI_API_KEY= null;

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

interface JobData {
    'work_year': number,
    'experience_level': string,
    'employment_type': string,
    'job_title': string,
    'salary': number,
    'salary_currency': string,
    'salary_in_usd': number,
    'employee_residence': string,
    'remote_ratio': number,
    'company_location': string,
    'company_size': string,
}

let data: JobData[];
try {
    data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/assets/salaries.json'), 'utf-8'));
} catch (error) {
    console.error('Error reading JSON file:', error);
    process.exit(1);
}

async function getEmbedding(text: string): Promise<number[]> {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                input: text,
                model: 'text-embedding-ada-002',
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.embedding;
    } catch (error) {
        console.error('Error fetching embeddings:');
        throw new Error('Failed to fetch embeddings');
    }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

app.post('/api/chat', async (req: Request, res: Response) => {
    const { message } = req.body;

    try {
        const embedding = await getEmbedding(message);

        let mostSimilarEntry: JobData | null = null;
        let highestSimilarity = -1;

        for (const entry of data) {
            const entryText = `${entry.job_title} ${entry.experience_level} ${entry.employment_type} ${entry.company_location}`;
            const entryEmbedding = await getEmbedding(entryText);
            const similarity = cosineSimilarity(embedding, entryEmbedding);

            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                mostSimilarEntry = entry;
            }
        }

        let responseText = 'I couldn\'t find relevant data based on your query.';
        if (mostSimilarEntry) {
            responseText = `Based on your query, here's some relevant data:\nJob Title: ${mostSimilarEntry.job_title}\nExperience Level: ${mostSimilarEntry.experience_level}\nEmployment Type: ${mostSimilarEntry.employment_type}\nCompany Location: ${mostSimilarEntry.company_location}\nSalary in USD: ${mostSimilarEntry.salary_in_usd}`;
        }

        res.json({ reply: responseText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing your request');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log("OPEN_AI_KEY", process.env.OPENAI_API_KEY);
});
