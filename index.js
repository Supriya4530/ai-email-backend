const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-email', async (req, res) => {
  const { prompt } = req.body;
  try {
    const completion = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const content = completion.data.choices[0].message.content;
    res.json({ email: content });
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed.' });
  }
});

app.post('/send-email', async (req, res) => {
  const { recipients, content } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.split(','),
      subject: 'AI Generated Email',
      text: content,
    });
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Email sending failed' });
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
