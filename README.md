# VideoVault · Static read-only demo

![VideoVault](./logo.png)

An independent copy of the VideoVault frontend, adapted into a public, read-only demonstration. It starts directly in the gallery: no login, account setup, backend, database, external storage service or runtime configuration.

## What works

- Three bundled, animated landscape illustrations with thumbnails, descriptions, recording dates and example metadata.
- Search, configured filters, sorting and complete video details.
- Native video playback and title-based downloads from the same static host.
- Read-only example comments with pagination, edited timestamps and deleted placeholders.
- Read-only account and user-management views with fictional users and disabled role changes.
- German/English switching and light/dark/system themes; these preferences are saved locally.
- A web-app manifest and service worker for an offline demo, including its small example clips.

Uploads, edits, deletes, account changes, user-management changes and comment submission are visibly disabled. There are no API write handlers behind them. All demo content is intentionally public and unencrypted; the application prominently explains that this differs from a real encrypted archive. Do not put private videos or real installation files into this repository.

The original application is at [video-vault-org/video-vault-webapp](https://github.com/video-vault-org/video-vault-webapp); its [security architecture](https://video-vault.de/SECURITY-ARCHITECTURE.html) describes the real product, not security guarantees for this public demo.

## Run and build

Use Node.js 22.12+ (Node 26 also works) and npm. No initialization or configuration command is required.

```sh
npm ci
npm run dev
```

Create the deployable static site:

```sh
npm test
npm run build
npm run preview
```

Deploy the **contents of `dist/`** to a static HTTPS host at the domain root, preferably on a separate origin such as `demo.example.com`. There is no Node server in production. For local use, Vite supplies HTTP on localhost; opening `index.html` directly with `file://` is not supported. Application views do not use pathname routes, so a catch-all SPA rewrite is unnecessary. Missing media should return a real 404 rather than `index.html`.

## AWS Amplify Hosting: repository connection

1. Put this directory in its own Git repository and push it to your Git provider.
2. In Amplify Hosting, create a new app, connect that repository and select the branch to deploy.
3. Use the included **`amplify.yml`**. It selects Node 22, runs `npm ci`, tests and builds, and publishes `dist/` as static files.
4. Deploy. No secrets, environment variables, backend provisioning, database or storage credentials are needed. Amplify's standard HTTPS domain is sufficient; a custom domain is optional.

The file follows the [Amplify build specification](https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html). `dist/` is the artifact directory, not an SSR or compute deployment. A subsequent push rebuilds the demo automatically.

If you instead commit this directory **inside a larger repository**, select `video-vault-demo` as the app root and use the equivalent monorepo build specification below at the repository root or in Amplify's build settings. Amplify sets `AMPLIFY_MONOREPO_APP_ROOT` from the app root selected in the console. See the [official monorepo instructions](https://docs.aws.amazon.com/amplify/latest/userguide/monorepo-configuration.html).

```yaml
version: 1
applications:
  - appRoot: video-vault-demo
    frontend:
      phases:
        preBuild:
          commands:
            - nvm use 22
            - npm ci
        build:
          commands:
            - npm test
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
```

## Content and maintenance

- `src/lib/demo.ts`: built-in display configuration, bilingual example records and comments.
- `public/demo/`: public MP4 clips and JPEG thumbnails, served from the same host.
- `src/App.tsx` and `src/components/`: presentation copied and adapted from the real frontend.
- `src/sw.ts`: demo-only offline cache and byte-range handling for cached clips. It uses a separate cache name from the real application.

The neutral clips are original, procedurally drawn landscape illustrations, not private or externally downloaded footage. They are bundled so deployment needs no media generation tools. To regenerate them optionally, run `python scripts/generate-demo-media.py` with Pillow and ffmpeg installed. The project's license covers these generated demo assets as well.

After changes, run the unit tests and build. For actual browser playback, downloads, offline caching and mobile checks:

```sh
npx playwright install chromium
npm run test:browser
```

These browser tests start only a local static preview server. They do not start the original backend or access an external service. Replace demo assets and publish a new build to update content; there is no writable catalog or administration backend.
