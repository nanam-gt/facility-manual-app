import { getPublicHomeData } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
	const { areas, timings, recentManuals } = await getPublicHomeData();

	return (
		<main className="min-h-screen bg-[#f6f7f4] text-[#22251f]">
			<section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
				<header className="flex flex-col gap-4 border-b border-[#d7dbd0] pb-7">
					<p className="text-sm font-medium text-[#5b6f45]">施設管理マニュアル</p>
					<div className="flex flex-col gap-3">
						<h1 className="text-3xl font-semibold leading-tight sm:text-4xl">必要な作業手順をすぐ確認</h1>
						<p className="max-w-2xl text-base leading-7 text-[#5f6559]">
							エリア、タイミング、キーワードから施設内の清掃・補充・点検マニュアルを探せます。
						</p>
					</div>
					<form action="/search" className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
						<label className="sr-only" htmlFor="manual-search">
							マニュアル検索
						</label>
						<input
							id="manual-search"
							name="q"
							type="search"
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

				<div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
					<section className="flex flex-col gap-4">
						<div className="flex items-end justify-between gap-4">
							<h2 className="text-xl font-semibold">エリアから探す</h2>
							<span className="text-sm text-[#6b7165]">{areas.length}件</span>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{areas.map((area) => (
								<a
									key={area.id}
									href={`/areas/${area.id}`}
									className="rounded-md border border-[#d9ded2] bg-white p-4 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-sm font-medium text-[#758064]">{area.code ?? "Area"}</p>
											<h3 className="mt-1 text-lg font-semibold">{area.name}</h3>
										</div>
										<span className="rounded-md bg-[#edf1e9] px-2.5 py-1 text-sm text-[#4f5d43]">
											{area.manualCount}件
										</span>
									</div>
									{area.description ? <p className="mt-3 text-sm leading-6 text-[#687061]">{area.description}</p> : null}
								</a>
							))}
						</div>
					</section>

					<section className="flex flex-col gap-4">
						<div className="flex items-end justify-between gap-4">
							<h2 className="text-xl font-semibold">タイミング</h2>
							<span className="text-sm text-[#6b7165]">{timings.length}件</span>
						</div>
						<div className="flex flex-col gap-3">
							{timings.map((timing) => (
								<a
									key={timing.id}
									href={`/search?timingId=${timing.id}`}
									className="rounded-md border border-[#d9ded2] bg-white p-4 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
								>
									<div className="flex items-center justify-between gap-3">
										<h3 className="text-base font-semibold">{timing.name}</h3>
										<span className="text-sm text-[#687061]">{timing.manualCount}件</span>
									</div>
									{timing.description ? <p className="mt-2 text-sm leading-6 text-[#687061]">{timing.description}</p> : null}
								</a>
							))}
						</div>
					</section>
				</div>

				<section className="flex flex-col gap-4 border-t border-[#d7dbd0] pt-7">
					<h2 className="text-xl font-semibold">最近更新されたマニュアル</h2>
					{recentManuals.length > 0 ? (
						<div className="grid gap-3">
							{recentManuals.map((manual) => (
								<a key={manual.id} href={`/manuals/${manual.slug}`} className="rounded-md border border-[#d9ded2] bg-white p-4">
									<h3 className="font-semibold">{manual.title}</h3>
									<p className="mt-2 text-sm text-[#687061]">
										{manual.areaName} / {manual.timingName} / 更新日 {manual.updatedAt}
									</p>
								</a>
							))}
						</div>
					) : (
						<p className="rounded-md border border-dashed border-[#c9cec1] bg-white p-4 text-sm leading-6 text-[#687061]">
							まだ公開マニュアルはありません。管理画面の基礎を作った後、ここに公開済みマニュアルが表示されます。
						</p>
					)}
				</section>
			</section>
		</main>
	);
}
