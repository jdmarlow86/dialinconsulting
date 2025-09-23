import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import pdfParse from 'pdf-parse';
import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';
import { BUILD_PROMPT, REFINE_PROMPT } from './prompts.js';

const app = express();
const PORT = process.env.PORT || 5055;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

const upload = multer({ dest: 'uploads/' });

const templates = {};
for (const name of ['minimal', 'two-column']) {
    const tpl = await fs.readFile(path.join('templates', `${name}.hbs`), 'utf8');
    templates[name] = Handlebars.compile(tpl);
}

async function renderPdfFromHtml(html) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const pdf = await page.pdf({
            format: 'Letter',
            printBackground: true,
            margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
        });
        return pdf;
    } finally {
        await browser.close();
    }
}

app.post('/api/resume/build', async (req, res) => {
    try {
        const { candidate, style = 'minimal', useGPT = true } = req.body;
        if (!candidate || !candidate.name) {
            return res.status(400).json({ error: 'Missing candidate data (name required).' });
        }

        let structured = candidate;
        if (useGPT) {
            const msg = [
                { role: 'system', content: 'You transform structured resume hints into full, ATS-friendly resume JSON.' },
                { role: 'user', content: `${BUILD_PROMPT}\n\nCandidate JSON:\n${JSON.stringify(candidate)}` }
            ];
            const out = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: msg,
                temperature: 0.2,
                response_format: { type: 'json_object' }
            });
            structured = JSON.parse(out.choices[0].message.content || '{}');
        }

        const tpl = templates[style] || templates['minimal'];
        const html = tpl({ ...structured, baseUrl: `${BASE_URL}/public` });
        const pdf = await renderPdfFromHtml(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${structured.name.replace(/\s+/g, '_')}_Resume.pdf"`);
        return res.send(pdf);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to build resume.' });
    }
});

app.post('/api/resume/refine', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        // Extract text from PDF (PDF only for MVP; DOCX could be added with mammoth)
        let text = '';
        if (req.file.mimetype === 'application/pdf') {
            const buf = await fs.readFile(req.file.path);
            const parsed = await pdfParse(buf);
            text = parsed.text;
        } else {
            return res.status(400).json({ error: 'Please upload a PDF for now.' });
        }

        await fs.unlink(req.file.path).catch(() => { });

        const out = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: 'You refine resumes accurately, preserving truth.' },
                { role: 'user', content: `${REFINE_PROMPT}\n\nRAW_TEXT:\n${text}` }
            ]
        });

        const data = JSON.parse(out.choices[0].message.content || '{}');
        return res.json(data); // { improved: {...}, suggestions:[...] }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to refine resume.' });
    }
});

app.post('/api/resume/build-from-structured', async (req, res) => {
    // Allows front-end to send already-edited JSON (e.g., after refine step)
    try {
        const { structured, style = 'minimal' } = req.body;
        if (!structured || !structured.name) {
            return res.status(400).json({ error: 'Missing structured resume data (name required).' });
        }
        const tpl = templates[style] || templates['minimal'];
        const html = tpl({ ...structured, baseUrl: `${BASE_URL}/public` });
        const pdf = await renderPdfFromHtml(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${structured.name.replace(/\s+/g, '_')}_Resume.pdf"`);
        return res.send(pdf);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'PDF generation failed.' });
    }
});

app.get('/', (_req, res) => res.send('Resume API is running.'));
app.listen(PORT, () => console.log(`Resume API on http://localhost:${PORT}`));
