import Link from "next/link";
import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
	required: "入力内容を確認してください。",
	mismatch: "新しいパスワードが一致していません。",
	weak: "新しいパスワードは12文字以上で入力してください。",
	invalid_current: "現在のパスワードが違います。",
	not_found: "管理者情報が見つかりませんでした。",
};

type AdminSettingsPageProps = {
	searchParams: Promise<{
		error?: string;
	}>;
};

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const { error } = await searchParams;

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
				<h1 className="mt-2 text-3xl font-semibold leading-tight">設定</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">{admin.email} でログイン中です。</p>
			</header>

			<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
				<div>
					<h2 className="text-xl font-semibold">パスワード変更</h2>
					<p className="mt-2 text-sm leading-6 text-[#687061]">変更後はいったんログアウトします。新しいパスワードでログインしてください。</p>
				</div>

				{error && errorMessages[error] ? (
					<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
						{errorMessages[error]}
					</p>
				) : null}

				<form action="/api/admin/settings/password" method="post" className="grid gap-4">
					<PasswordInput label="現在のパスワード" name="currentPassword" />
					<PasswordInput label="新しいパスワード" name="newPassword" />
					<PasswordInput label="新しいパスワードの確認" name="confirmPassword" />
					<button
						type="submit"
						className="min-h-12 w-fit rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						変更する
					</button>
				</form>
			</section>
		</PageShell>
	);
}

function PasswordInput({ label, name }: { label: string; name: string }) {
	return (
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor={name}>
			{label}
			<input
				id={name}
				name={name}
				type="password"
				required
				minLength={12}
				className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			/>
		</label>
	);
}
