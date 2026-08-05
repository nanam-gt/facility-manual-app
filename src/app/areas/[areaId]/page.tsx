import { notFound } from "next/navigation";
import Link from "next/link";
import { ManualCard } from "@/components/public/manual-card";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getPublicArea, listPublicManualsByArea, listPublicTimingSummariesByArea } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

type AreaPageProps = {
	params: Promise<{
		areaId: string;
	}>;
};

export default async function AreaPage({ params }: AreaPageProps) {
	const { areaId } = await params;
	const [area, timings, manuals] = await Promise.all([
		getPublicArea(areaId),
		listPublicTimingSummariesByArea(areaId),
		listPublicManualsByArea(areaId),
	]);

	if (!area) {
		notFound();
	}

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">{area.code ?? "Area"}</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">{area.name}</h1>
				{area.description ? <p className="mt-3 max-w-2xl text-base leading-7 text-[#5f6559]">{area.description}</p> : null}
			</header>

			<section className="flex flex-col gap-4">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-xl font-semibold">タイミング別</h2>
					<span className="text-sm text-[#6b7165]">{timings.length}件</span>
				</div>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{timings.map((timing) => (
						<Link
							key={timing.id}
							href={`/areas/${area.id}/timings/${timing.id}`}
							className="rounded-md border border-[#d9ded2] bg-white p-4 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							<div className="flex items-center justify-between gap-3">
								<h3 className="font-semibold">{timing.name}</h3>
								<span className="text-sm text-[#687061]">{timing.manualCount}件</span>
							</div>
							{timing.description ? <p className="mt-2 text-sm leading-6 text-[#687061]">{timing.description}</p> : null}
						</Link>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-4">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-xl font-semibold">公開マニュアル</h2>
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
						このエリアには、まだ公開マニュアルがありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}
