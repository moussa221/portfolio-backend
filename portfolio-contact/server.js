require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Configuration CORS plus sécurisée
const corsOptions = {
  origin: [
    'https://my-portfolio-moussa-thiams-projects.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200 // Pour les requêtes OPTIONS
};

app.use(cors(corsOptions));

// Middleware pour les requêtes OPTIONS (pré-vol)
app.options('*', cors(corsOptions));

app.use(express.json());

// Route pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.post('/send-email', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation basique
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `[PORTFOLIO] ${subject}`,
      text: `De: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <h2>Nouveau message depuis votre portfolio</h2>
        <p><strong>De:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (error) {
    console.error('Erreur d\'envoi:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du message',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint non trouvé' });
});

// Port dynamique pour Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
