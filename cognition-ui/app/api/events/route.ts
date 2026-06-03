import { NextRequest, NextResponse } from "next/server";
import { handleIngestEvents, CORS_HEADERS } from "@/features/events/handler";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  return handleIngestEvents(req);
}
