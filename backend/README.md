# Backend Alafia / SANTÉ+

## Démarrage local

Dans ce dossier, crée `.env` à partir de `.env.example`, puis renseigne `GEMINI_API_KEY`, `DATABASE_URL` et une `SESSION_SECRET` aléatoire d’au moins 32 caractères. Ne partage pas ce fichier et ne le commite pas.

Installe les dépendances avec `npm install`, puis démarre l’API avec `npm run dev`. La route de santé est `GET /api/health`.

## PostgreSQL et migrations

Crée une base PostgreSQL nommée `alafia` et un utilisateur dédié, puis adapte `DATABASE_URL`. Applique les migrations dans l’ordre depuis ce dossier :

```powershell
psql -U alafia -h localhost -p 5432 -d alafia -f .\migrations\001_create_users.sql
psql -U alafia -h localhost -p 5432 -d alafia -f .\migrations\002_create_conversations.sql
psql -U alafia -h localhost -p 5432 -d alafia -f .\migrations\003_create_patient_measurements.sql
psql -U alafia -h localhost -p 5432 -d alafia -f .\migrations\004_create_patient_followup.sql
psql -U alafia -h localhost -p 5432 -d alafia -f .\migrations\005_create_patient_appointments.sql
```

Le magasin de sessions crée automatiquement sa table `session` au premier accès. Conserve `DATABASE_SSL=false` uniquement pour PostgreSQL local; active TLS sur une base distante.

`npm run migrate` applique les migrations SQL dans l’ordre et enregistre celles déjà appliquées. Cette commande est également utilisée au démarrage du service Render configuré par `render.yaml`.

## Authentification disponible

- `POST /api/auth/register` : `{ "role":"PATIENT", "firstName":"Awa", "lastName":"Diallo", "email":"awa@example.com", "phone":"+221700000000", "password":"une-phrase-secrete-longue" }`
- `POST /api/auth/login` : `{ "email":"awa@example.com", "password":"une-phrase-secrete-longue" }`
- `GET /api/auth/me` : profil public du compte connecté.
- `POST /api/auth/logout` : détruit la session et efface le cookie.
- `POST /api/chat` : `{ "messages":[{"role":"user","content":"Bonjour"}], "preferredLanguage":"fr" }` renvoie `{ "reply":"..." }`. L’ancienne route `POST /api/assistant` avec `{ "message":"..." }` reste compatible.
- Pour enregistrer explicitement une conversation, envoyer `saveConversation: true` avec un compte connecté. La réponse inclut alors `conversationId`; les tours suivants peuvent envoyer cet identifiant.
- `GET /api/conversations` : liste jusqu’à 50 conversations du compte connecté.
- `POST /api/conversations` : crée une conversation avec `{ "title":"..." }`.
- `GET /api/conversations/:id` : récupère le titre et les messages, uniquement pour le propriétaire.
- `DELETE /api/conversations/:id` : supprime la conversation et ses messages.
- `GET /api/patients/me/measurements?page=1&limit=50` : liste les mesures du patient connecté.
- `POST /api/patients/me/measurements` : `{ "type":"weight", "value":65.4, "unit":"kg", "measuredAt":"2026-11-14T12:00:00Z", "note":"facultatif" }`.
- `PATCH /api/patients/me/measurements/:id` et `DELETE /api/patients/me/measurements/:id` : modifient ou suppriment uniquement une mesure appartenant au compte connecté.
- `GET/POST /api/patients/me/medications` : lister ou créer un médicament saisi par le patient, avec des horaires facultatifs au format `HH:mm` et une note facultative.
- `PATCH/DELETE /api/patients/me/medications/:id` : modifier ou supprimer un élément appartenant au compte. Les horaires ne déclenchent pas encore de notification.
- `GET /api/patients/me/pregnancy` : retourner le suivi déclaré ou `pregnancy: null`.
- `PUT /api/patients/me/pregnancy` : enregistrer la date de découverte, la date de dernière consultation et les notes déclarées.
- `DELETE /api/patients/me/pregnancy` : supprimer le suivi du compte connecté.
- `GET /api/patients/me/appointments` : lister les 100 prochains rendez-vous du compte.
- `POST /api/patients/me/appointments` : créer un rendez-vous avec `startsAt` ISO 8601, `timezone` IANA et `reason`; `location` et `reminderChannels` sont facultatifs.
- `PATCH/DELETE /api/patients/me/appointments/:id` : modifier ou supprimer un rendez-vous appartenant au compte. Les canaux de rappel restent des préférences et aucun message n’est envoyé pour le moment.

Les sessions sont conservées côté serveur dans PostgreSQL. Le cookie est `HttpOnly`, `SameSite=Lax`, limité à huit heures, et devient `Secure` en production. Les nouveaux comptes publics ont toujours le rôle `PATIENT`; aucun rôle admin n’est attribué par inscription. Les mots de passe sont hachés avec bcrypt. Le frontend doit envoyer les requêtes avec `credentials: 'include'`.

## Déploiement Render

Le `render.yaml` à la racine décrit un service web et une base PostgreSQL dans la région Frankfurt. Render demande `FRONTEND_ORIGIN` et `GEMINI_API_KEY` comme valeurs secrètes; ne copie pas le contenu de `.env` dans Git. La configuration du Blueprint utilise le plan gratuit pour la prévisualisation. Les bases PostgreSQL gratuites Render expirent après 30 jours; choisis un plan payant si la base doit rester disponible après cette période. En production, configure `FRONTEND_ORIGIN` avec l’origine exacte du site frontend.

Le chat n’enregistre aucune conversation par défaut. La persistance est explicite via `saveConversation: true`; les endpoints d’historique et de données patient vérifient la propriété à chaque requête. Les mesures, horaires et dates sont stockés tels que saisis, sans calcul de diagnostic, recommandation de dose ou envoi de rappel. Les langues disponibles restent limitées au français jusqu’à décision produit. Les rendez-vous, documents, réinitialisation de mot de passe, vérification d’adresse, autorisation admin, CSRF tokenisé et politique d’effacement seront des étapes séparées avant la mise en production.
