# Proposal Hub

create me a  simple landing for proposal management with a small analytics 

I have attached the file for the fields and for the backend it will be sa FASTAPI backend create me a login page for google sign-in but don't link it to google just yet just make it a button then inside a dashboard where they could submit their proposal a simple user management and analytics from the second tab of the excel file where they could sort out the data by date or any fields we have on the file

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0a3ac4b3-ffbe-46e5-a22c-82cb5deb1ed4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to Azure Static Web Apps
1. Create a Static Web App in Azure (build preset: Custom) and add its deployment token as the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
2. Add `VITE_API_BASE_URL` (your FastAPI URL) as a GitHub secret.
3. Push to `main`; `.github/workflows/azure-static-web-apps.yml` runs `bun run build:azure` and uploads `.output/public`.
4. `public/staticwebapp.config.json` routes all page refreshes (e.g. /dashboard) to `index.html`.
5. Allow the Static Web App's domain in FastAPI `CORSMiddleware`.
