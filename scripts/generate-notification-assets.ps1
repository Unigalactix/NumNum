param(
  [string]$Source = 'public/assets/diorama.jpg',
  [string]$OutputDirectory = 'public/assets/notifications'
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path $Source).Path
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$outputPath = (Resolve-Path $OutputDirectory).Path
$image = [System.Drawing.Image]::FromFile($sourcePath)

function Set-HighQualityGraphics([System.Drawing.Graphics]$graphics) {
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
}

function Save-Jpeg([System.Drawing.Bitmap]$bitmap, [string]$path) {
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq 'image/jpeg'
  $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
    [System.Drawing.Imaging.Encoder]::Quality,
    90L
  )
  $bitmap.Save($path, $encoder, $parameters)
  $parameters.Dispose()
}

function New-SquareIcon([int]$size, [string]$fileName) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-HighQualityGraphics $graphics
  $side = [Math]::Min($image.Width, $image.Height)
  $sourceRectangle = [System.Drawing.Rectangle]::new(
    [int](($image.Width - $side) / 2),
    [int](($image.Height - $side) / 2),
    $side,
    $side
  )
  $graphics.DrawImage(
    $image,
    [System.Drawing.Rectangle]::new(0, 0, $size, $size),
    $sourceRectangle,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $graphics.Dispose()
  $bitmap.Save(
    (Join-Path $outputPath $fileName),
    [System.Drawing.Imaging.ImageFormat]::Png
  )
  $bitmap.Dispose()
}

function New-MaskableIcon {
  $bitmap = [System.Drawing.Bitmap]::new(512, 512)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-HighQualityGraphics $graphics
  $graphics.Clear([System.Drawing.Color]::FromArgb(143, 64, 88))
  $side = [Math]::Min($image.Width, $image.Height)
  $sourceRectangle = [System.Drawing.Rectangle]::new(
    [int](($image.Width - $side) / 2),
    [int](($image.Height - $side) / 2),
    $side,
    $side
  )
  $graphics.DrawImage(
    $image,
    [System.Drawing.Rectangle]::new(64, 64, 384, 384),
    $sourceRectangle,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(255, 254, 253), 8)
  $graphics.DrawRectangle($borderPen, 64, 64, 384, 384)
  $borderPen.Dispose()
  $graphics.Dispose()
  $bitmap.Save(
    (Join-Path $outputPath 'app-icon-maskable-512.png'),
    [System.Drawing.Imaging.ImageFormat]::Png
  )
  $bitmap.Dispose()
}

function New-HeartBadge {
  $bitmap = [System.Drawing.Bitmap]::new(96, 96, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-HighQualityGraphics $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.StartFigure()
  $path.AddBezier(48, 84, 42, 78, 12, 59, 12, 35)
  $path.AddBezier(12, 35, 12, 17, 34, 11, 48, 29)
  $path.AddBezier(48, 29, 62, 11, 84, 17, 84, 35)
  $path.AddBezier(84, 35, 84, 59, 54, 78, 48, 84)
  $path.CloseFigure()
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $graphics.FillPath($brush, $path)
  $brush.Dispose()
  $path.Dispose()
  $graphics.Dispose()
  $bitmap.Save(
    (Join-Path $outputPath 'notification-badge.png'),
    [System.Drawing.Imaging.ImageFormat]::Png
  )
  $bitmap.Dispose()
}

function New-CategoryCard(
  [string]$fileName,
  [string]$label,
  [System.Drawing.Color]$accent,
  [int]$sourceY
) {
  $bitmap = [System.Drawing.Bitmap]::new(1024, 512)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-HighQualityGraphics $graphics
  $cropHeight = [int]($image.Width / 2)
  $safeY = [Math]::Min([Math]::Max(0, $sourceY), $image.Height - $cropHeight)
  $graphics.DrawImage(
    $image,
    [System.Drawing.Rectangle]::new(0, 0, 1024, 512),
    [System.Drawing.Rectangle]::new(0, $safeY, $image.Width, $cropHeight),
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $borderPen = [System.Drawing.Pen]::new($accent, 18)
  $graphics.DrawRectangle($borderPen, 9, 9, 1006, 494)
  $borderPen.Dispose()
  $panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 39, 33, 38))
  $graphics.FillRectangle($panelBrush, 28, 416, 430, 68)
  $panelBrush.Dispose()
  $font = [System.Drawing.Font]::new('Georgia', 27, [System.Drawing.FontStyle]::Regular)
  $textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
  $graphics.DrawString($label, $font, $textBrush, 48, 431)
  $textBrush.Dispose()
  $font.Dispose()
  $graphics.Dispose()
  Save-Jpeg $bitmap (Join-Path $outputPath $fileName)
  $bitmap.Dispose()
}

try {
  New-SquareIcon 180 'apple-touch-icon.png'
  New-SquareIcon 192 'app-icon-192.png'
  New-SquareIcon 256 'notification-icon.png'
  New-SquareIcon 384 'app-icon-384.png'
  New-SquareIcon 512 'app-icon-512.png'
  New-MaskableIcon
  New-HeartBadge
  New-CategoryCard 'morning-card.jpg' 'Good morning, my love' ([System.Drawing.Color]::FromArgb(206, 161, 87)) 105
  New-CategoryCard 'afternoon-card.jpg' 'A little afternoon love' ([System.Drawing.Color]::FromArgb(113, 134, 122)) 170
  New-CategoryCard 'tinglish-card.jpg' 'Nee kosam, bangaram' ([System.Drawing.Color]::FromArgb(143, 64, 88)) 135
} finally {
  $image.Dispose()
}

Write-Output "Generated notification assets in $outputPath"