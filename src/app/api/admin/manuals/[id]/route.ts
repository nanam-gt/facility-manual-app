import { NextRequest, NextResponse } from "next/server";
import { updateManual } from "@/lib/admin/manual-queries";
import { rejectCrossOriginPost } from "@/lib/auth/request-guards";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getEnv } from "@/lib/db/client";
import { detectImageMetadata } from "@/lib/images/metadata";

const allowedStatuses = new Set(["draft", "published", "private"]);
const allowedDurationModes = new Set(["manual", "steps_sum", "hidden"]);

type ManualRouteProps = {
	params: Promise<{
		id: string;
	}>;
};

export async function POST(request: NextRequest, { params }: ManualRouteProps) {
	const crossOriginResponse = rejectCrossOriginPost(request);
	if (crossOriginResponse) {
		return crossOriginResponse;
	}

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
	const stepImageKeys = formData.getAll("stepImageObjectKey").map(String);
	const stepImageAlts = formData.getAll("stepImageAlt").map(String);
	const stepImages = formData.getAll("stepImage");
	const env = await getEnv();

	await updateManual({
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
		steps: await Promise.all(
			stepTitles.map(async (stepTitle, index) => {
				const uploaded = await uploadStepImage(env.MANUAL_IMAGES, id, stepImages[index], stepImageAlts[index] ?? "");

				return {
					title: stepTitle.trim(),
					description: stepDescriptions[index]?.trim() ?? "",
					warning: stepWarnings[index]?.trim() ?? "",
					completionCriteria: stepCompletions[index]?.trim() ?? "",
					tools: stepTools[index]?.trim() ?? "",
					durationMinutes: numberOrNull(stepDurations[index] ?? ""),
					imageObjectKey: uploaded?.objectKey ?? nullable(stepImageKeys[index] ?? ""),
					imageAlt: uploaded?.imageAlt ?? nullable(stepImageAlts[index] ?? ""),
					imageWidth: uploaded?.width ?? null,
					imageHeight: uploaded?.height ?? null,
					imageMimeType: uploaded?.mimeType ?? null,
				};
			}),
		),
	});

	return NextResponse.redirect(new URL("/admin/manuals?saved=updated", request.url), 303);
}

async function uploadStepImage(
	bucket: R2Bucket | undefined,
	manualId: string,
	value: FormDataEntryValue | undefined,
	imageAlt: string,
): Promise<{
	objectKey: string;
	imageAlt: string;
	width: number | null;
	height: number | null;
	mimeType: string;
} | null> {
	if (!(value instanceof File) || value.size === 0) {
		return null;
	}

	if (!bucket) {
		throw new Error("R2 binding `MANUAL_IMAGES` is not available.");
	}

	if (value.size > 10 * 1024 * 1024) {
		throw new Error("Image is too large.");
	}

	const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
	if (!allowedTypes.has(value.type)) {
		throw new Error("Unsupported image type.");
	}

	const extension = value.type === "image/png" ? "png" : value.type === "image/webp" ? "webp" : "jpg";
	const objectKey = `manuals/${manualId}/steps/${crypto.randomUUID()}.${extension}`;
	const bytes = await value.arrayBuffer();
	const metadata = detectImageMetadata(bytes);
	if (!metadata || metadata.mimeType !== value.type) {
		throw new Error("Invalid image file.");
	}

	await bucket.put(objectKey, bytes, {
		httpMetadata: {
			contentType: metadata.mimeType,
			cacheControl: "public, max-age=31536000, immutable",
		},
	});

	return {
		objectKey,
		imageAlt: imageAlt.trim(),
		width: metadata.width,
		height: metadata.height,
		mimeType: metadata.mimeType,
	};
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

function nullable(value: string): string | null {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
