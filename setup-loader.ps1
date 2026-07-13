$loaderHTML = @'
    <div id="pageLoader" class="page-loader" aria-live="polite" aria-label="Loading site">
        <div class="page-loader__content">
            <div class="page-loader__logo" aria-hidden="true">PR.</div>
            <div style="display:inline-flex;align-items:center;gap:0.6rem;">
                <div class="page-loader__text">Loading
                    <span class="loader-dots" aria-hidden="true">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </span>
                </div>
            </div>
        </div>
    </div>
'@

$loaderCSS = @'
    .page-loader { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; background: radial-gradient(circle at top, rgba(37, 99, 235, 0.18), transparent 35%), #020617; transition: opacity 0.6s ease, visibility 0.6s ease; overflow: hidden; }
    body.loader-complete .page-loader { opacity: 0; visibility: hidden; pointer-events: none; }
    .page-loader__content { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; padding: 1.5rem; transform: translateY(0); transition: transform 0.6s ease; }
    body.loader-complete .page-loader__content { transform: translateY(10px) scale(0.96); }
    .page-loader__logo { display: inline-flex; align-items: center; justify-content: center; width: clamp(44px, 11.5vw, 76px); aspect-ratio: 1 / 1; font-size: clamp(0.95rem, 3.2vw, 1.8rem); line-height: 1; font-weight: 800; letter-spacing: 0.12em; color: #60a5fa; background: rgba(255,255,255,0.04); border: 1px solid rgba(96,165,250,0.10); box-shadow: 0 10px 30px rgba(2,6,23,0.35); text-shadow: 0 0 18px rgba(96, 165, 250, 0.18); animation: loader-jump 1s cubic-bezier(.2,.8,.25,1) infinite; backdrop-filter: blur(6px); border-radius: 12px; padding: 0.04rem 0.28rem; box-sizing: border-box; }
    .page-loader__text { position: relative; display: inline-block; font-size: clamp(0.95rem, 2.4vw, 1.25rem); font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase; padding: 0.2rem 0.25rem; background: linear-gradient(90deg, rgba(147,197,253,0.95) 0%, rgba(147,197,253,0.95) 18%, rgba(255,255,255,0.28) 48%, rgba(147,197,253,0.95) 82%, rgba(147,197,253,0.95) 100%); background-size: 220% 100%; background-clip: text; -webkit-background-clip: text; color: transparent; -webkit-text-fill-color: transparent; animation: loader-shimmer 1.6s linear infinite, loader-text-pulse 1.6s ease-in-out infinite; }
    @keyframes loader-jump { 0% { transform: translateY(0) scale(1); } 35% { transform: translateY(-12px) scale(1.02); } 65% { transform: translateY(4px) scale(0.99); } 100% { transform: translateY(0) scale(1); } }
    @keyframes loader-shimmer { 0% { background-position: 180% 0; } 100% { background-position: -120% 0; } }
    @keyframes loader-text-pulse { 0%, 100% { opacity: 0.9; } 50% { opacity: 1; } }
    .loader-dots { display: inline-flex; gap: 0.22rem; align-items: flex-end; margin-left: 0.35rem; }
    .loader-dots .dot { width: 8px; height: 8px; border-radius: 999px; background: linear-gradient(180deg, #60a5fa, #2563eb); box-shadow: 0 6px 18px rgba(96,165,250,0.18); transform-origin: center; animation: loader-dot-bounce 0.9s ease-in-out infinite; }
    .loader-dots .dot:nth-child(1) { animation-delay: 0s; }
    .loader-dots .dot:nth-child(2) { animation-delay: 0.12s; }
    .loader-dots .dot:nth-child(3) { animation-delay: 0.24s; }
    @keyframes loader-dot-bounce { 0% { transform: translateY(0); opacity: 1; } 40% { transform: translateY(-10px); opacity: 1; } 80% { transform: translateY(0); opacity: 0.9; } 100% { transform: translateY(0); opacity: 1; } }
    @media (max-width: 640px) { .page-loader__logo { width: clamp(56px, 20vw, 96px); font-size: clamp(1.4rem, 7vw, 2.4rem); padding: 0.06rem 0.36rem; } }
'@

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

Write-Host "Applying consistent loader to all pages...`n"

$updated = 0
$skipped = 0

foreach ($file in $files) {
    $fullPath = (Get-Item -Path "." -Verbose).FullName + "\" + $file
    
    if (-Not (Test-Path $fullPath)) {
        Write-Host "SKIP: Not found - $file" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $content = Get-Content $fullPath -Raw
    
    # Check if already has complete loader (all 3 parts)
    if (($content -match 'id="pageLoader"') -and ($content -match 'loader-complete') -and ($content -match 'addEventListener.*load')) {
        Write-Host "OK: Already complete - $file" -ForegroundColor Cyan
        continue
    }
    
    # Remove old/partial loader if exists
    $content = $content -replace '<div id="pageLoader".*?</div>\s*', ''
    $content = $content -replace '<style>[\s\S]*?\.page-loader.*?</style>\s*', ''
    $content = $content -replace '<script>\s*window\.addEventListener\(.*?</script>\s*', ''
    
    # Add loader HTML after <body tag
    if ($content -match '(<body[^>]*>)') {
        $bodyTag = $matches[1]
        $content = $content -replace [regex]::Escape($bodyTag), "$bodyTag`n$loaderHTML"
    }
    
    # Add loader CSS before </head>
    if ($content -match '(</head>)') {
        $content = $content -replace '</head>', "`n    <style>`n$loaderCSS`n    </style>`n</head>"
    }
    
    # Add loader JS before </body>
    if ($content -match '(</body>)') {
        $content = $content -replace '</body>', "`n$loaderJS`n</body>"
    }
    
    Set-Content $fullPath -Value $content -Encoding UTF8
    Write-Host "DONE: $file" -ForegroundColor Green
    $updated++
}

Write-Host "`nResults: $updated updated, $skipped skipped" -ForegroundColor Cyan
