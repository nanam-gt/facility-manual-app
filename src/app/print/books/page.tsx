import Link from "next/link";
import { formatJstDate } from "@/lib/dates/jst";
import { getPublicManualBook } from "@/lib/db/public-queries";
import { formatDuration } from "@/lib/manuals/duration";

export const dynamic = "force-dynamic";

type PrintBooksPageProps = {
	searchParams: Promise<{
		title?: string;
		areaId?: string;
		timingId?: string;
		manualId?: string | string[];
	}>;
};

export default async function PrintBooksPage({ searchParams }: PrintBooksPageProps) {
	const params = await searchParams;
	const manualIds = Array.isArray(params.manualId) ? params.manualId : params.manualId ? [params.manualId] : [];
	const book = await getPublicManualBook({
		title: params.title,
		areaId: params.areaId,
		timingId: params.timingId,
		manualIds,
	});
	const outputDate = formatJstDate();

	return (
		<main className="min-h-screen bg-white text-[#1f241d] print:min-h-0">
			<div className="mx-auto max-w-5xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
				<div className="mb-6 flex justify-between gap-4 print:hidden">
					<Link href="/admin/books" className="text-sm font-semibold text-[#315f3a] underline-offset-4 hover:underline">
						ブック印刷設定へ戻る
					</Link>
					<p className="rounded-md bg-[#edf1e9] px-4 py-2 text-sm font-semibold text-[#4f5d43]">ブラウザの印刷からPDF保存</p>
				</div>

				<section className="flex min-h-[80vh] break-after-page flex-col justify-center border-4 border-[#1f241d] p-10 text-center print:min-h-[260mm]">
					<p className="text-lg font-semibold">{book.scopeLabel}</p>
					<h1 className="mt-8 text-5xl font-bold leading-tight">{book.title}</h1>
					<div className="mt-10 grid gap-2 text-base">
						<p>マニュアル数: {book.manuals.length}件</p>
						<p>PDF出力日: {outputDate}</p>
					</div>
				</section>

				<section className="break-after-page py-8">
					<h2 className="border-b-2 border-[#1f241d] pb-3 text-2xl font-bold">目次</h2>
					{book.manuals.length > 0 ? (
						<ol className="mt-6 grid gap-3">
							{book.manuals.map((manual, index) => (
								<li key={manual.id} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#c9cec1] pb-2">
									<span>{index + 1}</span>
									<span>
										<span className="font-bold">{manual.title}</span>
										<span className="ml-2 text-sm text-[#5f6559]">
											{manual.areaName} / {manual.timingName}
										</span>
									</span>
								</li>
							))}
						</ol>
					) : (
						<p className="mt-6">条件に一致する公開マニュアルはありません。</p>
					)}
				</section>

				{book.manuals.map((manual, manualIndex) => {
					const duration = formatDuration(manual.durationMinMinutes, manual.durationMaxMinutes, manual.durationNote);

					return (
						<article key={manual.id} className="break-before-page py-8">
							<header className="border-b-2 border-[#1f241d] pb-5">
								<p className="text-sm font-semibold">
									{manualIndex + 1}. {manual.areaName} / {manual.timingName}
								</p>
								<h2 className="mt-2 text-3xl font-bold">{manual.title}</h2>
								<div className="mt-4 grid gap-1 text-sm">
									<p>最終更新日: {manual.updatedAt}</p>
									{duration ? <p>所要時間: {duration}</p> : null}
								</div>
								{manual.summary ? <p className="mt-4 leading-7">{manual.summary}</p> : null}
							</header>

							<section className="mt-6 grid gap-3">
								<PrintInfo title="使用する道具" value={manual.tools} />
								<PrintInfo title="使用する洗剤" value={manual.chemicals} />
								<PrintInfo title="対象者・頻度" value={[manual.targetStaff, manual.frequency].filter(Boolean).join(" / ")} />
								<PrintInfo title="全体の注意事項" value={manual.generalWarning} strong />
							</section>

							<section className="mt-8">
								<h3 className="border-b border-[#1f241d] pb-2 text-xl font-bold">手順</h3>
								<div className="mt-4 grid gap-5">
									{manual.steps.map((step, index) => (
										<section key={step.id} className="break-inside-avoid rounded-sm border border-[#989f90] p-4">
											<h4 className="text-lg font-bold">
												{index + 1}. {step.title}
											</h4>
											{step.description ? <p className="mt-2 leading-7">{step.description}</p> : null}
											{step.imageObjectKey ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={`/api/public/images/${step.imageObjectKey}`}
													alt={step.imageAlt ?? step.title}
													className="mt-3 max-h-72 w-full rounded-sm border border-[#989f90] object-contain"
												/>
											) : null}
											<div className="mt-3 grid gap-2 text-sm">
												{step.warning ? (
													<p>
														<strong>注意点:</strong> {step.warning}
													</p>
												) : null}
												{step.completionCriteria ? (
													<p>
														<strong>完了基準:</strong> {step.completionCriteria}
													</p>
												) : null}
												{step.tools ? (
													<p>
														<strong>道具:</strong> {step.tools}
													</p>
												) : null}
												{step.durationMinutes ? (
													<p>
														<strong>所要時間:</strong> {step.durationMinutes}分
													</p>
												) : null}
											</div>
										</section>
									))}
								</div>
							</section>

							<PrintInfo title="完了時の確認事項" value={manual.completionNote} strong className="mt-8" />
						</article>
					);
				})}
			</div>
		</main>
	);
}

function PrintInfo({
	title,
	value,
	strong = false,
	className = "",
}: {
	title: string;
	value: string | null;
	strong?: boolean;
	className?: string;
}) {
	if (!value) {
		return null;
	}

	return (
		<section className={`break-inside-avoid rounded-sm border border-[#b9c0b0] p-3 ${strong ? "bg-[#f7f3e7]" : ""} ${className}`}>
			<h3 className="font-bold">{title}</h3>
			<p className="mt-1 leading-7">{value}</p>
		</section>
	);
}
