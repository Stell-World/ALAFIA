# Alafia — Frontend

Cette application frontend reprend la version Alafia construite dans Lovable et utilise TanStack Start, React, TypeScript et Tailwind CSS.

## Lancer en local

Depuis ce dossier :

```bash
npm install
npm run dev
```

Vite/TanStack affiche l’adresse locale dans le terminal.

## Structure

- `src/routes/` : accueil et rubriques métier.
- `src/components/alafia/` : composants d’interface propres à Alafia.
- `src/components/ui/` : composants UI partagés.
- `src/lib/` : stockage local, assistant et utilitaires.

Le suivi personnel est conservé dans le navigateur. L’assistant reste en mode démonstration tant que le backend n’est pas configuré. Le dossier `backend/` est géré séparément.
