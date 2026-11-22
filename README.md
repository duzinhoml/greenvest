# GreenVest

Rental Property Sustainability Simulator for REE 2610, Florida Gulf Coast University.

## Run locally

Requires Node.js 20.19+ or 22+ (Node 20.18 also tested with installed Vite 6).

```sh
npm ci
npm run dev
```

Open the printed localhost URL. `npm test` runs financial unit tests. `npm run build` creates `dist/`; `npm run preview` serves the production build.

## Features

Six responsive sections: overview, financials, three individual sustainability scenarios, rankings, case study and sources/methodology. Owner/tenant/shared utility allocation, documented insurance/incentive gating, missing-data states, interactive charts and JSON export. Each course topic is connected to an interactive tool. Analysis stays in memory; download before leaving or refreshing. No accounts, paid APIs or backend required.

## Validation results

- 19 automated calculation tests passed with Node's test runner.
- Vite production build passed; generated static assets in `dist/`.
- Local development server returned HTTP 200.
