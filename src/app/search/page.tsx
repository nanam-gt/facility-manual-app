import { ManualCard } from "@/components/public/manual-card";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { searchPublicManuals } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

type SearchPageProps = {
	searchParams: Promise<{
		q?: string;
		timingId?: string;
		areaId?: string;
	}>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
	const params = await searchParams;
	const query = params.q?.trim() ?? "";
	const manuals = await searchPublicManuals({
		q: query,
		timingId: params.timingId,
		areaId: params.areaId,
	});

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">検索</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">マニュアル検索</h1>
				<form action="/search" className="mt-5 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
					<label className="sr-only" htmlFor="manual-search">
						検索語
					</label>
					<input
						id="manual-search"
						name="q"
						type="search"
						defaultValue={query}
						placeholder="例：トイレ清掃、補充、OUT後"
						className="min-h-12 flex-1 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
					/>
					<button
						type="submit"
						className="min-h-12 rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						検索
					</button>
				</form>
			</header>

			<section className="flex flex-col gap-4">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-xl font-semibold">{query ? `「${query}」の検索結果` : "検索結果"}</h2>
					<span className="text-sm text-[#6b7165]">{manuals.length}件</span>
				</div>
				{manuals.length > 0 ? (
					<div className="grid gap-3">
						{manuals.map((manual) => (
							<ManualCard key={manual.id} manual={manual} />
						))}
					</div>
				) : (
					<p className="rounded-md border border-dashed border-[#c9cec1] bg-white p-4 text-sm leading-6 text-[#687061]">
						該当する公開マニュアルはありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}
