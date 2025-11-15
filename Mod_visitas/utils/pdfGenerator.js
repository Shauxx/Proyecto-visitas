// utils/pdfGenerator.js
import PDFDocument from 'pdfkit';
import getStream from 'get-stream'; // optional to convert stream to buffer, install if needed: npm i get-stream
import dayjs from 'dayjs';

export const generateVisitaPdfBuffer = async (visita, cliente, tecnico) => {
    const doc = new PDFDocument({ margin: 40 });
    // collect into buffer
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    const fecha = dayjs(visita.fechaProgramada).format('YYYY-MM-DD HH:mm');

    doc.fontSize(18).text('Reporte de Visita', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`ID Visita: ${visita.id}`);
    doc.text(`Cliente: ${cliente ? cliente.nombre + ' ' + cliente.apellido : 'N/A'}`);
    doc.text(`Técnico: ${tecnico ? tecnico.nombre + ' ' + tecnico.apellido : 'N/A'}`);
    doc.text(`Fecha Programada: ${fecha}`);
    doc.moveDown();

    doc.fontSize(14).text('Observaciones:', { underline: true });
    doc.fontSize(12).text(visita.observaciones || 'Sin observaciones');
    doc.moveDown();

    doc.fontSize(14).text('Recomendaciones / Motivo:', { underline: true });
    doc.fontSize(12).text(visita.motivo || 'N/A');
    doc.moveDown();

    doc.fontSize(10).text(`Generado: ${dayjs().format('YYYY-MM-DD HH:mm')}`, { align: 'right' });

    doc.end();

    const buffer = Buffer.concat(buffers);
    return buffer;
};
