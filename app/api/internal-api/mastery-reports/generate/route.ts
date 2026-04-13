import { regenerateReport } from "@/lib/store";
import type { GenerateMasteryRequest, GenerateMasteryResponse } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateMasteryRequest;

  const nextReport = regenerateReport(body);
  if (!nextReport) {
    return Response.json(
      { detail: "No seeded tutor/student/session matched the request." },
      { status: 404 }
    );
  }

  const response: GenerateMasteryResponse = {
    success: true,
    report: nextReport.latest,
    detailed_report: nextReport.detailed,
  };

  return Response.json(response);
}
