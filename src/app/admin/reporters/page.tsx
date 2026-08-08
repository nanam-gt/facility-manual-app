import { redirect } from "next/navigation";
import { DeleteTaxonomyButton } from "@/components/admin/delete-taxonomy-button";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { listAdminCompletionReporters } from "@/lib/db/completion-reports";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const savedMessages: Record<string, string> = {
	deleted: "報告者を削除しました。",
	not_found: "対象の報告者が見つかりませんでした。",
};

type AdminReportersPageProps = {
	searchParams: Promise<{
		saved?: string;
		error?: string;
	}>;
};

export default async function AdminReportersPage({ searchParams }: AdminReportersPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const params = await searchParams;
	const reporters = await listAdminCompletionReporters();

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">完了報告者管理</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">完了報告の名前プルダウンに表示する名前を管理します。</p>
			</header>

			{params.saved && savedMessages[params.saved] ? (
				<p className="rounded-md border border-[#c9d9c5] bg-white p-3 text-sm font-semibold text-[#315f3a]">
					{savedMessages[params.saved]}
				</p>
			) : null}
			{params.error ? (
				<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
					名前を確認してください。
				</p>
			) : null}

			<section className="grid gap-4">
				<ReporterForm />
				<div className="grid gap-3">
					{reporters.map((reporter) => (
						<ReporterForm key={reporter.id} reporter={reporter} />
					))}
				</div>
			</section>
		</PageShell>
	);
}

type ReporterFormProps = {
	reporter?: {
		id: string;
		name: string;
		email: string | null;
		displayOrder: number;
		isActive: boolean;
		reportCount: number;
	};
};

function ReporterForm({ reporter }: ReporterFormProps) {
	return (
		<form action="/api/admin/reporters" method="post" className="grid gap-4 rounded-md border border-[#d9ded2] bg-white p-4">
			<input type="hidden" name="id" value={reporter?.id ?? ""} />
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{reporter ? reporter.name : "新しい報告者"}</h2>
				{reporter ? <span className="text-sm text-[#687061]">報告履歴 {reporter.reportCount}件</span> : null}
			</div>
			<div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
				<TextInput label="名前" name="name" defaultValue={reporter?.name ?? ""} required />
				<TextInput label="メール" name="email" defaultValue={reporter?.email ?? ""} type="email" />
				<TextInput label="表示順" name="displayOrder" defaultValue={reporter?.displayOrder.toString() ?? "0"} type="number" />
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<label className="flex items-center gap-2 text-sm font-semibold text-[#4f5d43]">
					<input name="isActive" type="checkbox" defaultChecked={reporter?.isActive ?? true} className="size-4" />
					有効
				</label>
				<div className="flex flex-wrap gap-2">
					{reporter ? (
						<DeleteTaxonomyButton action={`/api/admin/reporters/${reporter.id}/delete`} label="削除" name={reporter.name} />
					) : null}
					<button
						type="submit"
						className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						{reporter ? "更新" : "追加"}
					</button>
				</div>
			</div>
		</form>
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
				className="min-h-11 rounded-md border border-[#c9cec1] bg-white px-3 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
			/>
		</label>
	);
}
