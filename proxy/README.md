# Nano Banana Proxy (Cloudflare Worker)

This worker relays browser requests to the Google AI Studio endpoints that block CORS in static hosting environments.

## Deploy

1. Create a new Cloudflare Worker.
2. Paste the contents of `cloudflare-worker.js`.
3. Deploy and copy the Worker URL.

## Configure Pixsemble

Open the **Settings** modal and set **Nano Banana Proxy URL** to your Worker URL.
Pixsemble will call the Worker like:

```
https://your-worker.example.com/?target=https%3A%2F%2Fgenerativelanguage.googleapis.com%2Fv1beta%2Fmodels%2Fgemini-2.0-flash-image-preview%3AgenerateContent%3Fkey%3D...
```
