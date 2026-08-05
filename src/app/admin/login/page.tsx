import { BackHomeLink, PageShell } from "@/components/public/page-shell";

type AdminLoginPageProps = {
	searchParams: Promise<{
		error?: string;
	}>;
};

const errorMessages: Record<string, string> = {
	required: "メールアドレスとパスワードを入力してください。",
	invalid: "メールアドレスまたはパスワードが正しくありません。",
	setup: "管理者ログインの初期設定が未完了です。.dev.vars の SESSION_SECRET と初期管理者情報を確認してください。",
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
	const { error } = await searchParams;
	const errorMessage = error ? errorMessages[error] : null;

	return (
		<PageShell>
			<BackHomeLink />
			<section className="mx-auto flex w-full max-w-md flex-col gap-6">
				<header>
					<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
					<h1 className="mt-2 text-3xl font-semibold leading-tight">ログイン</h1>
					<p className="mt-3 text-sm leading-6 text-[#5f6559]">
						登録・編集を行う管理者向け画面です。一般スタッフはログイン不要で公開マニュアルを閲覧できます。
					</p>
				</header>

				<form action="/api/admin/auth/login" method="post" className="flex flex-col gap-4 rounded-md border border-[#d9ded2] bg-white p-5">
					{errorMessage ? (
						<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">{errorMessage}</p>
					) : null}
					<div className="flex flex-col gap-2">
						<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="email">
							メールアドレス
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
							placeholder="admin@example.jp"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="password">
							パスワード
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
							placeholder="パスワード"
						/>
					</div>
					<button
						type="submit"
						className="min-h-12 rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						ログイン
					</button>
				</form>
			</section>
		</PageShell>
	);
}
