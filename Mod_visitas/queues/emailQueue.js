// queues/emailQueue.js
import Bull from 'bull';
import Redis from 'ioredis';
import sendgrid from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(redisUrl);

// inicializa sendgrid
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const emailQueue = new Bull('emailQueue', redisUrl);

// worker inline (se procesa en el mismo proceso)
emailQueue.process(async (job) => {
    const { to, cc, subject, text, html, attachments } = job.data;

    const msg = {
        to,
        from: process.env.SENDGRID_FROM,
        subject,
        text,
        html,
        cc,
        attachments, // debe ser array de {content: base64, filename, type, disposition}
    };

    try {
        await sendgrid.send(msg);
        return { ok: true };
    } catch (err) {
        console.error('Error enviando correo:', err);
        throw err;
    }
});

export default emailQueue;
