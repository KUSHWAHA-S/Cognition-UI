import { NextRequest } from "next/server";
import { handleGetFlows } from "@/features/dashboard/flows/api";

export async function GET(req: NextRequest) {
  return handleGetFlows(req);
}
