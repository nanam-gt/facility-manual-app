import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteManualButton } from "@/components/admin/delete-manual-button";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getManualFormOptions, listAdminManuals } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
	draft: "下書き",
	published: "公開",
	private: "非公開",
};

const savedMessages: Record<string, string> = {
	created: "マニュアルを作成しました。",
	updated: "マニュアルを保存しました。",
	duplicated: "マニュアルを複製しました。",
	deleted: "マニュアルを削除しました。",
};

type AdminManualsPageProps = {
	searchParams: Promise<{
		q?: string;
		status?: string;
		areaId?: string;
		timingId?: string;
		saved?: string;
	}>;
};

export default async function AdminManualsPage({ searchParams }: AdminManualsPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const params = await searchParams;
	const [manuals, options] = await Promise.all([
		listAdminManuals({
			q: params.q,
			status: params.status,
			areaId: params.areaId,
			timingId: params.timingId,
		}),
		getManualFormOptions(),
	]);

	return (
		<PageShell>
			<div className="flex items-center justify-between gap-4">
				<BackHomeLink />
				<Link
					href="/admin/manuals/new"
					className="inline-flex min-h-11 items-center rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
				>
					新規作成
				</Link>
			</div>
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">マニュアル管理</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">公開状態と分類を確認しながら、マニュアルを管理します。</p>
			</header>

			{params.saved && savedMessages[params.saved] ? (
				<p className="rounded-md border border-[#c9d9c5] bg-white p-3 text-sm font-semibold text-[#315f3a]">
					{savedMessages[params.saved]}
				</p>
			) : null}

			<form className="grid gap-3 rounded-md border border-[#d9ded2] bg-white p-4 lg:grid-cols-[1fr_12rem_12rem_12rem_auto]">
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-[#4f5d43]">検索</span>
					<input
						name="q"
						type="search"
						defaultValue={params.q ?? ""}
						placeholder="タイトル、概要、分類"
						className="min-h-11 rounded-md border border-[#c9cec1] px-3 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					/>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-[#4f5d43]">状態</span>
					<select
						name="status"
						defaultValue={params.status ?? ""}
						className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-3 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					>
						<option value="">すべて</option>
						<option value="published">公開</option>
						<option value="draft">下書き</option>
						<option value="private">非公開</option>
					</select>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-[#4f5d43]">エリア</span>
					<select
						name="areaId"
						defaultValue={params.areaId ?? ""}
						className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-3 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					>
						<option value="">すべて</option>
						{options.areas.map((area) => (
							<option key={area.id} value={area.id}>
								{area.name}
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-[#4f5d43]">タイミング</span>
					<select
						name="timingId"
						defaultValue={params.timingId ?? ""}
						className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-3 text-base outline-none focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					>
						<option value="">すべて</option>
						{options.timings.map((timing) => (
							<option key={timing.id} value={timing.id}>
								{timing.name}
							</option>
						))}
					</select>
				</label>
				<div className="flex items-end gap-2">
					<button
						type="submit"
						className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						絞り込み
					</button>
					<Link
						href="/admin/manuals"
						className="inline-flex min-h-11 items-center rounded-md border border-[#c9cec1] px-4 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
					>
						解除
					</Link>
				</div>
			</form>

			<section className="grid gap-3">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-xl font-semibold">一覧</h2>
					<span className="text-sm text-[#6b7165]">{manuals.length}件</span>
				</div>
				{manuals.length > 0 ? (
					manuals.map((manual) => (
						<div key={manual.id} className="rounded-md border border-[#d9ded2] bg-white p-4">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<p className="text-sm text-[#687061]">
										{manual.areaName} / {manual.timingName}
									</p>
									<h2 className="mt-1 text-lg font-semibold">{manual.title}</h2>
									<p className="mt-1 text-xs text-[#7c8374]">更新日 {manual.updatedAt}</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<span className="rounded-md bg-[#edf1e9] px-2.5 py-1 text-sm text-[#4f5d43]">
										{statusLabels[manual.status] ?? manual.status}
									</span>
									{manual.status === "published" ? (
										<Link
											href={`/manuals/${manual.slug}`}
											className="rounded-md border border-[#c9cec1] px-2.5 py-1 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
										>
											表示
										</Link>
									) : null}
									<Link
										href={`/admin/manuals/${manual.id}/edit`}
										className="rounded-md border border-[#c9cec1] px-2.5 py-1 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
									>
										編集
									</Link>
									<form action={`/api/admin/manuals/${manual.id}/duplicate`} method="post">
										<button
											type="submit"
											className="rounded-md border border-[#c9cec1] px-2.5 py-1 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
										>
											複製
										</button>
									</form>
									<DeleteManualButton manualId={manual.id} title={manual.title} />
								</div>
							</div>
						</div>
					))
				) : (
					<p className="rounded-md border border-dashed border-[#c9cec1] bg-white p-4 text-sm leading-6 text-[#687061]">
						条件に一致するマニュアルはありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}
