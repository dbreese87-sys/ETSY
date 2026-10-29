# Poster Studio

A batch workspace for preparing physical Etsy poster listings.

## What it does

- Adds multiple poster artworks to one batch.
- Prepares editable Etsy titles and up to 13 tags per poster, each no longer than 20 characters.
- Creates two editable description paragraphs: “Bring…” describes the artwork; “Perfect for…” begins with buyer keywords. Your standard shop copy follows them.
- Stores up to 11 flattened PNG/JPG mockup backgrounds and renders listing photos in the browser.
- Connects to Etsy shops and listings through Alura.
- Copies a source listing, updates its title, description and tags, attaches generated photos, and leaves the copy as an Etsy draft.

## Run on your Windows computer

1. Install Node.js 24 or newer.
2. Double-click `Start Poster Studio.bat`.
3. Upload artwork, add its details and search phrases, edit the suggested copy, then add mockups.

PSD mockup templates must be exported as PNG or JPG. The 11 mockup files still need to be added.

## Put it online

Follow [SERVER_SETUP.md](SERVER_SETUP.md) to connect this repository to Render. The included `render.yaml` configures HTTPS, persistent photo storage, and private Alura and app-password settings. Live deployment requires a Render account and private Alura credentials.

The current published estimate is about US$7/month for the Starter server plus US$0.25/month for its 1 GB disk, before tax or extra bandwidth. See [Render pricing](https://render.com/pricing). A free Render web service cannot keep uploaded files on a persistent disk; see [free service limits](https://render.com/docs/free).

## Connect Alura

Connect your Etsy shop in Alura, then create an API key with workspace read, listings write and research read access. Enter the key privately in Render as `ALURA_API_KEY` or in your local `.env` file. Never paste it into chat or commit it to GitHub.

## Keep private data private

Do not commit `.env`, artwork or mockup files. Enter the Alura key and app password only in Render's private environment settings. The hosted server will not start without them.
