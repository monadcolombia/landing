import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.galleryPhoto
    .findUnique({ where: { id }, select: { data: true, mime: true } })
    .catch(() => null);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      // A photo never changes under the same id: replacing it creates a new row.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
