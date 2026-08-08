import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getAdminCompletionReportSummary } from "@/lib/admin/completion-report-queries";
import { getAdminDashboardData } from "@/lib/admin/dashboard-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const admin = await getCurrentAdmin();

	if (!admin) {
		redirect("/admin/login");
	}

	const [{ stats, recentManuals }, completionSummary] = await Promise.all([
		getAdminDashboardData(),
		getAdminCompletionReportSummary(),
	]);

	return (
		<PageShell>
			<BackHomeLink />
			<header className="flex flex-col gap-4 border-b border-[#d7dbd0] pb-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
					<h1 className="mt-2 text-3xl font-semibold leading-tight">ダッシュボード</h1>
					<p className="mt-3 text-sm leading-6 text-[#5f6559]">{admin.displayName} としてログイン中です。</p>
				</div>
				<form action="/api/admin/auth/logout" method="post">
					<button
						type="submit"
						className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#4f5d43] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
					>
						ログアウト
					</button>
				</form>
			</header>

			<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard label="公開" value={stats.publishedManuals} />
				<StatCard label="下書き" value={stats.draftManuals} />
				<StatCard label="非公開" value={stats.privateManuals} />
				<StatCard label="エリア" value={stats.areas} />
				<StatCard label="タイミング" value={stats.timings} />
			</section>

			<section className="grid gap-4 lg:grid-cols-[1fr_0.75fr]">
				<div className="rounded-md border border-[#d9ded2] bg-white p-5">
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-xl font-semibold">最近更新されたマニュアル</h2>
						<Link href="/admin/manuals" className="text-sm font-semibold text-[#315f3a] underline-offset-4 hover:underline">
							一覧
						</Link>
					</div>
					<div className="mt-4 grid gap-3">
						{recentManuals.map((manual) => (
							<div key={manual.id} className="rounded-md border border-[#e3e6dc] p-3">
								<p className="text-sm text-[#687061]">
									{manual.areaName} / {manual.timingName} / {manual.status}
								</p>
								<h3 className="mt-1 font-semibold">{manual.title}</h3>
								<p className="mt-1 text-xs text-[#7c8374]">更新日 {manual.updatedAt}</p>
							</div>
						))}
					</div>
				</div>
				<div className="rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">管理メニュー</h2>
					<div className="mt-4 grid gap-3 text-sm leading-6 text-[#5f6559]">
						<p>分類、マニュアル、バックアップを管理できます。</p>
						<Link
							href="/admin/manuals"
							className="inline-flex min-h-11 w-fit items-center rounded-md bg-[#2f5f3b] px-4 font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
						>
							マニュアル管理へ
						</Link>
						<Link
							href="/admin/completion-reports"
							className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-[#2f5f3b] px-4 font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
						>
							完了報告を見る
							{completionSummary.activeReports > 0 ? (
								<span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-[#2f5f3b]">
									{completionSummary.activeReports}
								</span>
							) : null}
						</Link>
						<div className="flex flex-wrap gap-2">
							<Link
								href="/admin/areas"
								className="inline-flex min-h-10 items-center rounded-md border border-[#c9cec1] px-3 font-semibold text-[#315f3a] hover:border-[#8aa879]"
							>
								エリア管理
							</Link>
							<Link
								href="/admin/timings"
								className="inline-flex min-h-10 items-center rounded-md border border-[#c9cec1] px-3 font-semibold text-[#315f3a] hover:border-[#8aa879]"
							>
								タイミング管理
							</Link>
							<Link
								href="/admin/books"
								className="inline-flex min-h-10 items-center rounded-md border border-[#c9cec1] px-3 font-semibold text-[#315f3a] hover:border-[#8aa879]"
							>
								ブック印刷
							</Link>
							<Link
								href="/admin/backup"
								className="inline-flex min-h-10 items-center rounded-md border border-[#c9cec1] px-3 font-semibold text-[#315f3a] hover:border-[#8aa879]"
							>
								バックアップ
							</Link>
							<Link
								href="/admin/settings"
								className="inline-flex min-h-10 items-center rounded-md border border-[#c9cec1] px-3 font-semibold text-[#315f3a] hover:border-[#8aa879]"
							>
								設定
							</Link>
						</div>
					</div>
				</div>
			</section>
		</PageShell>
	);
}

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<section className="rounded-md border border-[#d9ded2] bg-white p-4">
			<p className="text-sm font-medium text-[#687061]">{label}</p>
			<p className="mt-2 text-3xl font-semibold">{value}</p>
		</section>
	);
}
