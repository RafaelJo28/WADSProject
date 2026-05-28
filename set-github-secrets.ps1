param(
  [Parameter(Mandatory = $true)]
  [string]$Owner,

  [Parameter(Mandatory = $true)]
  [string]$Repo,

  [Parameter(Mandatory = $false)]
  [string]$EnvFile = ".env.production",

  [switch]$DryRun
)

$secretNames = @(
  "DOCKER_USERNAME",
  "DOCKER_PASSWORD",
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GROQ_API_KEY",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY"
)

$ghExecutable = "gh"
try {
  Get-Command $ghExecutable -ErrorAction Stop | Out-Null
} catch {
  $possiblePortable = Join-Path $PSScriptRoot "gh-portable\bin\gh.exe"
  if (Test-Path $possiblePortable) {
    $ghExecutable = $possiblePortable
  } else {
    Write-Error "GitHub CLI executable not found in PATH or gh-portable/bin."
    exit 1
  }
}

if (-not (Test-Path $EnvFile)) {
  Write-Error "Environment file '$EnvFile' not found."
  exit 1
}

$lines = Get-Content $EnvFile | Where-Object { $_ -and (-not $_.TrimStart().StartsWith("#")) }
$env = @{}

foreach ($line in $lines) {
  if ($line -match '^(\s*[^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2]
    $env[$name] = $value
  }
}

foreach ($secret in $secretNames) {
  if ($env.ContainsKey($secret)) {
    $value = $env[$secret]
    if ($DryRun) {
      Write-Host "[DRY RUN] Would set secret: $secret"
    } else {
      Write-Host "Setting secret: $secret"
      & $ghExecutable secret set $secret --repo "$Owner/$Repo" --body "$value"
    }
  } else {
    Write-Host "Skipping missing secret: $secret"
  }
}

Write-Host "Done."
