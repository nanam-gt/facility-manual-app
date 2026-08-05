import { NextRequest, NextResponse } from "next/server";
import { updateManual } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

const allowedStatuses = new Set(["draft", "published", "private"]);
const allowedDurationModes = new Set(["manual", "steps_sum", "hidden"]);

type ManualRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: ManualRouteProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		return NextResponse.redirect(new URL("/admin/login", request.url), 303);
	}

	const { id } = await params;
	const formData = await request.formData();
	const title = text(formData, "title");
	const areaId = text(formData, "areaId");
	const timingId = text(formData, "timingId");
	const status = text(formData, "status");
	const durationMode = text(formData, "durationMode");

	if (!title || !areaId || !timingId || !allowedStatuses.has(status) || !allowedDurationModes.has(durationMode)) {
		return NextResponse.redirect(new URL(`/admin/manuals/${id}/edit?error=required`, request.url), 303);
	}

	const stepTitles = formData.getAll("stepTitle").map(String);
	const stepDescriptions = formData.getAll("stepDescription").map(String);
	const stepWarnings = formData.getAll("stepWarning").map(String);
	const stepCompletions = formData.getAll("stepCompletion").map(String);
	const stepTools = formData.getAll("stepTools").map(String);
	const stepDurations = formData.getAll("stepDuration").map(String);

	const slug = await updateManual({
		id,
		title,
		slug: text(formData, "slug"),
		areaId,
		timingId,
		summary: text(formData, "summary"),
		preparation: text(formData, "preparation"),
		tools: text(formData, "tools"),
		chemicals: text(formData, "chemicals"),
		targetStaff: text(formData, "targetStaff"),
		frequency: text(formData, "frequency"),
		durationMode: durationMode as "manual" | "steps_sum" | "hidden",
		durationMinMinutes: numberOrNull(text(formData, "durationMinMinutes")),
		durationMaxMinutes: numberOrNull(text(formData, "durationMaxMinutes")),
		durationNote: text(formData, "durationNote"),
		generalWarning: text(formData, "generalWarning"),
		completionNote: text(formData, "completionNote"),
		searchKeywords: text(formData, "searchKeywords"),
		status: status as "draft" | "published" | "private",
		steps: stepTitles.map((stepTitle, index) => ({
			title: stepTitle.trim(),
			description: stepDescriptions[index]?.trim() ?? "",
			warning: stepWarnings[index]?.trim() ?? "",
			completionCriteria: stepCompletions[index]?.trim() ?? "",
			tools: stepTools[index]?.trim() ?? "",
			durationMinutes: numberOrNull(stepDurations[index] ?? ""),
		})),
	});

	return NextResponse.redirect(new URL(`/manuals/${slug}`, request.url), 303);
}

function text(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "").trim();
}

function numberOrNull(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
