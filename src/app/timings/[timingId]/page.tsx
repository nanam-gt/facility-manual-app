import { notFound } from "next/navigation";
import Link from "next/link";
import { ManualCard } from "@/components/public/manual-card";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getPublicTiming, listPublicManualsByTiming } from "@/lib/db/public-queries";

export const dynamic = "force-dynamic";

type TimingPageProps = {
	params: Promise<{
		timingId: string;
	}>;
};

export default async function TimingPage({ params }: TimingPageProps) {
	const { timingId } = await params;
	const [timing, manuals] = await Promise.all([getPublicTiming(timingId), listPublicManualsByTiming(timingId)]);

	if (!timing) {
		notFound();
	}

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">タイミング</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">{timing.name}</h1>
				{timing.description ? <p className="mt-3 max-w-2xl text-base leading-7 text-[#5f6559]">{timing.description}</p> : null}
			</header>

			<section className="flex flex-col gap-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex items-end gap-3">
						<h2 className="text-xl font-semibold">公開マニュアル</h2>
						<span className="text-sm text-[#6b7165]">{manuals.length}件</span>
					</div>
					{manuals.length > 0 ? (
						<Link
							href={`/print/checklists/timings/${timing.id}`}
							className="inline-flex min-h-11 w-fit items-center rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							チェックリスト印刷
						</Link>
					) : null}
				</div>
				{manuals.length > 0 ? (
					<div className="grid gap-3">
						{manuals.map((manual) => (
							<ManualCard key={manual.id} manual={manual} />
						))}
					</div>
				) : (
					<p className="rounded-md border border-dashed border-[#c9cec1] bg-white p-4 text-sm leading-6 text-[#687061]">
						このタイミングには、まだ公開マニュアルがありません。
					</p>
				)}
			</section>
		</PageShell>
	);
}
