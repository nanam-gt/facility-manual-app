import Link from "next/link";

type PageShellProps = {
	children: React.ReactNode;
};

export function PageShell({ children }: PageShellProps) {
	return (
		<main className="min-h-screen bg-[#f6f7f4] text-[#22251f]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:px-8 lg:px-10">{children}</div>
		</main>
	);
}

export function BackHomeLink() {
	return (
		<Link
			href="/"
			className="w-fit text-sm font-medium text-[#315f3a] underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
		>
			トップへ戻る
		</Link>
	);
}
