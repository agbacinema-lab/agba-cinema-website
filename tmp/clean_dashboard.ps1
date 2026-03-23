$file = "app\brand\dashboard\page.tsx"
$lines = Get-Content $file
$totalLines = $lines.Length
$kept = @()
for ($i = 0; $i -lt 1102; $i++) { $kept += $lines[$i] }
for ($i = 1215; $i -lt $totalLines; $i++) { $kept += $lines[$i] }
Set-Content $file -Value $kept
Write-Host "Done. New line count: $($kept.Length)"
