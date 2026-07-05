$f = 'src\\app.jsx'
$c = Get-Content $f -Raw -Encoding UTF8
$c = $c -replace '_isolation\.pdf', '_GI.pdf'
Set-Content $f $c -NoNewline -Encoding UTF8
Write-Host 'Done'