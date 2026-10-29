# Put Poster Studio online

This setup uses Render and the GitHub repository `dbreese87-sys/ETSY`. Render provides the app server, an HTTPS address, and persistent storage for its generated photos.

## Before you start

1. Connect your Etsy shop to Alura.
2. In Alura, create an API key with workspace read, listings write and research read access. Keep the key private.
3. Sign in to Render and choose **New → Blueprint**.

## Create the server

1. Connect Render to GitHub and select `dbreese87-sys/ETSY` on the `main` branch.
2. Render reads `render.yaml` and shows the service and storage it will create.
3. Enter your Alura API key as `ALURA_API_KEY`.
4. Choose a long, private password for `APP_PASSWORD` (at least 16 characters). Render creates `APP_SESSION_SECRET` automatically.
5. Review the price shown by Render, then create the service.

The configuration uses Render's Starter web service and a 1 GB persistent disk. The current published estimate is about US$7 per month for the server and US$0.25 per month for the disk, before tax or extra bandwidth. The Hobby workspace is free; the server and disk are separate charges. Check the [current pricing](https://render.com/pricing) before creating the service. Render's free web service cannot attach a persistent disk and can sleep after 15 minutes without traffic, so it is not suitable for keeping generated listing photos available.

## Open the app

When deployment finishes, Render gives the service an HTTPS address. Open it, enter your app password, and use Poster Studio. The hosted server uses that HTTPS address for photo links automatically and stores generated photos on the persistent disk.

Do not paste your Alura key or app password into chat or GitHub. Enter them only in Render's private environment settings. If you skip a secret during the first setup, add it from the service's **Environment** page and redeploy.
