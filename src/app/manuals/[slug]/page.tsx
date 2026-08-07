import { notFound } from "next/navigation";
import Link from "next/link";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getPublicManualBySlug } from "@/lib/db/public-queries";
import { formatDuration } from "@/lib/manuals/duration";

export const dynamic = "force-dynamic";

type ManualPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function ManualPage({ params }: ManualPageProps) {
	const { slug } = await params;
	const manual = await getPublicManualBySlug(slug);

	if (!manual) {
		notFound();
	}

	const duration = formatDuration(manual.durationMinMinutes, manual.durationMaxMinutes, manual.durationNote);

	return (
		<PageShell>
			<BackHomeLink />
			<article className="flex flex-col gap-7">
				<header className="border-b border-[#d7dbd0] pb-6">
					<p className="text-sm font-medium text-[#5b6f45]">
						{manual.areaName} / {manual.timingName}
					</p>
					<h1 className="mt-2 text-3xl font-semibold leading-tight">{manual.title}</h1>
					{manual.summary ? <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6559]">{manual.summary}</p> : null}
					<div className="mt-5 flex flex-wrap gap-2 text-sm text-[#4f5d43]">
						{duration ? <span className="rounded-md bg-[#edf1e9] px-2.5 py-1">所要時間 {duration}</span> : null}
						<span className="rounded-md bg-[#edf1e9] px-2.5 py-1">更新日 {manual.updatedAt}</span>
						<Link
							href={`/print/manuals/${manual.slug}`}
							className="rounded-md border border-[#c9cec1] bg-white px-2.5 py-1 font-semibold text-[#315f3a] hover:border-[#8aa879]"
						>
							印刷
						</Link>
					</div>
				</header>

				<section className="grid gap-3 sm:grid-cols-2">
					<InfoBlock title="使用する道具" value={manual.tools} />
					<InfoBlock title="使用する洗剤" value={manual.chemicals} />
					<InfoBlock title="対象者・頻度" value={[manual.targetStaff, manual.frequency].filter(Boolean).join(" / ")} />
				</section>

				{manual.generalWarning ? (
					<section className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-4">
						<h2 className="font-semibold text-[#6f5420]">全体の注意事項</h2>
						<p className="mt-2 text-sm leading-6 text-[#6f5420]">{manual.generalWarning}</p>
					</section>
				) : null}

				<section className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">手順</h2>
					<div className="grid gap-4">
						{manual.steps.map((step, index) => (
							<section key={step.id} className="rounded-md border border-[#d9ded2] bg-white p-4">
								<div className="flex items-start gap-3">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#2f5f3b] text-sm font-semibold text-white">
										{index + 1}
									</span>
									<div className="min-w-0 flex-1">
										<h3 className="text-lg font-semibold">{step.title}</h3>
										{step.description ? <p className="mt-2 text-sm leading-6 text-[#5f6559]">{step.description}</p> : null}
										{step.imageObjectKey ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={`/api/public/images/${step.imageObjectKey}`}
												alt={step.imageAlt ?? step.title}
												className="mt-3 max-h-96 w-full rounded-md border border-[#e3e6dc] object-cover"
											/>
										) : null}
										<div className="mt-3 grid gap-2">
											{step.warning ? <StepNote label="注意点" value={step.warning} tone="warning" /> : null}
											{step.completionCriteria ? <StepNote label="完了基準" value={step.completionCriteria} /> : null}
											{step.tools ? <StepNote label="道具" value={step.tools} /> : null}
										</div>
									</div>
								</div>
							</section>
						))}
					</div>
				</section>

				{manual.completionNote ? (
					<section className="rounded-md border border-[#c9d9c5] bg-white p-4">
						<h2 className="font-semibold">完了時の確認事項</h2>
						<p className="mt-2 text-sm leading-6 text-[#5f6559]">{manual.completionNote}</p>
					</section>
				) : null}
			</article>
		</PageShell>
	);
}

function InfoBlock({ title, value }: { title: string; value: string | null }) {
	if (!value) {
		return null;
	}

	return (
		<section className="rounded-md border border-[#d9ded2] bg-white p-4">
			<h2 className="text-sm font-semibold text-[#4f5d43]">{title}</h2>
			<p className="mt-2 text-sm leading-6 text-[#5f6559]">{value}</p>
		</section>
	);
}

function StepNote({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: string;
	tone?: "default" | "warning";
}) {
	const className =
		tone === "warning"
			? "rounded-md bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]"
			: "rounded-md bg-[#f3f5f0] p-3 text-sm leading-6 text-[#5f6559]";

	return (
		<p className={className}>
			<span className="font-semibold">{label}: </span>
			{value}
		</p>
	);
}
