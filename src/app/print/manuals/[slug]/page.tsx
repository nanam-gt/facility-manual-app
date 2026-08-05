import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicManualBySlug } from "@/lib/db/public-queries";
import { formatDuration } from "@/lib/manuals/duration";

export const dynamic = "force-dynamic";

type PrintManualPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function PrintManualPage({ params }: PrintManualPageProps) {
	const { slug } = await params;
	const manual = await getPublicManualBySlug(slug);

	if (!manual) {
		notFound();
	}

	const duration = formatDuration(manual.durationMinMinutes, manual.durationMaxMinutes, manual.durationNote);
	const outputDate = new Date().toISOString().slice(0, 10);

	return (
		<main className="min-h-screen bg-white text-[#1f241d] print:min-h-0">
			<div className="mx-auto max-w-4xl px-6 py-8 print:max-w-none print:px-0 print:py-0">
				<div className="mb-6 flex justify-between gap-4 print:hidden">
					<Link href={`/manuals/${manual.slug}`} className="text-sm font-semibold text-[#315f3a] underline-offset-4 hover:underline">
						通常表示へ戻る
					</Link>
					<p className="rounded-md bg-[#edf1e9] px-4 py-2 text-sm font-semibold text-[#4f5d43]">ブラウザの印刷からPDF保存</p>
				</div>

				<article className="print-manual">
					<header className="border-b-2 border-[#1f241d] pb-5">
						<p className="text-sm font-semibold">
							{manual.areaName} / {manual.timingName}
						</p>
						<h1 className="mt-2 text-3xl font-bold">{manual.title}</h1>
						<div className="mt-4 grid gap-1 text-sm">
							<p>最終更新日: {manual.updatedAt}</p>
							<p>PDF出力日: {outputDate}</p>
							{duration ? <p>所要時間: {duration}</p> : null}
						</div>
						{manual.summary ? <p className="mt-4 leading-7">{manual.summary}</p> : null}
					</header>

					<section className="mt-6 grid gap-3">
						<PrintInfo title="準備するもの" value={manual.preparation} />
						<PrintInfo title="使用する道具" value={manual.tools} />
						<PrintInfo title="使用する洗剤" value={manual.chemicals} />
						<PrintInfo title="対象者・頻度" value={[manual.targetStaff, manual.frequency].filter(Boolean).join(" / ")} />
						<PrintInfo title="全体の注意事項" value={manual.generalWarning} strong />
					</section>

					<section className="mt-8">
						<h2 className="border-b border-[#1f241d] pb-2 text-xl font-bold">手順</h2>
						<div className="mt-4 grid gap-5">
							{manual.steps.map((step, index) => (
								<section key={step.id} className="break-inside-avoid rounded-sm border border-[#989f90] p-4">
									<h3 className="text-lg font-bold">
										{index + 1}. {step.title}
									</h3>
									{step.description ? <p className="mt-2 leading-7">{step.description}</p> : null}
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
			<h2 className="font-bold">{title}</h2>
			<p className="mt-1 leading-7">{value}</p>
		</section>
	);
}
