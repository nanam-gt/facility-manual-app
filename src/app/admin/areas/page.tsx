import { redirect } from "next/navigation";
import { DeleteTaxonomyButton } from "@/components/admin/delete-taxonomy-button";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { listAdminAreas } from "@/lib/admin/taxonomy-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const savedMessages: Record<string, string> = {
	deleted: "エリアを削除しました。",
	in_use: "使用中のマニュアルがあるため削除できません。有効チェックを外すと一覧には出なくなります。",
	not_found: "対象のエリアが見つかりませんでした。",
};

type AdminAreasPageProps = {
	searchParams: Promise<{
		saved?: string;
		error?: string;
	}>;
};

export default async function AdminAreasPage({ searchParams }: AdminAreasPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const params = await searchParams;
	const areas = await listAdminAreas();

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">エリア管理</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">エリア名、表示順、有効状態を管理します。</p>
			</header>

			{params.saved && savedMessages[params.saved] ? (
				<p className="rounded-md border border-[#c9d9c5] bg-white p-3 text-sm font-semibold text-[#315f3a]">
					{savedMessages[params.saved]}
				</p>
			) : null}
			{params.error ? (
				<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
					名称を確認してください。
				</p>
			) : null}

			<section className="grid gap-4">
				<AreaForm />
				<div className="grid gap-3">
					{areas.map((area) => (
						<AreaForm key={area.id} area={area} />
					))}
				</div>
			</section>
		</PageShell>
	);
}

type AreaFormProps = {
	area?: {
		id: string;
		code: string | null;
		name: string;
		shortName: string | null;
		description: string | null;
		colorKey: string | null;
		displayOrder: number;
		isActive: boolean;
		manualCount: number;
	};
};

function AreaForm({ area }: AreaFormProps) {
	return (
		<form action="/api/admin/areas" method="post" className="grid gap-4 rounded-md border border-[#d9ded2] bg-white p-4">
			<input type="hidden" name="id" value={area?.id ?? ""} />
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{area ? area.name : "新しいエリア"}</h2>
				{area ? <span className="text-sm text-[#687061]">使用中マニュアル {area.manualCount}件</span> : null}
			</div>
			<div className="grid gap-3 sm:grid-cols-[120px_1fr_1fr_120px]">
				<TextInput label="コード" name="code" defaultValue={area?.code ?? ""} />
				<TextInput label="名称" name="name" defaultValue={area?.name ?? ""} required />
				<TextInput label="短縮名" name="shortName" defaultValue={area?.shortName ?? ""} />
				<TextInput label="表示順" name="displayOrder" defaultValue={area?.displayOrder.toString() ?? "0"} type="number" />
			</div>
			<div className="grid gap-3 sm:grid-cols-[1fr_160px]">
				<TextInput label="説明" name="description" defaultValue={area?.description ?? ""} />
				<TextInput label="色キー" name="colorKey" defaultValue={area?.colorKey ?? ""} />
			</div>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<label className="flex items-center gap-2 text-sm font-semibold text-[#4f5d43]">
					<input name="isActive" type="checkbox" defaultChecked={area?.isActive ?? true} className="size-4" />
					有効
				</label>
				<div className="flex flex-wrap gap-2">
					{area ? (
						<DeleteTaxonomyButton
							action={`/api/admin/areas/${area.id}/delete`}
							label="削除"
							name={area.name}
							disabled={area.manualCount > 0}
						/>
					) : null}
					<button
						type="submit"
						className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
					>
						{area ? "更新" : "追加"}
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
