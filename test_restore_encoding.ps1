$relativePath = "src\app\presentation\[customerId]\PresentationClientPage.tsx"

if (-not (Test-Path -LiteralPath $relativePath)) {
    Write-Host "ERROR: File not found: $relativePath"
    exit 1
}

$item = Get-Item -LiteralPath $relativePath
$fullPath = $item.FullName
Write-Host "Resolved absolute path: $fullPath"

$text = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)

Write-Host "--------------------------------------------------"

try {
    $sjis = [System.Text.Encoding]::GetEncoding(932)
    $bytes = $sjis.GetBytes($text)
    $restored = [System.Text.Encoding]::UTF8.GetString($bytes)
    
    Write-Host "Restored Sample (Pattern 1):"
    Write-Host $restored.Substring(0, 300)
}
catch {
    Write-Host "Pattern 1 Error: $_"
}

Write-Host "--------------------------------------------------"

try {
    $bytes2 = [System.IO.File]::ReadAllBytes($fullPath)
    $restored2 = [System.Text.Encoding]::GetEncoding(932).GetString($bytes2)
    
    Write-Host "Restored Sample (Pattern 2):"
    Write-Host $restored2.Substring(0, 300)
}
catch {
    Write-Host "Pattern 2 Error: $_"
}
