import { getCapabilities, isDemo } from "@/lib/ai/models";

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  };

  const capabilities = await getCapabilities();

  if (isDemo) {
    const { getAllModels } = await import("@/lib/ai/models");
    const models = await getAllModels();
    const caps = Object.fromEntries(
      models.map((m: any) => [m.id, capabilities[m.id] ?? m.capabilities])
    );

    return Response.json({ capabilities: caps, models }, { headers });
  }

  return Response.json(capabilities, { headers });
}
