import { notFound, redirect } from "next/navigation";
import { DirtyForm } from "@/components/admin/dirty-form";
import { ManualStepsEditor } from "@/components/admin/manual-steps-editor";
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
		saved?: string;
	}>;
};

export default async function EditManualPage({ params, searchParams }: EditManualPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const { id } = await params;
	const { error, saved } = await searchParams;
	const [manual, options] = await Promise.all([getAdminManualForEdit(id), getManualFormOptions()]);

	if (!manual) {
		notFound();
	}

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">マニュアル編集</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">基本情報、注意事項、手順を編集します。</p>
			</header>

			<DirtyForm action={`/api/admin/manuals/${manual.id}`} method="post" className="grid gap-6" encType="multipart/form-data">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<a
						href="/admin/manuals"
						data-confirm-unsaved
						className="inline-flex min-h-11 items-center rounded-md border border-[#c9cec1] bg-white px-4 text-sm font-semibold text-[#315f3a] transition hover:border-[#8aa879] focus:outline-none focus:ring-4 focus:ring-[#4f7d3f]/15"
					>
						マニュアル一覧へ戻る
					</a>
				</div>

				{error ? (
					<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
						{error === "image"
							? "写真ファイルを確認してください。JPEG、PNG、WebPのみ、1枚10MBまで登録できます。"
							: error === "save"
								? "保存に失敗しました。入力内容を確認して、もう一度保存してください。"
							: "必須項目を確認してください。"}
					</p>
				) : null}
				{saved === "created" ? (
					<p className="rounded-md border border-[#c9d9c5] bg-white p-3 text-sm font-semibold text-[#315f3a]">
						基本情報を作成しました。続けて手順や写真を登録できます。
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

				<ManualStepsEditor
					initialSteps={manual.steps.map((step) => ({
						id: step.id,
						title: step.title,
						description: step.description ?? "",
						warning: step.warning ?? "",
						completionCriteria: step.completionCriteria ?? "",
						tools: step.tools ?? "",
						durationMinutes: step.durationMinutes ?? null,
						imageObjectKey: step.imageObjectKey ?? null,
						imageAlt: step.imageAlt ?? null,
					}))}
				/>

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
