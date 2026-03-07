// api/generate.js
// Vercel Serverless Function — génère le script d'hypnose via Claude
// Variables d'environnement requises : ANTHROPIC_API_KEY

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée dans Vercel.' });
  }

  const { theme, context, duration, tone } = req.body || {};

  if (!theme) {
    return res.status(400).json({ error: 'Paramètre "theme" manquant.' });
  }

  const wordTarget = { 10: 650, 15: 850, 20: 1050, 25: 1300 }[duration] || 1000;

  const toneGuide = {
    ericksonien:  'Style ericksonien : métaphores indirectes, langage permissif (« il est possible que tu remarques… », « peut-être que… », « tu peux laisser… »), suggestions douces, jamais d\'injonction directe.',
    directif:     'Style directif bienveillant : instructions courtes, claires, affirmatives (« Ferme les yeux. Respire. Relâche. »), tonalité chaleureuse mais précise.',
    contemplatif: 'Style contemplatif et poétique : phrases lentes, imagées, riches en sensations, comme une méditation profonde. Métaphores naturelles (eau, lumière, souffle).'
  }[tone] || '';

  const system = `Tu es un hypnothérapeute expert en hypnose ericksonienne, cohérence cardiaque et psychologie positive.
Tu rédiges des scripts d'auto-hypnose guidée en français, destinés à être lus à voix haute par un programme TTS (voix douce, rythme lent).

RÈGLES ABSOLUES :
— Texte 100% parlé, naturel. Aucun titre, aucun crochet, aucune annotation, aucune liste numérotée.
— Utilise « ... » suivi d'un espace pour les pauses naturelles (2-4 secondes).
— Phrases courtes à moyennes. Rythme lent et apaisant. Évite les mots techniques ou médicaux.
— Vouvoiement = jamais. Utilise le "tu" bienveillant et chaleureux.
— ${toneGuide}
— Structure en 4 mouvements progressifs (sans les nommer dans le texte) :
  1. Induction : relaxation physique, respiration, relâchement des tensions
  2. Approfondissement : descente intérieure, ralentissement, images apaisantes
  3. Suggestions profondes liées au thème : visualisation, ressenti corporel, ancrage émotionnel
  4. Retour en douceur : éveil progressif, invitation à noter une action concrète
— Cible environ ${wordTarget} mots.
— Commence par "Installe-toi confortablement..." ou une variante douce.
— Termine toujours par un retour explicite (bouger les doigts, respirer profondément, ouvrir les yeux doucement).`;

  const user = `Génère un script d'auto-hypnose sur le thème suivant :
Thème : ${theme}
${context ? `Contexte personnel : ${context}` : ''}
Durée visée : ${duration} minutes de lecture lente.

Commence le script directement, sans introduction ni commentaire.`;

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
      return res.status(response.status).json({
        error: err.error?.message || `Claude API erreur ${response.status}`
      });
    }

    const data = await response.json();
    const script = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ script });

  } catch (err) {
    console.error('[generate] Erreur :', err);
    return res.status(500).json({ error: err.message });
  }
}
