import Link from "next/link";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";

export default function AdminPage() {
	return (
		<PageShell>
			<BackHomeLink />
			<section className="rounded-md border border-[#d9ded2] bg-white p-5">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">管理機能は準備中です</h1>
				<p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6559]">
					次のフェーズで管理者ログイン、セッション、管理画面の保護を実装します。現時点では公開画面の確認を優先しています。
				</p>
				<Link
					href="/admin/login"
					className="mt-5 inline-flex min-h-12 items-center rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
				>
					ログイン画面を見る
				</Link>
			</section>
		</PageShell>
	);
}
