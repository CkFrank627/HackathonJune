Set-Location -LiteralPath $PSScriptRoot
"Starting Vite from $PWD at $(Get-Date -Format o)" | Out-File -LiteralPath "$PSScriptRoot\run-vite.log" -Encoding utf8
& npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort 2>&1 | Tee-Object -FilePath "$PSScriptRoot\run-vite.log" -Append
