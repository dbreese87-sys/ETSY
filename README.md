# Poster Studio

A local batch workspace for your physical Etsy posters.

## What it does

- Adds multiple poster artworks to one batch.
- Prepares an editable Etsy title and up to 13 tags per poster. Each tag is limited to 20 characters.
- Creates two editable description paragraphs: “Bring…” describes the artwork; “Perfect for…” begins with the buyer keywords. Your standard shop copy is appended after them.
- Stores up to 11 flattened PNG/JPG mockup backgrounds and renders photos in this browser.
- Connects to Etsy shops and listings through Alura.
- Copies an existing physical Etsy listing, updates its title, description and tags, attaches the generated photos, and leaves the result as an Etsy draft.

## Set up

1. Install Node.js 20 or newer on Windows.
2. In Alura, open Settings → Etsy shops and connect your Etsy shop through Etsy’s approval page.
3. In Alura, open Settings → API keys and create a key with workspace read, listings write and research read access.
4. Copy .env.example to .env and add the key to ALURA_API_KEY. The key is read only by the server. Do not paste it in chat or commit .env to GitHub.
5. Double-click Start Poster Studio.bat.
6. Upload your artwork, enter poster details and search phrases, edit the suggested copy, then add your mockup files.

The app accepts PNG/JPG mockup backgrounds. If your preferred templates are PSD files, export the scenes to PNG or JPG first. The preview screenshots are examples; the 11 actual mockup files still need to be uploaded.

## Etsy photo hosting

Alura needs to fetch the finished photos from a public HTTPS address. A local computer address such as 127.0.0.1 is private, so draft photo upload needs the app hosted on an HTTPS server with persistent file storage. Set PUBLIC_BASE_URL to that server address. For a hosted server, set HOST to 0.0.0.0 behind HTTPS and configure a strong APP_PASSWORD and APP_SESSION_SECRET.

## GitHub

Keep .env, media/, artwork and mockup files out of GitHub. GitHub stores the source; it does not keep the Alura key private if you place the key in a committed file. The GitHub integration currently needs repository Contents read and write access before the app source can be committed.
