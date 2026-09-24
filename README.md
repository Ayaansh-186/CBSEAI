# Padhle UI preview

This repository contains the original Padhle interface as a standalone preview. It has no authentication, AI model, retrieval service, database, ingestion endpoint, or API credentials. Chat input stays in the browser and displays a preview notice instead of an answer.

The interface includes the chat screen, chapter browser, weak-spots screen, and study-plan screen.

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run typecheck` and `npm run build` to verify the preview.
