param(
  [string]$SourceDirectory = 'public/assets/stickers',
  [string]$IndividualDirectory = 'public/assets/stickers/individual',
  [string]$NotificationDirectory = 'public/assets/stickers/notification'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
$drawingPrimitivesAssembly = [System.Drawing.Color].Assembly.Location
$runtimeAssembly = Join-Path $PSHOME 'System.Runtime.dll'
$collectionsAssembly = Join-Path $PSHOME 'System.Collections.dll'
$fileSystemAssembly = Join-Path $PSHOME 'System.IO.FileSystem.dll'
$gdiPlusAssembly = Join-Path $PSHOME 'System.Private.Windows.GdiPlus.dll'
$windowsCoreAssembly = Join-Path $PSHOME 'System.Private.Windows.Core.dll'

if (-not ('NumNumStickerExtractor' -as [type])) {
Add-Type -ReferencedAssemblies @(
    $drawingAssembly,
    $drawingPrimitivesAssembly,
    $runtimeAssembly,
    $collectionsAssembly,
    $fileSystemAssembly,
    $gdiPlusAssembly,
    $windowsCoreAssembly
) -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class NumNumStickerExtractor
{
    private static void HighQuality(Graphics graphics)
    {
        graphics.CompositingQuality = CompositingQuality.HighQuality;
        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
        graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
        graphics.SmoothingMode = SmoothingMode.AntiAlias;
    }

    private static Color FindBackground(Bitmap sheet)
    {
        long red = 0, green = 0, blue = 0;
        int samples = 0;
        int[,] corners = {
            { 0, 0 }, { sheet.Width - 6, 0 },
            { 0, sheet.Height - 6 }, { sheet.Width - 6, sheet.Height - 6 }
        };
        for (int corner = 0; corner < 4; corner++)
        {
            for (int y = 0; y < 6; y++)
            {
                for (int x = 0; x < 6; x++)
                {
                    Color pixel = sheet.GetPixel(corners[corner, 0] + x, corners[corner, 1] + y);
                    red += pixel.R;
                    green += pixel.G;
                    blue += pixel.B;
                    samples++;
                }
            }
        }
        return Color.FromArgb((int)(red / samples), (int)(green / samples), (int)(blue / samples));
    }

    private static bool IsBackground(Color pixel, Color background)
    {
        return pixel.R >= 238 && pixel.G >= 238 && pixel.B >= 238 &&
            Math.Abs(pixel.R - background.R) <= 7 &&
            Math.Abs(pixel.G - background.G) <= 7 &&
            Math.Abs(pixel.B - background.B) <= 7;
    }

    private static Bitmap RemoveConnectedBackground(Bitmap source, Color background)
    {
        int width = source.Width;
        int height = source.Height;
        bool[] visited = new bool[width * height];
        int[] queue = new int[width * height];
        int head = 0;
        int tail = 0;

        Action<int, int> enqueue = (x, y) => {
            int index = y * width + x;
            if (visited[index] || !IsBackground(source.GetPixel(x, y), background)) return;
            visited[index] = true;
            queue[tail++] = index;
        };

        for (int x = 0; x < width; x++)
        {
            enqueue(x, 0);
            enqueue(x, height - 1);
        }
        for (int y = 0; y < height; y++)
        {
            enqueue(0, y);
            enqueue(width - 1, y);
        }

        while (head < tail)
        {
            int index = queue[head++];
            int x = index % width;
            int y = index / width;
            Color pixel = source.GetPixel(x, y);
            source.SetPixel(x, y, Color.FromArgb(0, pixel.R, pixel.G, pixel.B));
            if (x > 0) enqueue(x - 1, y);
            if (x + 1 < width) enqueue(x + 1, y);
            if (y > 0) enqueue(x, y - 1);
            if (y + 1 < height) enqueue(x, y + 1);
        }

        return source;
    }

    private static void RemoveEdgeFragments(Bitmap source)
    {
        int width = source.Width;
        int height = source.Height;
        int pixelCount = width * height;
        int[] componentIds = new int[pixelCount];
        int[] componentAreas = new int[pixelCount];
        bool[] touchesEdge = new bool[pixelCount];
        int[] queue = new int[pixelCount];
        for (int index = 0; index < pixelCount; index++) componentIds[index] = -1;

        int componentCount = 0;
        int largestComponent = -1;
        int largestArea = 0;

        for (int start = 0; start < pixelCount; start++)
        {
            int startX = start % width;
            int startY = start / width;
            if (componentIds[start] >= 0 || source.GetPixel(startX, startY).A == 0) continue;

            int head = 0;
            int tail = 0;
            int area = 0;
            bool edge = false;
            componentIds[start] = componentCount;
            queue[tail++] = start;

            while (head < tail)
            {
                int current = queue[head++];
                int x = current % width;
                int y = current / width;
                area++;
                if (x == 0 || y == 0 || x == width - 1 || y == height - 1) edge = true;

                for (int offsetY = -1; offsetY <= 1; offsetY++)
                {
                    for (int offsetX = -1; offsetX <= 1; offsetX++)
                    {
                        if (offsetX == 0 && offsetY == 0) continue;
                        int nextX = x + offsetX;
                        int nextY = y + offsetY;
                        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
                        int next = nextY * width + nextX;
                        if (componentIds[next] >= 0 || source.GetPixel(nextX, nextY).A == 0) continue;
                        componentIds[next] = componentCount;
                        queue[tail++] = next;
                    }
                }
            }

            componentAreas[componentCount] = area;
            touchesEdge[componentCount] = edge;
            if (area > largestArea)
            {
                largestArea = area;
                largestComponent = componentCount;
            }
            componentCount++;
        }

        for (int index = 0; index < pixelCount; index++)
        {
            int component = componentIds[index];
            if (component < 0 || component == largestComponent || !touchesEdge[component]) continue;
            int x = index % width;
            int y = index / width;
            Color pixel = source.GetPixel(x, y);
            source.SetPixel(x, y, Color.FromArgb(0, pixel.R, pixel.G, pixel.B));
        }
    }

    private static Bitmap Trim(Bitmap source, int padding)
    {
        int left = source.Width, top = source.Height, right = -1, bottom = -1;
        for (int y = 0; y < source.Height; y++)
        {
            for (int x = 0; x < source.Width; x++)
            {
                if (source.GetPixel(x, y).A == 0) continue;
                left = Math.Min(left, x);
                top = Math.Min(top, y);
                right = Math.Max(right, x);
                bottom = Math.Max(bottom, y);
            }
        }

        if (right < left || bottom < top) throw new InvalidOperationException("Sticker cell was empty.");
        Rectangle crop = Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
        Bitmap trimmed = new Bitmap(crop.Width + padding * 2, crop.Height + padding * 2, PixelFormat.Format32bppArgb);
        using (Graphics graphics = Graphics.FromImage(trimmed))
        {
            graphics.Clear(Color.Transparent);
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.DrawImage(source, new Rectangle(padding, padding, crop.Width, crop.Height), crop, GraphicsUnit.Pixel);
        }
        return trimmed;
    }

    private static void SaveJpeg(Bitmap bitmap, string path)
    {
        ImageCodecInfo encoder = Array.Find(ImageCodecInfo.GetImageEncoders(), item => item.MimeType == "image/jpeg");
        using (EncoderParameters parameters = new EncoderParameters(1))
        {
            parameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 90L);
            bitmap.Save(path, encoder, parameters);
        }
    }

    private static void SaveNotificationCard(Bitmap sticker, string path, Color accent)
    {
        using (Bitmap card = new Bitmap(1024, 512, PixelFormat.Format24bppRgb))
        using (Graphics graphics = Graphics.FromImage(card))
        using (Pen border = new Pen(accent, 16))
        {
            HighQuality(graphics);
            graphics.Clear(Color.FromArgb(248, 246, 244));
            double scale = Math.Min(430.0 / sticker.Width, 420.0 / sticker.Height);
            int width = Math.Max(1, (int)Math.Round(sticker.Width * scale));
            int height = Math.Max(1, (int)Math.Round(sticker.Height * scale));
            int x = (1024 - width) / 2;
            int y = (512 - height) / 2;
            graphics.DrawImage(sticker, new Rectangle(x, y, width, height));
            graphics.DrawRectangle(border, 8, 8, 1008, 496);
            SaveJpeg(card, path);
        }
    }

    public static int Extract(
        string sourcePath,
        string individualDirectory,
        string notificationDirectory,
        string prefix,
        int[] columnsPerRow,
        int sheetIndex)
    {
        using (Bitmap sheet = new Bitmap(sourcePath))
        {
            Color background = FindBackground(sheet);
            Color[] accents = {
                Color.FromArgb(143, 64, 88),
                Color.FromArgb(113, 134, 122),
                Color.FromArgb(206, 161, 87)
            };
            int stickerNumber = 0;
            int rowCount = columnsPerRow.Length;

            for (int row = 0; row < rowCount; row++)
            {
                int columns = columnsPerRow[row];
                int top = row * sheet.Height / rowCount;
                int bottom = (row + 1) * sheet.Height / rowCount;
                for (int column = 0; column < columns; column++)
                {
                    int left = column * sheet.Width / columns;
                    int right = (column + 1) * sheet.Width / columns;
                    Rectangle cell = Rectangle.FromLTRB(left, top, right, bottom);
                    using (Bitmap crop = new Bitmap(cell.Width, cell.Height, PixelFormat.Format32bppArgb))
                    {
                        using (Graphics graphics = Graphics.FromImage(crop))
                        {
                            graphics.Clear(Color.Transparent);
                            graphics.DrawImage(sheet, new Rectangle(0, 0, cell.Width, cell.Height), cell, GraphicsUnit.Pixel);
                        }
                        RemoveConnectedBackground(crop, background);
                        RemoveEdgeFragments(crop);
                        using (Bitmap sticker = Trim(crop, 12))
                        {
                            stickerNumber++;
                            string baseName = String.Format("{0}-{1:D2}", prefix, stickerNumber);
                            sticker.Save(Path.Combine(individualDirectory, baseName + ".png"), ImageFormat.Png);
                            SaveNotificationCard(
                                sticker,
                                Path.Combine(notificationDirectory, baseName + ".jpg"),
                                accents[(sheetIndex + stickerNumber) % accents.Length]
                            );
                        }
                    }
                }
            }
            return stickerNumber;
        }
    }
}
'@
}

