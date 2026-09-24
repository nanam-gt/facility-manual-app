import { notFound } from "next/navigation";
import Link from "next/link";
import { formatJstDate } from "@/lib/dates/jst";
import { getPublicManualBook, getPublicTiming } from "@/lib/db/public-queries";
import { formatDuration } from "@/lib/manuals/duration";

export const dynamic = "force-dynamic";

type PrintTimingChecklistPageProps = {
	params: Promise<{
		timingId: string;
	}>;
};

export default async function PrintTimingChecklistPage({ params }: PrintTimingChecklistPageProps) {
	const { timingId } = await params;
	const [timing, book] = await Promise.all([
		getPublicTiming(timingId),
		getPublicManualBook({
			timingId,
			title: "作業チェックリスト",
		}),
	]);

	if (!timing) {
		notFound();
	}

	const manualsByArea = groupByArea(book.manuals);
	const outputDate = formatJstDate();

	return (
		<main className="min-h-screen bg-white text-[#1f241d] print:min-h-0">
			<div className="mx-auto max-w-5xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
				<div className="mb-6 flex justify-between gap-4 print:hidden">
					<Link href={`/timings/${timing.id}`} className="text-sm font-semibold text-[#315f3a] underline-offset-4 hover:underline">
						{timing.name}へ戻る
					</Link>
					<p className="rounded-md bg-[#edf1e9] px-4 py-2 text-sm font-semibold text-[#4f5d43]">ブラウザの印刷からPDF保存</p>
				</div>

				<header className="border-b-2 border-[#1f241d] pb-5">
					<p className="text-sm font-semibold">いちばん星ビレッジ</p>
					<h1 className="mt-2 text-3xl font-bold">{timing.name} 作業チェックリスト</h1>
					<div className="mt-4 grid gap-1 text-sm sm:grid-cols-3">
						<p>出力日: {outputDate}</p>
						<p>マニュアル数: {book.manuals.length}件</p>
						<p>完了者: ____________________</p>
					</div>
				</header>

				{book.manuals.length > 0 ? (
					<div className="mt-6 grid gap-7">
						{manualsByArea.map((area) => (
							<section key={area.name} className="break-inside-avoid">
								<h2 className="border-b border-[#1f241d] pb-2 text-xl font-bold">{area.name}</h2>
								<div className="mt-3 grid gap-4">
									{area.manuals.map((manual, manualIndex) => {
										const duration = formatDuration(manual.durationMinMinutes, manual.durationMaxMinutes, manual.durationNote);

										return (
											<article key={manual.id} className="break-inside-avoid rounded-sm border border-[#989f90] p-4">
												<div className="mb-2 grid grid-cols-[3.75rem_1fr] items-end gap-3">
													<CheckHeader />
													<p className="text-xs font-semibold text-[#5f6559]">マニュアル・手順</p>
												</div>
												<div className="grid grid-cols-[3.75rem_1fr] items-start gap-3">
													<CheckBoxes />
													<div className="min-w-0 flex-1">
														<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
															<h3 className="text-lg font-bold">
																{manualIndex + 1}. {manual.title}
															</h3>
															{duration ? <p className="text-sm font-semibold">{duration}</p> : null}
														</div>
														<div className="mt-1 grid gap-0.5">
															<Link href={`/manuals/${manual.slug}`} className="block text-xs font-semibold text-[#315f3a] underline-offset-4 hover:underline">
																詳細ページ: /manuals/{manual.slug}
															</Link>
															<Link href={`/admin/manuals/${manual.id}/edit`} className="block text-[10px] font-normal text-[#5f6559] underline-offset-4 hover:underline">
																管理ページ: /admin/manuals/{manual.id}/edit
															</Link>
														</div>
														{manual.steps.length > 0 ? (
															<ol className="mt-3 grid gap-2">
																{manual.steps.map((step, stepIndex) => (
																	<li key={step.id} className="grid grid-cols-[3.75rem_1fr_auto] items-start gap-2 text-sm">
																		<CheckBoxes small />
																		<span>
																			{stepIndex + 1}. {step.title}
																		</span>
																		{step.durationMinutes ? <span>{step.durationMinutes}分</span> : null}
																	</li>
																))}
															</ol>
														) : (
															<p className="mt-3 text-sm text-[#5f6559]">登録済み手順はありません。</p>
														)}
														<div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
															<p>完了時刻: ______ : ______</p>
															<p>メモ: ______________________________</p>
														</div>
													</div>
												</div>
											</article>
										);
									})}
								</div>
							</section>
						))}
					</div>
				) : (
					<p className="mt-6 rounded-sm border border-[#989f90] p-4">このタイミングには、まだ公開マニュアルがありません。</p>
				)}
			</div>
		</main>
	);
}

function groupByArea(manuals: Awaited<ReturnType<typeof getPublicManualBook>>["manuals"]) {
	const groups: Array<{
		name: string;
		manuals: typeof manuals;
	}> = [];

	for (const manual of manuals) {
		const lastGroup = groups.at(-1);
		if (lastGroup?.name === manual.areaName) {
			lastGroup.manuals.push(manual);
		} else {
			groups.push({
				name: manual.areaName,
				manuals: [manual],
			});
		}
	}

	return groups;
}

function CheckHeader() {
	return (
		<div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold leading-none">
			<span>作業</span>
			<span>管理</span>
		</div>
	);
}

function CheckBoxes({ small = false }: { small?: boolean }) {
	const boxClassName = small ? "inline-block size-4 border border-[#1f241d]" : "inline-block size-5 border-2 border-[#1f241d]";

	return (
		<div className="grid grid-cols-2 gap-2 text-center">
			<span className="grid justify-items-center">
				<span className={boxClassName} aria-hidden="true" />
			</span>
			<span className="grid justify-items-center">
				<span className={boxClassName} aria-hidden="true" />
			</span>
		</div>
	);
}
