import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
    try {
        const msg = {
            to,
            from: process.env.EMAIL_FROM,
            subject,
            text,
            html,
            attachments
        };

        await sgMail.send(msg);
        return true;
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
        return false;
    }
};
