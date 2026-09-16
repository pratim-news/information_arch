Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\easyb\.cursor\projects\c-Users-easyb-OneDrive-projects-NCA-FSS-LLM-Wiki-FSS\assets\c__Users_easyb_AppData_Roaming_Cursor_User_workspaceStorage_5b050c292420c8d4caabd9431fa1357d_images_image-1b4aeebd-642c-4bdb-8444-9f813069d054.png')
Write-Host ("size: " + $src.Width + " x " + $src.Height)
$w = [Math]::Min(700, $src.Width - 300)
$rect = New-Object System.Drawing.Rectangle(300, 0, $w, $src.Height)
$bmp = $src.Clone($rect, $src.PixelFormat)
$big = New-Object System.Drawing.Bitmap($bmp, ($w * 2), ($src.Height * 2))
$big.Save('C:\Users\easyb\OneDrive\projects\NCA\FSS\LLM-Wiki-FSS\outcome\InformationArch\scripts\crop-user-shot.png', [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose(); $big.Dispose(); $src.Dispose()
Write-Host done
