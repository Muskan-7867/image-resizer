import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const data = await req.formData();

  const file = data.get("file") as File;
  const crop = JSON.parse(data.get("crop") as string);
  const quality = Number(data.get("quality"));
  const format = data.get("format") as string;

  const buffer = Buffer.from(await file.arrayBuffer());

  let image = sharp(buffer).extract({
    left: Math.round(crop.x),
    top: Math.round(crop.y),
    width: Math.round(crop.width),
    height: Math.round(crop.height),
  });

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
