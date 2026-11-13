# Engineers Horizon website - local preview server
# Serves this folder at http://localhost:8080 (or the next free port) and opens it in your browser.
# Nothing to install: uses PowerShell, which comes with Windows. Close this window to stop the website.
param([int]$Port = 8080, [switch]$NoBrowser)

$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.htm' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.gif' = 'image/gif'
  '.webp' = 'image/webp'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
  '.pdf' = 'application/pdf'; '.mp4' = 'video/mp4'; '.woff2' = 'font/woff2'; '.woff' = 'font/woff'
}

# Find a free port, starting at 8080
$listener = $null
for ($p = $Port; $p -lt ($Port + 20); $p++) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    $l.Start()
    $listener = $l; $Port = $p; break
  } catch { }
}
if (-not $listener) {
  Write-Host "Sorry - couldn't start the local website (no free port between $Port and $($Port + 19))." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  Engineers Horizon website is running at:  $url" -ForegroundColor Green
Write-Host "  Keep this window open while you browse. Close it to stop the website."
Write-Host ""
if (-not $NoBrowser) { try { Start-Process $url } catch { } }

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  $res = $ctx.Response
  try {
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $path = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $rel))
    if (-not $path.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $res.StatusCode = 403
    } else {
      if (Test-Path -LiteralPath $path -PathType Container) { $path = [System.IO.Path]::Combine($path, 'index.html') }
      if (Test-Path -LiteralPath $path -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
        $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
        $res.AddHeader('Cache-Control', 'no-cache')
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $res.ContentLength64 = $bytes.Length
        if ($ctx.Request.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
      } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found: /$rel")
        $res.ContentType = 'text/plain; charset=utf-8'
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    }
  } catch {
    try { $res.StatusCode = 500 } catch { }
  } finally {
    try { $res.OutputStream.Close() } catch { }
  }
}