$sheets = @(
  @{ Source = 'sheet.png';   Prefix = 'sheet1';  Rows = @(3, 3, 3, 3, 3) },
  @{ Source = 'sheet2.png';  Prefix = 'sheet2';  Rows = @(2, 2, 2) },
  @{ Source = 'sheet3.png';  Prefix = 'sheet3';  Rows = @(3, 3, 2) },
  @{ Source = 'sheet4.png';  Prefix = 'sheet4';  Rows = @(2, 3, 3) },
  @{ Source = 'sheet5.png';  Prefix = 'sheet5';  Rows = @(2, 2, 2, 2) },
  @{ Source = 'sheet6.png';  Prefix = 'sheet6';  Rows = @(2, 2) },
  @{ Source = 'sheet7.png';  Prefix = 'sheet7';  Rows = @(3, 3, 2) },
  @{ Source = 'sheet8.png';  Prefix = 'sheet8';  Rows = @(2, 2, 2) },
  @{ Source = 'sheet9.png';  Prefix = 'sheet9';  Rows = @(3, 3, 2) },
  @{ Source = 'sheet10.png'; Prefix = 'sheet10'; Rows = @(3, 3, 2) }
)

Remove-Item $IndividualDirectory -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $NotificationDirectory -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $IndividualDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $NotificationDirectory | Out-Null

$total = 0
for ($sheetIndex = 0; $sheetIndex -lt $sheets.Count; $sheetIndex++) {
  $sheet = $sheets[$sheetIndex]
  $sourcePath = Join-Path $SourceDirectory $sheet.Source
    $count = [NumNumStickerExtractor]::Extract(
    (Resolve-Path $sourcePath).Path,
    (Resolve-Path $IndividualDirectory).Path,
    (Resolve-Path $NotificationDirectory).Path,
    $sheet.Prefix,
    [int[]]$sheet.Rows,
    $sheetIndex
  )
  $total += $count
  Write-Output "$($sheet.Source): $count stickers"
}

if ($total -ne 79) {
  throw "Expected 79 stickers, generated $total."
}

Write-Output "Generated $total individual stickers and notification cards."