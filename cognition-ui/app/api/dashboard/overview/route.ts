import { NextRequest } from "next/server";
import { handleGetOverview } from "@/features/dashboard/api";

export async function GET(req: NextRequest) {
  return handleGetOverview(req);
}
