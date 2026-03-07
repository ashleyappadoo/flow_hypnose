# Flow Hypnose 🌊

Séance d'auto-hypnose guidée par IA. Script généré par **Claude** (Anthropic), voix par **ElevenLabs**, binaural beats intégrés.

---

## Architecture

```
flow-hypnose/
├── public/
│   └── index.html          # Frontend (SPA, aucune clé API exposée)
├── api/
│   ├── generate.js         # Route serverless → Claude (génération du script)
│   └── tts.js              # Route serverless → ElevenLabs (synthèse vocale)
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

Les clés API ne sont **jamais** dans le code. Elles sont configurées comme variables d'environnement dans Vercel.

---

## Déploiement — GitHub + Vercel

### 1. Créer le repo GitHub

```bash
git init
git add .
git commit -m "init: flow-hypnose"
git remote add origin https://github.com/TON_USER/flow-hypnose.git
git push -u origin main
```

### 2. Importer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New → Project**
2. Importe le repo GitHub `flow-hypnose`
3. Framework Preset : **Other**
4. Pas besoin de build command (site statique + serverless)
5. Clique **Deploy**

### 3. Configurer les variables d'environnement

Dans le dashboard Vercel → ton projet → **Settings → Environment Variables** :

| Nom | Valeur | Requis |
|-----|--------|--------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-…` | ✅ |
| `ELEVENLABS_API_KEY` | `sk_…` | ✅ |
| `ELEVENLABS_VOICE_ID` | `21m00Tcm4TlvDq8ikWAM` | ⬜ (optionnel — défaut : Rachel) |

> Après avoir ajouté les variables, fais un **Redeploy** depuis l'onglet Deployments.

---

## Variables d'environnement — Référence voix ElevenLabs

| Voice ID | Nom | Style |
|----------|-----|-------|
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Douce & posée (recommandée hypnose) |
| `EXAVITQu4vr4xnSDxMaL` | Bella | Chaleureuse |
| `XrExE9yKIg1WjnnlVkGX` | Matilda | Apaisante |
| `JBFqnCBsd6RMkjVDRZzb` | George | Grave & posé |
| `onwK4e9ZLuTAKqWW03F9` | Daniel | Chaleureux |

---

## Utilisation

1. Ouvre l'URL Vercel sur ton téléphone (Chrome recommandé, **casque obligatoire**)
2. Choisis un thème, un style, une durée
3. Clique **① Générer le script** → Claude rédige le script
4. Clique **② Préparer l'audio** → ElevenLabs synthétise la voix (1-2 min)
5. Clique **▶ Lancer la séance** → voix + binaural beats démarrent ensemble

---

## Sécurité

- Les clés API restent côté serveur (fonctions Vercel). Le navigateur n'y a jamais accès.
- Les fonctions serverless sont sans état : aucune donnée utilisateur n'est stockée.
- Le script généré transite via Vercel mais n'est pas persisté.

---

## Limites

- **ElevenLabs Free** : 10 000 crédits/mois ≈ 4 à 6 séances de 20 min
- **Claude API** : facturation à l'usage (~0.01-0.03 € par script)
- **Vercel Free** : 100 Go bandwidth/mois, largement suffisant pour un usage personnel
