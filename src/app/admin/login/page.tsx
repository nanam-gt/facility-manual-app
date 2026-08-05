import { BackHomeLink, PageShell } from "@/components/public/page-shell";

export default function AdminLoginPage() {
	return (
		<PageShell>
			<BackHomeLink />
			<section className="mx-auto flex w-full max-w-md flex-col gap-6">
				<header>
					<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
					<h1 className="mt-2 text-3xl font-semibold leading-tight">ログイン</h1>
					<p className="mt-3 text-sm leading-6 text-[#5f6559]">
						管理者認証は次のフェーズで有効化します。画面だけ先に配置しています。
					</p>
				</header>

				<form className="flex flex-col gap-4 rounded-md border border-[#d9ded2] bg-white p-5">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="email">
							メールアドレス
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							disabled
							className="min-h-12 rounded-md border border-[#c9cec1] bg-[#f3f5f0] px-4 text-base text-[#7c8374]"
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
							disabled
							className="min-h-12 rounded-md border border-[#c9cec1] bg-[#f3f5f0] px-4 text-base text-[#7c8374]"
							placeholder="次フェーズで有効化"
						/>
					</div>
					<button
						type="button"
						disabled
						className="min-h-12 rounded-md bg-[#9ba593] px-5 text-base font-semibold text-white"
					>
						次フェーズで有効化
					</button>
				</form>
			</section>
		</PageShell>
	);
}
