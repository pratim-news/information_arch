Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\fss-consumer-data-model-interactive\01-value-chain.png')
# Region: x 420-720 (subscribe + fulfill cols), header y 40-80 and rows y 385-460
$w = 300
$hdr = $src.Clone((New-Object System.Drawing.Rectangle(420, 40, $w, 40)), $src.PixelFormat)
$rows = $src.Clone((New-Object System.Drawing.Rectangle(420, 385, $w, 75)), $src.PixelFormat)
$scale = 4
$out = New-Object System.Drawing.Bitmap(($w * $scale), (($hdr.Height + $rows.Height) * $scale))
$g = [System.Drawing.Graphics]::FromImage($out)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($hdr, 0, 0, ($w * $scale), ($hdr.Height * $scale))
$g.DrawImage($rows, 0, ($hdr.Height * $scale), ($w * $scale), ($rows.Height * $scale))
# draw vertical guides at estimated column boundaries orig x=475, 575, 675 -> crop (x-420)*scale
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Red, 3)
foreach ($bx in @(475, 575, 675)) {
  $cx = ($bx - 420) * $scale
  $g.DrawLine($pen, $cx, 0, $cx, $out.Height)
}
$g.Dispose()
$out.Save('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-slide-subscribe-zoom.png', [System.Drawing.Imaging.ImageFormat]::Png)
$hdr.Dispose(); $rows.Dispose(); $out.Dispose(); $src.Dispose()
Write-Host done
