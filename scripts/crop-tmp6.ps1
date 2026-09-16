Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\fss-consumer-data-model-interactive\01-value-chain.png')
$rect = New-Object System.Drawing.Rectangle(270, 383, 330, 75)
$bmp = $src.Clone($rect, $src.PixelFormat)
$scale = 5
$big = New-Object System.Drawing.Bitmap((330 * $scale), (75 * $scale))
$g = [System.Drawing.Graphics]::FromImage($big)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($bmp, 0, 0, (330 * $scale), (75 * $scale))
$g.Dispose()
$big.Save('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-crm-fsp-zoom.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $big.Dispose(); $src.Dispose()
Write-Host done
