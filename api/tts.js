// api/tts.js
// Vercel Serverless Function — synthèse vocale via ElevenLabs
// Variables d'environnement requises : ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (optionnel)
// Limite Vercel : payload réponse max 4.5 MB → on traite chunk par chunk depuis le front

export const config = {
  api: {
    responseLimit: '8mb',    // augmente la limite pour les fichiers audio
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY non configurée dans Vercel.' });
  }

  const { text, voiceId } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Paramètre "text" manquant.' });
  }

  // voiceId : priorité au paramètre front, sinon variable d'env, sinon Rachel par défaut
  const voice = voiceId
    || process.env.ELEVENLABS_VOICE_ID
    || '21m00Tcm4TlvDq8ikWAM'; // Rachel

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.74,
            similarity_boost: 0.82,
            style: 0.06,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.detail?.message || `ElevenLabs API erreur ${response.status}`
      });
    }

    // Retourne le fichier audio directement au front
    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error('[tts] Erreur :', err);
    return res.status(500).json({ error: err.message });
  }
}
