import Link from "next/link";
import type { PublicManualListItem } from "@/lib/db/public-queries";
import { formatDuration } from "@/lib/manuals/duration";

type ManualCardProps = {
	manual: PublicManualListItem;
};

export function ManualCard({ manual }: ManualCardProps) {
	const duration = formatDuration(manual.durationMinMinutes, manual.durationMaxMinutes, manual.durationNote);

	return (
		<Link
			href={`/manuals/${manual.slug}`}
			className="block rounded-md border border-[#d9ded2] bg-white p-4 transition hover:border-[#8aa879] hover:shadow-sm focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<p className="text-sm text-[#687061]">
						{manual.areaName} / {manual.timingName}
					</p>
					<h3 className="mt-1 text-lg font-semibold text-[#22251f]">{manual.title}</h3>
				</div>
				{duration ? (
					<span className="w-fit rounded-md bg-[#edf1e9] px-2.5 py-1 text-sm text-[#4f5d43]">{duration}</span>
				) : null}
			</div>
			{manual.summary ? <p className="mt-3 text-sm leading-6 text-[#687061]">{manual.summary}</p> : null}
			<p className="mt-3 text-xs text-[#7c8374]">更新日 {manual.updatedAt}</p>
		</Link>
	);
}
