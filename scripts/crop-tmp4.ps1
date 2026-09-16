Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\.cursor\projects\c-Users-easyb-OneDrive-projects-NCA-FSS-LLM-Wiki-FSS\assets\c__Users_easyb_AppData_Roaming_Cursor_User_workspaceStorage_5b050c292420c8d4caabd9431fa1357d_images_image-1b4aeebd-642c-4bdb-8444-9f813069d054.png')
$rect = New-Object System.Drawing.Rectangle(360, 0, 320, $src.Height)
$bmp = $src.Clone($rect, $src.PixelFormat)
$big = New-Object System.Drawing.Bitmap($bmp, (320 * 3), ($src.Height * 3))
$g = [System.Drawing.Graphics]::FromImage($big)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($bmp, 0, 0, (320 * 3), ($src.Height * 3))
$g.Dispose()
$big.Save('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-user-zoom.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $big.Dispose(); $src.Dispose()
Write-Host done
