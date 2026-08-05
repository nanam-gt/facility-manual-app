import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { listAdminManuals } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
	draft: "下書き",
	published: "公開",
	private: "非公開",
};

export default async function AdminManualsPage() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const manuals = await listAdminManuals();

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

			<section className="grid gap-3">
				{manuals.map((manual) => (
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
								<Link
									href={`/manuals/${manual.slug}`}
									className="rounded-md border border-[#c9cec1] px-2.5 py-1 text-sm font-semibold text-[#315f3a] hover:border-[#8aa879]"
								>
									表示
								</Link>
							</div>
						</div>
					</div>
				))}
			</section>
		</PageShell>
	);
}
