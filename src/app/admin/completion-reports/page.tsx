import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import {
	getAdminCompletionReportSummary,
	listAdminCompletionReports,
	type AdminCompletionReport,
} from "@/lib/admin/completion-report-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminCompletionReportsPage() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const [stats, reports] = await Promise.all([getAdminCompletionReportSummary(), listAdminCompletionReports()]);

	return (
		<PageShell>
			<div className="flex items-center justify-between gap-4">
				<BackHomeLink />
				<Link
					href="/admin"
					className="text-sm font-medium text-[#315f3a] underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
				>
					管理トップへ
				</Link>
			</div>

			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">完了報告</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">一般ユーザーから送信された完了報告と取り消し履歴を確認します。</p>
			</header>

			<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="現在の完了報告" value={stats.activeReports} note="24時間以内・未取り消し" />
				<StatCard label="今日の報告" value={stats.todayReports} note="取り消し分を含む" />
				<StatCard label="取り消し済み" value={stats.canceledReports} note="全期間" />
				<StatCard label="総履歴" value={stats.totalReports} note="全期間" />
			</section>

			<section className="grid gap-3">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-xl font-semibold">履歴</h2>
					<span className="text-sm text-[#6b7165]">最新100件</span>
				</div>
				{reports.length > 0 ? (
					<div className="grid gap-3">
						{reports.map((report) => (
							<ReportCard key={report.id} report={report} />
						))}
					</div>
				) : (
					<p className="rounded-md border border-dashed border-[#c9cec1] bg-white p-4 text-sm leading-6 text-[#687061]">
						完了報告はまだありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}

function StatCard({ label, value, note }: { label: string; value: number; note: string }) {
	return (
		<section className="rounded-md border border-[#d9ded2] bg-white p-4">
			<p className="text-sm font-medium text-[#687061]">{label}</p>
			<p className="mt-2 text-3xl font-semibold">{value}</p>
			<p className="mt-1 text-xs text-[#7c8374]">{note}</p>
		</section>
	);
}

function ReportCard({ report }: { report: AdminCompletionReport }) {
	return (
		<article className="rounded-md border border-[#d9ded2] bg-white p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<StatusBadge report={report} />
						<p className="text-sm text-[#687061]">
							{report.areaName} / {report.timingName}
						</p>
					</div>
					<h3 className="mt-2 text-lg font-semibold">{report.manualTitle}</h3>
					<p className="mt-1 text-sm text-[#5f6559]">報告者: {report.reporterName}</p>
				</div>
				<Link
					href={`/manuals/${report.manualSlug}`}
					className="inline-flex min-h-10 w-fit items-center rounded-md border border-[#c9cec1] px-3 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
				>
					マニュアル表示
				</Link>
			</div>
			<div className="mt-4 grid gap-2 border-t border-[#e3e6dc] pt-3 text-sm leading-6 text-[#5f6559] sm:grid-cols-2">
				<p>報告日時: {formatDateTime(report.reportedAt)}</p>
				{report.canceledAt ? (
					<p>
						取り消し: {formatDateTime(report.canceledAt)}
						{report.canceledByName ? ` / ${report.canceledByName}` : ""}
					</p>
				) : (
					<p>取り消し: なし</p>
				)}
			</div>
		</article>
	);
}

function StatusBadge({ report }: { report: AdminCompletionReport }) {
	if (report.canceledAt) {
		return <span className="rounded-md bg-[#f4ede2] px-2.5 py-1 text-sm font-semibold text-[#75542c]">取り消し済み</span>;
	}

	if (report.isActive) {
		return <span className="rounded-md bg-[#e6f1e3] px-2.5 py-1 text-sm font-semibold text-[#315f3a]">完了報告済み</span>;
	}

	return <span className="rounded-md bg-[#edf1e9] px-2.5 py-1 text-sm font-semibold text-[#5f6559]">24時間経過</span>;
}

function formatDateTime(value: string): string {
	return new Intl.DateTimeFormat("ja-JP", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
