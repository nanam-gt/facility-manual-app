import { notFound, redirect } from "next/navigation";
import { DirtyForm } from "@/components/admin/dirty-form";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getAdminManualForEdit, getManualFormOptions } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditManualPageProps = {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		error?: string;
	}>;
};

export default async function EditManualPage({ params, searchParams }: EditManualPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const { error } = await searchParams;
	const [manual, options] = await Promise.all([getAdminManualForEdit(id), getManualFormOptions()]);

	if (!manual) {
		notFound();
	}

	const stepRows = [...manual.steps, ...Array.from({ length: Math.max(2, 5 - manual.steps.length) }, () => null)];

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">マニュアル編集</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">基本情報、注意事項、手順を編集します。</p>
			</header>

			<DirtyForm action={`/api/admin/manuals/${manual.id}`} method="post" className="grid gap-6" encType="multipart/form-data">
				{error ? (
					<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
						必須項目を確認してください。
					</p>
				) : null}

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">基本情報</h2>
					<TextInput label="タイトル" name="title" defaultValue={manual.title} required />
					<TextInput label="URL用スラッグ" name="slug" defaultValue={manual.slug} required />
					<div className="grid gap-4 sm:grid-cols-2">
						<SelectInput label="エリア" name="areaId" defaultValue={manual.areaId} options={options.areas} />
						<SelectInput label="タイミング" name="timingId" defaultValue={manual.timingId} options={options.timings} />
					</div>
					<TextArea label="概要" name="summary" defaultValue={manual.summary} rows={3} />
				</section>

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">作業情報</h2>
					<div className="grid gap-4 sm:grid-cols-2">
						<TextArea label="準備するもの" name="preparation" defaultValue={manual.preparation} rows={3} />
						<TextArea label="使用する道具" name="tools" defaultValue={manual.tools} rows={3} />
						<TextArea label="使用する洗剤" name="chemicals" defaultValue={manual.chemicals} rows={3} />
						<TextArea label="検索用キーワード" name="searchKeywords" defaultValue={manual.searchKeywords} rows={3} />
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<TextInput label="対象者・担当者" name="targetStaff" defaultValue={manual.targetStaff ?? ""} />
						<TextInput label="作業頻度" name="frequency" defaultValue={manual.frequency ?? ""} />
					</div>
				</section>

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">所要時間</h2>
					<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor="durationMode">
						表示方式
						<select
							id="durationMode"
							name="durationMode"
							defaultValue={manual.durationMode}
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							<option value="manual">全体時間を手入力</option>
							<option value="steps_sum">手順時間の合計</option>
							<option value="hidden">表示しない</option>
						</select>
					</label>
					<div className="grid gap-4 sm:grid-cols-3">
						<TextInput label="最短分" name="durationMinMinutes" defaultValue={manual.durationMinMinutes?.toString() ?? ""} type="number" />
						<TextInput label="最長分" name="durationMaxMinutes" defaultValue={manual.durationMaxMinutes?.toString() ?? ""} type="number" />
						<TextInput label="補足" name="durationNote" defaultValue={manual.durationNote ?? ""} />
					</div>
				</section>

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">注意・完了確認</h2>
					<TextArea label="全体の注意事項" name="generalWarning" defaultValue={manual.generalWarning} rows={3} />
					<TextArea label="完了時の確認事項" name="completionNote" defaultValue={manual.completionNote} rows={3} />
				</section>

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">手順</h2>
					<div className="grid gap-4">
						{stepRows.map((step, index) => (
							<div key={step?.id ?? `new-${index}`} className="grid gap-3 rounded-md border border-[#e3e6dc] p-4">
								<p className="text-sm font-semibold text-[#4f5d43]">手順 {index + 1}</p>
								<TextInput label="手順名" name="stepTitle" defaultValue={step?.title ?? ""} />
								<TextArea label="説明" name="stepDescription" defaultValue={step?.description ?? ""} rows={3} />
								<div className="grid gap-3 sm:grid-cols-2">
									<TextArea label="注意点" name="stepWarning" defaultValue={step?.warning ?? ""} rows={3} />
									<TextArea label="完了基準" name="stepCompletion" defaultValue={step?.completionCriteria ?? ""} rows={3} />
								</div>
								<div className="grid gap-3 sm:grid-cols-[1fr_160px]">
									<TextInput label="道具" name="stepTools" defaultValue={step?.tools ?? ""} />
									<TextInput
										label="所要分"
										name="stepDuration"
										defaultValue={step?.durationMinutes?.toString() ?? ""}
										type="number"
									/>
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
									<TextInput label="写真の説明" name="stepImageAlt" defaultValue={step?.imageAlt ?? ""} />
								</div>
								<input type="hidden" name="stepImageObjectKey" value={step?.imageObjectKey ?? ""} />
								{step?.imageObjectKey ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={`/api/public/images/${step.imageObjectKey}`}
										alt={step.imageAlt ?? ""}
										className="max-h-56 w-full rounded-md border border-[#e3e6dc] object-cover"
									/>
								) : null}
							</div>
						))}
					</div>
				</section>

				<section className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
					<h2 className="text-xl font-semibold">公開設定</h2>
					<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor="status">
						公開状態
						<select
							id="status"
							name="status"
							defaultValue={manual.status}
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							<option value="draft">下書き</option>
							<option value="published">公開</option>
							<option value="private">非公開</option>
						</select>
					</label>
					<button
						type="submit"
						className="min-h-12 rounded-md bg-[#2f5f3b] px-5 text-base font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						保存
					</button>
				</section>
			</DirtyForm>
		</PageShell>
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
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor={name}>
			{label}
			<input
				id={name}
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
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor={name}>
			{label}
			<textarea
				id={name}
				name={name}
				defaultValue={defaultValue ?? ""}
				rows={rows}
				className="rounded-md border border-[#c9cec1] bg-white px-4 py-3 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			/>
		</label>
	);
}

function SelectInput({
	label,
	name,
	defaultValue,
	options,
}: {
	label: string;
	name: string;
	defaultValue: string;
	options: Array<{ id: string; name: string }>;
}) {
	return (
		<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor={name}>
			{label}
			<select
				id={name}
				name={name}
				defaultValue={defaultValue}
				className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			>
				{options.map((option) => (
					<option key={option.id} value={option.id}>
						{option.name}
					</option>
				))}
			</select>
		</label>
	);
}
