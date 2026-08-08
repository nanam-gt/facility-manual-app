"use client";

import { useState } from "react";

export type ManualStepEditorValue = {
	id: string;
	title: string;
	description: string;
	warning: string;
	completionCriteria: string;
	tools: string;
	durationMinutes: number | null;
	imageObjectKey: string | null;
	imageAlt: string | null;
};

type ManualStepsEditorProps = {
	initialSteps: ManualStepEditorValue[];
};

function emptyStep(): ManualStepEditorValue {
	return {
		id: `new-${crypto.randomUUID()}`,
		title: "",
		description: "",
		warning: "",
		completionCriteria: "",
		tools: "",
		durationMinutes: null,
		imageObjectKey: null,
		imageAlt: null,
	};
}

export function ManualStepsEditor({ initialSteps }: ManualStepsEditorProps) {
	const [steps, setSteps] = useState<ManualStepEditorValue[]>(initialSteps.length > 0 ? initialSteps : [emptyStep()]);
	const markDirty = () => document.dispatchEvent(new Event("manual-form-dirty"));
	const insertStepAfter = (index: number) => {
		markDirty();
		setSteps((current) => {
			const next = [...current];
			next.splice(index + 1, 0, emptyStep());
			return next;
		});
	};
	const moveStep = (index: number, direction: -1 | 1) => {
		markDirty();
		setSteps((current) => {
			const targetIndex = index + direction;
			if (targetIndex < 0 || targetIndex >= current.length) {
				return current;
			}

			const next = [...current];
			const [step] = next.splice(index, 1);
			next.splice(targetIndex, 0, step);
			return next;
		});
	};

	return (
		<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-xl font-semibold">手順</h2>
				<button
					type="button"
					onClick={() => {
						markDirty();
						setSteps((current) => [...current, emptyStep()]);
					}}
					className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
				>
					+ 手順を追加
				</button>
			</div>
			<div className="grid gap-4">
				{steps.map((step, index) => (
					<div key={step.id} className="grid gap-3 rounded-md border border-[#e3e6dc] p-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm font-semibold text-[#4f5d43]">手順 {index + 1}</p>
							<div className="flex flex-wrap gap-2">
								<button
									type="button"
									onClick={() => moveStep(index, -1)}
									disabled={index === 0}
									className="inline-flex min-h-9 items-center gap-1 rounded-md border border-[#c9cec1] px-3 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15 disabled:cursor-not-allowed disabled:opacity-45"
									aria-label={`手順${index + 1}を上へ移動`}
									title="上へ移動"
								>
									<ArrowUpIcon />
									<span>上へ</span>
								</button>
								<button
									type="button"
									onClick={() => moveStep(index, 1)}
									disabled={index === steps.length - 1}
									className="inline-flex min-h-9 items-center gap-1 rounded-md border border-[#c9cec1] px-3 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15 disabled:cursor-not-allowed disabled:opacity-45"
									aria-label={`手順${index + 1}を下へ移動`}
									title="下へ移動"
								>
									<ArrowDownIcon />
									<span>下へ</span>
								</button>
								<button
									type="button"
									onClick={() => {
										markDirty();
										setSteps((current) =>
											current.length <= 1 ? [emptyStep()] : current.filter((_, stepIndex) => stepIndex !== index),
										);
									}}
									className="inline-flex min-h-9 items-center gap-2 rounded-md border border-[#d8c7a2] px-3 text-sm font-semibold text-[#6f5420] transition hover:border-[#b9914b] focus:outline-none focus:ring-4 focus:ring-[#b9914b]/15"
									aria-label={`手順${index + 1}を削除`}
									title="手順を削除"
								>
									<TrashIcon />
									<span>削除</span>
								</button>
							</div>
						</div>
						<TextInput label="手順名" name="stepTitle" defaultValue={step.title} />
						<TextArea label="説明" name="stepDescription" defaultValue={step.description} rows={3} />
						<div className="grid gap-3 sm:grid-cols-2">
							<TextArea label="注意点" name="stepWarning" defaultValue={step.warning} rows={3} />
							<TextArea label="完了基準" name="stepCompletion" defaultValue={step.completionCriteria} rows={3} />
						</div>
						<div className="grid gap-3 sm:grid-cols-[1fr_160px]">
							<TextInput label="道具" name="stepTools" defaultValue={step.tools} />
							<TextInput label="所要分" name="stepDuration" defaultValue={step.durationMinutes?.toString() ?? ""} type="number" />
						</div>
						<div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
							<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]">
								写真
								<input
									name="stepImage"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-3 py-2 text-sm font-normal text-[#22251f] file:mr-3 file:rounded-md file:border-0 file:bg-[#edf1e9] file:px-3 file:py-2 file:font-semibold file:text-[#315f3a]"
								/>
							</label>
							<TextInput label="写真の説明" name="stepImageAlt" defaultValue={step.imageAlt ?? ""} />
						</div>
						<input type="hidden" name="stepImageObjectKey" value={step.imageObjectKey ?? ""} />
						{step.imageObjectKey ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={`/api/public/images/${step.imageObjectKey}`}
								alt={step.imageAlt ?? ""}
								className="max-h-56 w-full rounded-md border border-[#e3e6dc] object-cover"
							/>
						) : null}
						<button
							type="button"
							onClick={() => insertStepAfter(index)}
							className="min-h-10 rounded-md border border-dashed border-[#b9c5b0] bg-[#f8faf6] px-3 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							+ この下に手順を追加
						</button>
					</div>
				))}
			</div>
		</section>
	);
}

function ArrowUpIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 19V5" />
			<path d="m5 12 7-7 7 7" />
		</svg>
	);
}

function ArrowDownIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 5v14" />
			<path d="m19 12-7 7-7-7" />
		</svg>
	);
}

function TrashIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M4 7h16" />
			<path d="M10 11v6" />
			<path d="M14 11v6" />
			<path d="M6 7l1 14h10l1-14" />
			<path d="M9 7V4h6v3" />
		</svg>
	);
}

function TextInput({
	label,
	name,
	defaultValue,
	required = false,
	type = "text",
}: {
	label: string;
	name: string;
	defaultValue: string;
	required?: boolean;
	type?: string;
}) {
	return (
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]">
			{label}
			<input
				name={name}
				type={type}
				defaultValue={defaultValue}
				required={required}
				min={type === "number" ? 0 : undefined}
				className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			/>
		</label>
	);
}

function TextArea({
	label,
	name,
	defaultValue,
	rows,
}: {
	label: string;
	name: string;
	defaultValue: string | null;
	rows: number;
}) {
	return (
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]">
			{label}
			<textarea
				name={name}
				defaultValue={defaultValue ?? ""}
				rows={rows}
				className="rounded-md border border-[#c9cec1] bg-white px-4 py-3 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			/>
		</label>
	);
}
