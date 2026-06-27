# Deploy to GitHub Pages

Deploy this project to GitHub Pages and return the live URL.

```powershell
# Set PATH to include gh CLI
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# Check gh auth
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged into GitHub. Please run: ! gh auth login"
    exit 1
}

# Get GitHub username
$ghUser = gh api user --jq '.login' 2>&1
$repoName = "claude_code_treasure_game-initial"
$repoFullName = "$ghUser/$repoName"

Write-Host "Deploying as: $ghUser"

# Init git if needed
Set-Location "C:\Users\User\Downloads\claude_code_treasure_game-initial"
if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit"
}

# Create or use existing GitHub repo
$repoExists = gh repo view $repoFullName 2>&1
if ($LASTEXITCODE -ne 0) {
    gh repo create $repoName --public --source=. --remote=origin --push
} else {
    git remote remove origin 2>$null
    git remote add origin "https://github.com/$repoFullName.git"
    git push -u origin main --force 2>&1
}

# Install gh-pages if needed
if (-not (Test-Path "node_modules/gh-pages")) {
    npm install --save-dev gh-pages
}

# Build
npm run build

# Deploy build/ to gh-pages branch
npx gh-pages -d build -t true

# Enable GitHub Pages via API
gh api "repos/$repoFullName/pages" --method POST -f source[branch]=gh-pages -f source[path]="/" 2>&1

Write-Host ""
Write-Host "Deployed! Live URL: https://$ghUser.github.io/$repoName/"
```

After deployment, the live URL will be: `https://<username>.github.io/claude_code_treasure_game-initial/`

## Notes
- Requires `gh auth login` before first use
- Uses `gh-pages` npm package to push the `build/` folder
- GitHub Pages may take 1-2 minutes to become live after first deployment
