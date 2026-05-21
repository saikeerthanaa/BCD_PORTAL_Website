param(
    [string]$InputPath = "C:\Users\saik3\OneDrive\Pictures\Desktop\TANUH\Database_Dump\tanuh_dump.sql",
    [string]$OutputPath = "C:\Users\saik3\OneDrive\Pictures\Desktop\TANUH\Database_Dump\tanuh_dump.cleaned.sql"
)

Write-Host "Cleaning dump:`n  $InputPath`n-> $OutputPath"

# Stream the file, remove lines that set GTID or global vars, and strip DEFINER= clauses
Get-Content $InputPath | Where-Object { $_ -notmatch 'GTID_PURGED|GTID_EXECUTED|SET @@GLOBAL' } |
    ForEach-Object { $_ -replace 'DEFINER=`[^`]+`@`[^`]+`','' } |
    Set-Content -Path $OutputPath -Encoding UTF8

Write-Host "Cleaned dump written to:" $OutputPath
Write-Host "Preview (first 40 lines):"
Get-Content $OutputPath -TotalCount 40 | ForEach-Object { Write-Host $_ }
