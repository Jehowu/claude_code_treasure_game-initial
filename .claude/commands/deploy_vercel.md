# Deploy to Vercel

Run the following commands to build and deploy this project to Vercel production, then return the live URL to the user.

```bash
# Install Vercel CLI if not present
vercel --version 2>/dev/null || npm install -g vercel

# Build and deploy to production
cd "C:\Users\User\Downloads\claude_code_treasure_game-initial"
npm run build && vercel --prod --yes
```

After the deployment completes, extract and display the production URL from the output (the line starting with `▲ Aliased` or `Production`).

## Notes
- `vercel.json` sets `outputDirectory: build` — do not change this.
- If the CLI reports an invalid token, ask the user to run `! vercel login` first.
- This is a static frontend app with no server-side functions.
