import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import {
	listPublicAreaSummaries,
	listPublicTimingSummaries,
	searchPublicManuals,
} from "@/lib/db/public-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const [areas, timings, manuals] = await Promise.all([
		listPublicAreaSummaries(),
		listPublicTimingSummaries(),
		searchPublicManuals({}),
	]);

	return (
		<PageShell>
			<div className="flex items-center justify-between gap-4">
				<BackHomeLink />
				<Link
					href="/admin"
					className="inline-flex min-h-11 items-center rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
				>
					管理トップ
				</Link>
			</div>

			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">ブック印刷</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6559]">
					公開中のマニュアルをまとめて、表紙と目次つきの印刷ページにします。
				</p>
			</header>

			<form action="/print/books" className="grid gap-6 rounded-md border border-[#d9ded2] bg-white p-5">
				<section className="grid gap-3">
					<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="book-title">
						表紙タイトル
					</label>
					<input
						id="book-title"
						name="title"
						type="text"
						defaultValue="施設管理マニュアル"
						className="min-h-12 rounded-md border border-[#c9cec1] px-4 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					/>
				</section>

				<section className="grid gap-4 sm:grid-cols-2">
					<div className="grid gap-3">
						<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="book-area">
							エリア
						</label>
						<select
							id="book-area"
							name="areaId"
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							<option value="">すべて</option>
							{areas.map((area) => (
								<option key={area.id} value={area.id}>
									{area.name}（{area.manualCount}件）
								</option>
							))}
						</select>
					</div>

					<div className="grid gap-3">
						<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="book-timing">
							タイミング
						</label>
						<select
							id="book-timing"
							name="timingId"
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							<option value="">すべて</option>
							{timings.map((timing) => (
								<option key={timing.id} value={timing.id}>
									{timing.name}（{timing.manualCount}件）
								</option>
							))}
						</select>
					</div>
				</section>

				<section className="grid gap-3">
					<div className="flex items-end justify-between gap-4">
						<h2 className="text-lg font-semibold">個別に選択</h2>
						<span className="text-sm text-[#6b7165]">{manuals.length}件</span>
					</div>
					<div className="grid max-h-[28rem] gap-2 overflow-auto rounded-md border border-[#e3e6dc] p-3">
						{manuals.map((manual) => (
							<label key={manual.id} className="flex gap-3 rounded-md p-2 hover:bg-[#f6f7f4]">
								<input type="checkbox" name="manualId" value={manual.id} className="mt-1 size-4" />
								<span className="grid gap-1">
									<span className="font-semibold">{manual.title}</span>
									<span className="text-sm text-[#687061]">
										{manual.areaName} / {manual.timingName} / 更新日 {manual.updatedAt}
									</span>
								</span>
							</label>
						))}
					</div>
					<p className="text-sm leading-6 text-[#687061]">
						何も選択しない場合は、上のエリア・タイミング条件に合う公開マニュアルをまとめます。
					</p>
				</section>

				<div className="flex flex-wrap gap-3">
					<button
						type="submit"
						className="min-h-12 rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						印刷ページを開く
					</button>
					<Link
						href="/admin"
						className="inline-flex min-h-12 items-center rounded-md border border-[#c9cec1] px-5 text-base font-semibold text-[#315f3a] hover:border-[#8aa879]"
					>
						戻る
					</Link>
				</div>
			</form>
		</PageShell>
	);
}
