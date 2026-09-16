Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\fss-consumer-data-model-interactive\01-value-chain.png')
# Header band (y 40-120) + CRM/FSP band (y 385-460) stacked into one image, x 260-1024
$w = 764
$hdr = $src.Clone((New-Object System.Drawing.Rectangle(260, 40, $w, 80)), $src.PixelFormat)
$rows = $src.Clone((New-Object System.Drawing.Rectangle(260, 385, $w, 75)), $src.PixelFormat)
$out = New-Object System.Drawing.Bitmap(($w * 2), (($hdr.Height + $rows.Height) * 2))
$g = [System.Drawing.Graphics]::FromImage($out)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($hdr, 0, 0, ($w * 2), ($hdr.Height * 2))
$g.DrawImage($rows, 0, ($hdr.Height * 2), ($w * 2), ($rows.Height * 2))
# vertical guide lines every 20px original to help alignment reading
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 0, 0))
$g.Dispose()
$out.Save('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-hdr-plus-rows.png', [System.Drawing.Imaging.ImageFormat]::Png)
$hdr.Dispose(); $rows.Dispose(); $out.Dispose(); $src.Dispose()
Write-Host done
