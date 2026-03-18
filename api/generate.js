// api/generate.js
// Vercel Serverless Function — génère le script d'hypnose via Claude
// Variables d'environnement requises : ANTHROPIC_API_KEY

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel.' });

  const { theme, context, duration, tone, lang = 'fr' } = req.body || {};
  if (!theme) return res.status(400).json({ error: lang === 'fr' ? 'Paramètre "theme" manquant.' : 'Missing "theme" parameter.' });

  const wordTarget = { 10: 650, 15: 850, 20: 1050, 25: 1300 }[duration] || 1000;

  // ── FRENCH ──
  const systemFR = `Tu es un hypnothérapeute expert en hypnose ericksonienne, cohérence cardiaque et psychologie positive.
Tu rédiges des scripts d'auto-hypnose guidée en FRANÇAIS, destinés à être lus à voix haute par un programme TTS (voix douce, rythme lent).

RÈGLES ABSOLUES :
— Texte 100% parlé, naturel. Aucun titre, aucun crochet, aucune annotation, aucune liste numérotée.
— Utilise « ... » suivi d'un espace pour les pauses naturelles (2-4 secondes).
— Phrases courtes à moyennes. Rythme lent et apaisant. Évite les mots techniques ou médicaux.
— Utilise le "tu" bienveillant et chaleureux. Jamais de vouvoiement.
— ${getToneFR(tone)}
— Structure en 4 mouvements progressifs (sans les nommer dans le texte) :
  1. Induction : relaxation physique, respiration, relâchement des tensions
  2. Approfondissement : descente intérieure, ralentissement, images apaisantes
  3. Suggestions profondes liées au thème : visualisation, ressenti corporel, ancrage émotionnel
  4. Retour en douceur : éveil progressif, invitation à noter une action concrète
— Cible environ ${wordTarget} mots.
— Commence par "Installe-toi confortablement..." ou une variante douce.
— Termine toujours par un retour explicite (bouger les doigts, respirer profondément, ouvrir les yeux doucement).`;

  const userFR = `Génère un script d'auto-hypnose en français sur le thème suivant :
Thème : ${theme}
${context ? `Contexte personnel : ${context}` : ''}
Durée visée : ${duration} minutes de lecture lente.
Commence le script directement, sans introduction ni commentaire.`;

  // ── ENGLISH ──
  const systemEN = `You are an expert hypnotherapist specializing in Ericksonian hypnosis, heart coherence and positive psychology.
You write guided self-hypnosis scripts in ENGLISH, designed to be read aloud by a TTS program (soft voice, slow pace).

ABSOLUTE RULES:
— 100% natural spoken text. No titles, no brackets, no annotations, no numbered lists.
— Use "..." followed by a space for natural pauses (2-4 seconds).
— Short to medium sentences. Slow, soothing rhythm. Avoid technical or medical words.
— Use a warm, caring "you". Never formal or clinical.
— ${getToneEN(tone)}
— Structure in 4 progressive movements (without naming them in the text):
  1. Induction: physical relaxation, breathing, releasing tension
  2. Deepening: inner descent, slowing down, peaceful imagery
  3. Deep suggestions related to the theme: visualization, body sensation, emotional anchoring
  4. Gentle return: gradual awakening, invitation to note a concrete action
— Target approximately ${wordTarget} words.
— Begin with "Find a comfortable position..." or a gentle variation.
— Always end with an explicit return (wiggle your fingers, breathe deeply, gently open your eyes).`;

  const userEN = `Generate a self-hypnosis script in English on the following theme:
Theme: ${theme}
${context ? `Personal context: ${context}` : ''}
Target duration: ${duration} minutes of slow reading.
Start the script directly, without any introduction or commentary.`;

  const system = lang === 'en' ? systemEN : systemFR;
  const user   = lang === 'en' ? userEN   : userFR;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3500,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || `Claude API error ${response.status}` });
    }

    const data = await response.json();
    const script = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ script });

  } catch (err) {
    console.error('[generate] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

function getToneFR(tone) {
  return {
    ericksonien:  "Style ericksonien : métaphores indirectes, langage permissif (« il est possible que tu remarques… », « peut-être que… »), suggestions douces, jamais d'injonction directe.",
    directif:     "Style directif bienveillant : instructions courtes, claires, affirmatives (« Ferme les yeux. Respire. Relâche. »), tonalité chaleureuse mais précise.",
    contemplatif: "Style contemplatif et poétique : phrases lentes, imagées, riches en sensations. Métaphores naturelles (eau, lumière, souffle)."
  }[tone] || '';
}

function getToneEN(tone) {
  return {
    ericksonien:  "Ericksonian style: indirect metaphors, permissive language ('you might notice...', 'perhaps...', 'you can allow...'), gentle suggestions, never direct commands.",
    directif:     "Caring directive style: short, clear, affirmative instructions ('Close your eyes. Breathe. Release.'), warm but precise tone.",
    contemplatif: "Contemplative, poetic style: slow, imagery-rich sentences full of sensation. Natural metaphors (water, light, breath)."
  }[tone] || '';
}
