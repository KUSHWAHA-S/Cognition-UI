import { NextRequest } from "next/server";
import { handleCreateProject } from "@/features/projects/handler";

export async function POST(req: NextRequest) {
  return handleCreateProject(req);
}
