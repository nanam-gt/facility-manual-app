import { redirect } from "next/navigation";
import { DirtyForm } from "@/components/admin/dirty-form";
import { BackHomeLink, PageShell } from "@/components/public/page-shell";
import { getManualFormOptions } from "@/lib/admin/manual-queries";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type NewManualPageProps = {
	searchParams: Promise<{
		error?: string;
	}>;
};

export default async function NewManualPage({ searchParams }: NewManualPageProps) {
	const admin = await getCurrentAdmin();
	if (!admin) {
		redirect("/admin/login");
	}

	const { error } = await searchParams;
	const { areas, timings } = await getManualFormOptions();

	return (
		<PageShell>
			<BackHomeLink />
			<header className="border-b border-[#d7dbd0] pb-6">
				<p className="text-sm font-medium text-[#5b6f45]">管理画面</p>
				<h1 className="mt-2 text-3xl font-semibold leading-tight">マニュアル新規作成</h1>
				<p className="mt-3 text-sm leading-6 text-[#5f6559]">まず基本情報を登録します。保存後、そのまま手順や写真を登録できます。</p>
			</header>

			<DirtyForm action="/api/admin/manuals" method="post" className="grid gap-5 rounded-md border border-[#d9ded2] bg-white p-5">
				{error ? (
					<p className="rounded-md border border-[#d8c7a2] bg-[#fff8e8] p-3 text-sm leading-6 text-[#6f5420]">
						タイトル、エリア、タイミング、公開状態を確認してください。
					</p>
				) : null}

				<div className="grid gap-2">
					<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="title">
						タイトル
					</label>
					<input
						id="title"
						name="title"
						required
						className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						placeholder="例：宿泊棟 トイレ清掃"
					/>
				</div>

				<div className="grid gap-2">
					<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="slug">
						URL用スラッグ
					</label>
					<input
						id="slug"
						name="slug"
						className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						placeholder="例：lodging-toilet-cleaning"
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor="areaId">
						エリア
						<select
							id="areaId"
							name="areaId"
							required
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							{areas.map((area) => (
								<option key={area.id} value={area.id}>
									{area.name}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor="timingId">
						タイミング
						<select
							id="timingId"
							name="timingId"
							required
							className="min-h-12 rounded-md border border-[#c9cec1] bg-white px-4 text-base font-normal text-[#22251f] outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						>
							{timings.map((timing) => (
								<option key={timing.id} value={timing.id}>
									{timing.name}
								</option>
							))}
						</select>
					</label>
				</div>

				<div className="grid gap-2">
					<label className="text-sm font-semibold text-[#4f5d43]" htmlFor="summary">
						概要
					</label>
					<textarea
						id="summary"
						name="summary"
						rows={4}
						className="rounded-md border border-[#c9cec1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#4f7d3f] focus:ring-4 focus:ring-[#4f7d3f]/15"
						placeholder="作業の目的や概要を入力します。"
					/>
				</div>

				<label className="grid gap-2 text-sm font-semibold text-[#4f5d43]" htmlFor="status">
					公開状態
					<select
						id="status"
						name="status"
						defaultValue="draft"
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
			</DirtyForm>
		</PageShell>
	);
}
