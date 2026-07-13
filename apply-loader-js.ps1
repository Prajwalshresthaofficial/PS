# PowerShell script to add loader JavaScript to all HTML files

$loaderJS = @'
    <script>
        window.addEventListener('load', function () {
            const loader = document.getElementById('pageLoader');
            if (!loader) return;
            document.body.classList.add('loader-complete');
            setTimeout(function () {
                loader.remove();
            }, 650);
        });
    </script>
'@

# List of files to update
$files = @(
    "about.html",
    "blogs.html",
    "contact.html",
    "tax.html",
    "terms.html",
    "about/index.html",
    "blogs/index.html",
    "blogs/accounting-standards/index.html",
    "blogs/motivation-&-mindset/index.html",
    "blogs/personal-finance-tools/index.html",
    "blogs/taxation-guide/index.html",
    "blogs/time-management/index.html",
    "contact/index.html",
    "gallery/index.html",
    "incometax/index.html",
    "loan/index.html",
    "share/index.html",
    "sip/index.html",
    "terms/index.html",
    "tools/index.html",
    "wacc/index.html"
)

$count = 0

foreach ($file in $files) {
    $filePath = Join-Path (Get-Location) $file
    
    if (-Not (Test-Path $filePath)) {
        Write-Host "File not found: $file" -ForegroundColor Yellow
        continue
    }
    
    # Read file content
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Check if file has the loader div
    if ($content -notmatch 'id="pageLoader"') {
        Write-Host "Skipping (no loader HTML): $file" -ForegroundColor Gray
        continue
    }
    
    # Check if file already has the loader JS
    if ($content -match 'loader-complete.*addEventListener') {
        Write-Host "Skipping (JS already present): $file" -ForegroundColor Gray
        continue
    }
    
    # Add JS before </body>
    $newContent = $content -replace '</body>', "$loaderJS`n</body>"
    
    # Write back
    Set-Content $filePath -Value $newContent -Encoding UTF8
    Write-Host "OK: $file" -ForegroundColor Green
    $count++
}

Write-Host "Total files updated: $count" -ForegroundColor Cyan
