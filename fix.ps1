$f = 'src\\app.jsx'
$c = Get-Content $f -Raw -Encoding UTF8
$c = $c -replace '\.\.\.bdr', 'border:"1px solid #aaa"'
$c = $c -replace ':bdr', ':"1px solid #aaa"'
Set-Content $f $c -NoNewline -Encoding UTF8
Write-Host 'Fixed'