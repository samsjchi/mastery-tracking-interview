import { getDetailedReport } from "@/lib/store";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const tutorId = searchParams.get("tutor_id");
  const studentId = searchParams.get("student_id");

  if (!tutorId || !studentId) {
    return Response.json(
      { detail: "tutor_id and student_id are required" },
      { status: 400 }
    );
  }

  const report = getDetailedReport(tutorId, studentId);
  if (!report) {
    return Response.json(
      { detail: "No starter detailed report found for the provided tutor/student." },
      { status: 404 }
    );
  }

  return Response.json(report);
}
