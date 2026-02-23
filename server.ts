import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { XMLParser } from 'fast-xml-parser';
import { Resend } from 'resend';

dotenv.config();

const __dirname = path.resolve();
const parser = new XMLParser();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CBO API Proxy
  app.get('/api/cbo', async (req, res) => {
    const { words } = req.query;
    if (!words || (words as string).length < 3) {
      return res.json([]);
    }

    try {
      const response = await fetch(`https://sistemas.unasus.gov.br/ws_cbo/cbo.php?words=${encodeURIComponent(words as string)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/xml, text/xml, */*'
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: `API returned status ${response.status}` });
      }

      const buffer = await response.arrayBuffer();
      // Try UTF-8 first since the previous ISO-8859-1 attempt showed UTF-8 characters (Ã³)
      const decoder = new TextDecoder('utf-8');
      let xmlData = decoder.decode(buffer);
      
      if (!xmlData || xmlData.trim() === '') {
        return res.json([]);
      }

      // Strip XML declaration and any leading/trailing whitespace
      xmlData = xmlData.replace(/<\?xml[^?]*\?>/i, '').trim();

      // Wrap in a root tag
      const wrappedXml = `<root>${xmlData}</root>`;
      let jsonObj;
      try {
        jsonObj = parser.parse(wrappedXml);
      } catch (parseError: any) {
        return res.status(500).json({ error: `XML Parse Error: ${parseError.message}` });
      }
      
      // Try to find cbo_response in various places
      let results = [];
      const root = jsonObj.root;
      
      if (root) {
        if (root.cbo_response) {
          results = root.cbo_response;
        } else {
          // Fallback for different structures
          const keys = Object.keys(root);
          for (const key of keys) {
            if (root[key]?.cbo_response) {
              results = root[key].cbo_response;
              break;
            }
          }
        }
      }

      if (!Array.isArray(results)) {
        results = results ? [results] : [];
      }

      // Filter and map
      const formatted = results
        .filter((item: any) => item && (item.cbo || item.descricao))
        .map((item: any) => ({
          codigo: String(item.cbo || ''),
          nome: String(item.descricao || ''),
          sinonimos: String(item.sinonimos || '')
        }));

      res.json(formatted);
    } catch (error: any) {
      console.error('CBO API Error:', error);
      res.status(500).json({ error: error.message || 'Erro ao consultar API CBO' });
    }
  });

  // Notification API
  app.post('/api/notify-application', async (req, res) => {
    const { companyEmail, companyName, jobTitle, candidateName, candidateEmail, candidatePhone, candidateMessage } = req.body;
    
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Skipping email notification.');
      return res.json({ success: false, message: 'Email service not configured' });
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: 'Recrutamento <onboarding@resend.dev>',
        to: companyEmail,
        subject: `Nova Candidatura: ${candidateName} para ${jobTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <h2 style="color: #10b981;">Nova Candidatura Recebida!</h2>
            <p>Olá <strong>${companyName}</strong>,</p>
            <p>Você recebeu uma nova candidatura para a vaga: <strong>${jobTitle}</strong>.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; font-size: 16px; color: #374151;">Dados do Candidato:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Nome:</strong> ${candidateName}</li>
                <li><strong>E-mail:</strong> ${candidateEmail}</li>
                <li><strong>Telefone:</strong> ${candidatePhone}</li>
              </ul>
              ${candidateMessage ? `<p><strong>Mensagem:</strong><br/><em>"${candidateMessage}"</em></p>` : ''}
            </div>
            
            <p>Acesse seu painel para gerenciar esta candidatura e agendar uma entrevista.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">Este é um e-mail automático enviado pelo seu sistema de recrutamento.</p>
          </div>
        `
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Resend Error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // --- Vite / Production Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
