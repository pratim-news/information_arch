Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\fss-consumer-data-model-interactive\01-value-chain.png')
function Crop($x, $y, $w, $h, $out) {
  $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
  $bmp = $src.Clone($rect, $src.PixelFormat)
  $big = New-Object System.Drawing.Bitmap($bmp, ($w * 2), ($h * 2))
  $big.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose(); $big.Dispose()
}
Crop 150 40 874 80 'C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-journey-hdr.png'
Crop 150 385 874 75 'C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-crm-fsp.png'
$src.Dispose()
Write-Host done
