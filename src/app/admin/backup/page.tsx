import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminBackupPage() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

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
				<h1 className="mt-2 text-3xl font-semibold leading-tight">バックアップ</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6559]">
					登録済みの分類、マニュアル、手順、関連情報をダウンロードできます。
				</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2">
				<a
					href="/api/admin/export/json"
					className="rounded-md border border-[#d9ded2] bg-white p-5 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
				>
					<h2 className="text-xl font-semibold">JSONエクスポート</h2>
					<p className="mt-3 text-sm leading-6 text-[#687061]">復元や移行に使いやすい形式で全データを保存します。</p>
				</a>
				<a
					href="/api/admin/export/csv"
					className="rounded-md border border-[#d9ded2] bg-white p-5 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
				>
					<h2 className="text-xl font-semibold">CSVエクスポート</h2>
					<p className="mt-3 text-sm leading-6 text-[#687061]">表計算ソフトで確認しやすい形式で主要データを保存します。</p>
				</a>
			</section>
		</PageShell>
	);
}
