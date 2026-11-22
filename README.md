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

## Public deployment (Vercel)
1. Push this directory to a GitHub repository; do not include node_modules.
2. In Vercel, choose Add New Project and import the repository. Framework: Vite. Build: `npm run build`. Output: `dist`. No environment variables needed. Alternatively run `npx vercel --prod` and follow its account prompts.
3. Deploy. Open the resulting https URL in a private/incognito window while signed out. If Vercel Deployment Protection requests authentication, disable protection for the production environment under project Settings → Deployment Protection and repeat.
4. Check all six sections, enter financial inputs, change electricity payer, verify rankings, export JSON, open `/design-brief.html`, and refresh the page. Check on mobile too.

The public app itself requires no login. No public URL has been deployed or verified as part of this local deliverable. `vercel.json` supplies build/output settings. Equivalent static hosts can publish `dist/` using the same build command.

## Evidence and missing data
Research date: November 22, 2026. See the app's Sources & Methodology and [research notes](docs/research.md). The supplied $1,750/unit rent scenario is preliminary. MLS financial fields conflict; reported $38,400 NOI is deliberately excluded. County verification was unavailable. Obtain leases, actual vacancy history, insurance and flood quotes, recurring expenses, utility bills/tariffs, contractor quotes and equipment assessments. Do not infer unknown costs are zero. Blank expense categories block NOI; explicitly enter zero only if confirmed inapplicable. Upfront capital work and financing are excluded from operating expenses.

Upgrades are compared individually and never summed. No automatic premiums, tax credits or insurance discounts. Evidence confirmations are user attestations, not independent validation. Simple payback ignores discounting, useful life and financing. Estimated values assume a constant, positive user-entered cap rate. The project imports no numerical DOE, ENERGY STAR or PVWatts savings estimates.

## Design brief
Open [public/design-brief.html](public/design-brief.html) or `/design-brief.html` in the running app. It is formatted for one US Letter page; use Print → Save as PDF at 100% scale, with browser headers/footers disabled.

## Validation results
- 19 automated calculation tests passed with Node's test runner.
- Vite production build passed; generated static assets in `dist/`.
- Local development server returned HTTP 200.
- Interactive visual/browser QA could not run: the provided browser access host was unavailable. Mobile rendering and the printed brief's page count should be checked in a browser before submission. Financial chart labels/bars use the same computed result objects as comparisons; unit coverage verifies the scenario values.
