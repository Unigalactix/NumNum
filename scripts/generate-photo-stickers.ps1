param(
  [string]$SourceDirectory = 'public\assets',
  [string]$IndividualDirectory = 'public\assets\stickers\individual',
  [string]$NotificationDirectory = 'public\assets\stickers\notification'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $IndividualDirectory, $NotificationDirectory | Out-Null
$sources = Get-ChildItem -LiteralPath $SourceDirectory -File |
  Where-Object { $_.Extension -in '.jpg', '.jpeg', '.png', '.webp' }

foreach ($source in $sources) {
  $image = $null
  $bitmap = $null
  $graphics = $null
  $card = $null
  $cardGraphics = $null
  try {
    $image = [System.Drawing.Image]::FromFile($source.FullName)
    $bitmap = [System.Drawing.Bitmap]::new(600, 600)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Fit the whole photo; the paper border must never crop a face or memory.
    $scale = [Math]::Min(520.0 / $image.Width, 480.0 / $image.Height)
    $width = [int][Math]::Round($image.Width * $scale)
    $height = [int][Math]::Round($image.Height * $scale)
    $x = [int]((600 - $width) / 2)
    $y = [int]((580 - $height) / 2)
    $graphics.FillRectangle([System.Drawing.Brushes]::White, $x - 16, $y - 16, $width + 32, $height + 52)
    $graphics.DrawImage($image, $x, $y, $width, $height)
    $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#e4dde0'))
    try {
      $graphics.DrawRectangle($pen, $x - 16, $y - 16, $width + 32, $height + 52)
    } finally {
      $pen.Dispose()
    }
    $id = "photo-$($source.BaseName)"
    $bitmap.Save((Join-Path $IndividualDirectory "$id.png"), [System.Drawing.Imaging.ImageFormat]::Png)

    $card = [System.Drawing.Bitmap]::new(600, 600)
    $cardGraphics = [System.Drawing.Graphics]::FromImage($card)
    $cardGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#fffdf9'))
    $cardGraphics.DrawImage($bitmap, 0, 0, 600, 600)
    $card.Save((Join-Path $NotificationDirectory "$id.jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
    Write-Output "Generated $id"
  } finally {
    if ($cardGraphics) { $cardGraphics.Dispose() }
    if ($card) { $card.Dispose() }
    if ($graphics) { $graphics.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
    if ($image) { $image.Dispose() }
  }
}
