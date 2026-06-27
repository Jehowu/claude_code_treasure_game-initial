# Deploy to GitHub Pages

Deploy this project to GitHub Pages and return the live URL. Use PowerShell for all commands (gh and git are Windows binaries).

## Step 1 — Set PATH and check auth

```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
gh auth status 2>&1
```

If not logged in, tell the user to run `! powershell -Command "gh auth login"` and stop.

## Step 2 — Get GitHub username and repo info

```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
gh api user --jq '.login'
```

The repo name is `claude_code_treasure_game-initial`. The live URL will be `https://<username>.github.io/claude_code_treasure_game-initial/`.

## Step 3 — Ensure vite.config.ts has the correct base

Check `vite.config.ts`. If `base: '/claude_code_treasure_game-initial/'` is not present, add it inside `defineConfig({`. Then rebuild.

## Step 4 — Build

```powershell
Set-Location "C:\Users\User\Downloads\claude_code_treasure_game-initial"
npm run build
```

## Step 5 — Initialize git and create GitHub repo if needed

```powershell
Set-Location "C:\Users\User\Downloads\claude_code_treasure_game-initial"
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Init git if not already
if (-not (Test-Path ".git")) { git init; git add .; git commit -m "Initial commit" }

# Create GitHub repo if it doesn't exist, otherwise just ensure remote is set
$ghUser = gh api user --jq '.login'
gh repo view "$ghUser/claude_code_treasure_game-initial" 2>&1
```

If the repo doesn't exist (exit code non-zero), run:
```powershell
gh repo create claude_code_treasure_game-initial --public --source=. --remote=origin --push
```

If repo exists but no remote, run:
```powershell
git remote add origin "https://github.com/$ghUser/claude_code_treasure_game-initial.git"
```

## Step 6 — Deploy to gh-pages branch

```powershell
Set-Location "C:\Users\User\Downloads\claude_code_treasure_game-initial"
if (-not (Test-Path "node_modules/gh-pages")) { npm install --save-dev gh-pages }
npx gh-pages -d build
```

## Step 7 — Enable GitHub Pages (ignore 409 if already enabled)

```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
$ghUser = gh api user --jq '.login'
gh api "repos/$ghUser/claude_code_treasure_game-initial/pages" --method POST -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1
```

## Step 8 — Report the live URL

Display: `https://<username>.github.io/claude_code_treasure_game-initial/`

Remind the user that GitHub Pages may take 1–2 minutes to go live on first deploy.

## Notes
- Requires `gh auth login` once before first use
- Uses `gh-pages` npm package to push `build/` to the `gh-pages` branch
- 409 error on Pages API = already enabled, safe to ignore
