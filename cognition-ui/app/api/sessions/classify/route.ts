import { NextRequest } from "next/server";
import { handleClassifySessions } from "@/features/sessions/handler";

export async function POST(req: NextRequest) {
  return handleClassifySessions(req);
}
