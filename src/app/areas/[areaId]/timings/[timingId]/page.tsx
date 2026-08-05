import { notFound } from "next/navigation";
import { ManualCard } from "@/components/public/manual-card";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getPublicArea, getPublicTiming, searchPublicManuals } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

type AreaTimingPageProps = {
	params: Promise<{
		areaId: string;
		timingId: string;
	}>;
};

export default async function AreaTimingPage({ params }: AreaTimingPageProps) {
	const { areaId, timingId } = await params;
	const [area, timing, manuals] = await Promise.all([
		getPublicArea(areaId),
		getPublicTiming(timingId),
		searchPublicManuals({ areaId, timingId }),
	]);

	if (!area || !timing) {
		notFound();
	}

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">
					{area.name} / {timing.name}
				</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">該当マニュアル</h1>
				<p className="mt-3 max-w-2xl text-base leading-7 text-[#5f6559]">
					{area.name}で、{timing.name}に確認する作業手順です。
				</p>
			</header>

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
						この条件に一致する公開マニュアルはありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}
