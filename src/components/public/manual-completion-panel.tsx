"use client";

import { useMemo, useState } from "react";
import type { ActiveCompletionReport, CompletionReporter } from "@/lib/db/completion-reports";

type ManualCompletionPanelProps = {
	manualId: string;
	reporters: CompletionReporter[];
	initialActiveReport: ActiveCompletionReport | null;
};

export function ManualCompletionPanel({ manualId, reporters, initialActiveReport }: ManualCompletionPanelProps) {
	const [activeReport, setActiveReport] = useState(initialActiveReport);
	const [selectedReporterId, setSelectedReporterId] = useState(reporters[0]?.id ?? "");
	const [modalOpen, setModalOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const selectedReporter = reporters.find((reporter) => reporter.id === selectedReporterId);
	const canCancel = activeReport && selectedReporterId === activeReport.reporterId;
	const reportedLabel = useMemo(() => (activeReport ? formatJstDateTime(activeReport.reportedAt) : ""), [activeReport]);

	async function submit(action: "complete" | "cancel") {
		if (!selectedReporterId) {
			setError("名前を選択してください。");
			return;
		}

		if (action === "complete" && !window.confirm("完了報告をしますか？")) {
			return;
		}

		if (action === "cancel" && !window.confirm("完了報告を取り消しますか？")) {
			return;
		}

		setSubmitting(true);
		setError(null);

		const formData = new FormData();
		formData.set("action", action);
		formData.set("manualId", manualId);
		formData.set("reporterId", selectedReporterId);

		try {
			const response = await fetch("/api/public/completion-reports", {
				method: "POST",
				body: formData,
			});
			const result = (await response.json()) as { activeReport?: ActiveCompletionReport | null; error?: string };

			if (!response.ok) {
				throw new Error(result.error ?? "完了報告に失敗しました。");
			}

			setActiveReport(result.activeReport ?? null);
			setModalOpen(false);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "完了報告に失敗しました。");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section className="grid gap-4 rounded-md border border-[#c9d9c5] bg-white p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h2 className="font-semibold">完了報告</h2>
					{activeReport ? (
						<p className="mt-2 text-sm leading-6 text-[#315f3a]">
							完了報告済み: {reportedLabel} / {activeReport.reporterName}
						</p>
					) : (
						<p className="mt-2 text-sm leading-6 text-[#5f6559]">作業が終わったら完了報告を送信できます。</p>
					)}
				</div>
				<button
					type="button"
					onClick={() => {
						setError(null);
						setModalOpen(true);
					}}
					className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
				>
					{activeReport ? "報告内容を確認" : "完了報告"}
				</button>
			</div>

			{modalOpen ? (
				<div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4 py-6">
					<div className="grid w-full max-w-md gap-4 rounded-md bg-white p-5 shadow-xl">
						<div>
							<h3 className="text-lg font-semibold">完了報告</h3>
							<p className="mt-2 text-sm leading-6 text-[#5f6559]">名前を選択して操作してください。</p>
						</div>
						<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]">
							名前
							<select
								value={selectedReporterId}
								onChange={(event) => setSelectedReporterId(event.target.value)}
								className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
							>
								{reporters.map((reporter) => (
									<option key={reporter.id} value={reporter.id}>
										{reporter.name}
									</option>
								))}
							</select>
						</label>

						{activeReport ? (
							<p className="rounded-md bg-[#edf1e9] p-3 text-sm leading-6 text-[#315f3a]">
								{activeReport.reporterName} さんが {reportedLabel} に完了報告済みです。
							</p>
						) : null}
						{activeReport && !canCancel ? (
							<p className="text-sm leading-6 text-[#6f5420]">取り消しは、報告した本人の名前を選択した場合のみできます。</p>
						) : null}
						{error ? <p className="rounded-md bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">{error}</p> : null}

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={() => setModalOpen(false)}
								className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
							>
								閉じる
							</button>
							{activeReport ? (
								<button
									type="button"
									onClick={() => submit("cancel")}
									disabled={!canCancel || submitting}
									className="min-h-11 rounded-md border border-[#d8c7a2] px-4 text-sm font-semibold text-[#6f5420] transition hover:border-[#b9914b] focus:outline-none focus:ring-4 focus:ring-[#b9914b]/15 disabled:cursor-not-allowed disabled:opacity-50"
								>
									取り消し
								</button>
							) : (
								<button
									type="button"
									onClick={() => submit("complete")}
									disabled={!selectedReporter || submitting}
									className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25 disabled:cursor-not-allowed disabled:opacity-50"
								>
									完了
								</button>
							)}
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
}

function formatJstDateTime(value: string): string {
	return new Intl.DateTimeFormat("ja-JP", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
