import { redirect } from "next/navigation";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { listAdminTimings } from "@/lib/admin/taxonomy-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminTimingsPage() {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const timings = await listAdminTimings();

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">タイミング管理</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">OUT後、IN前、随時などの分類を管理します。</p>
			</header>

			<section className="grid gap-4">
				<TimingForm />
				<div className="grid gap-3">
					{timings.map((timing) => (
						<TimingForm key={timing.id} timing={timing} />
					))}
				</div>
			</section>
		</PageShell>
	);
}

type TimingFormProps = {
	timing?: {
		id: string;
		name: string;
		description: string | null;
		displayOrder: number;
		isActive: boolean;
		manualCount: number;
	};
};

function TimingForm({ timing }: TimingFormProps) {
	return (
		<form action="/api/admin/timings" method="post" className="grid gap-4 rounded-md border border-[#d9ded2] bg-white p-4">
			<input type="hidden" name="id" value={timing?.id ?? ""} />
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-lg font-semibold">{timing ? timing.name : "新しいタイミング"}</h2>
				{timing ? <span className="text-sm text-[#687061]">使用中マニュアル {timing.manualCount}件</span> : null}
			</div>
			<div className="grid gap-3 sm:grid-cols-[1fr_120px]">
				<TextInput label="名称" name="name" defaultValue={timing?.name ?? ""} required />
				<TextInput label="表示順" name="displayOrder" defaultValue={timing?.displayOrder.toString() ?? "0"} type="number" />
			</div>
			<TextInput label="説明" name="description" defaultValue={timing?.description ?? ""} />
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<label className="flex items-center gap-2 text-sm font-semibold text-[#4f5d43]">
					<input name="isActive" type="checkbox" defaultChecked={timing?.isActive ?? true} className="size-4" />
					有効
				</label>
				<button
					type="submit"
					className="min-h-11 rounded-md bg-[#2f5f3b] px-4 text-sm font-semibold text-white transition hover:bg-[#244b2e] focus:outline-none focus:ring-4 focus:ring-[#2f5f3b]/25"
				>
					{timing ? "更新" : "追加"}
				</button>
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
