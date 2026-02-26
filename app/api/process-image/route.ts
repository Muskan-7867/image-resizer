import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const file = data.get("file") as File;
  const crop = JSON.parse(data.get("crop") as string);
  const quality = Number(data.get("quality"));
  const format = data.get("format") as string;
  const brightness = Number(data.get("brightness")) / 100;
  const contrast = Number(data.get("contrast")) / 100;
  const saturation = Number(data.get("saturation")) / 100;
  const blur = Number(data.get("blur"));

  const buffer = Buffer.from(await file.arrayBuffer());

  let image = sharp(buffer)
    .extract({
      left: Math.round(crop.x),
      top: Math.round(crop.y),
      width: Math.round(crop.width),
      height: Math.round(crop.height),
    })
    .modulate({
      brightness: brightness,
      saturation: saturation,
    });

  // Sharp doesn't have a direct 'contrast' method in modulate,
  // we use linear for contrast: (val * a + b)
  // contrast 1.0 is no change.
  if (contrast !== 1) {
    image = image.linear(contrast, -(0.5 * contrast) + 0.5);
  }

  if (blur > 0) {
    image = image.blur(blur);
  }

  if (format === "jpeg") {
    image = image.jpeg({ quality });
  } else if (format === "png") {
    image = image.png({ quality });
  } else if (format === "webp") {
    image = image.webp({ quality });
  }

  const output = await image.toBuffer();

  return new Response(output, {
    headers: {
      "Content-Type": `image/${format}`,
      "Content-Disposition": `inline; filename=processed.${format}`,
    },
  });
}
