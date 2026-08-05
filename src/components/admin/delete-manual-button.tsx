"use client";

type DeleteManualButtonProps = {
	manualId: string;
	title: string;
};

export function DeleteManualButton({ manualId, title }: DeleteManualButtonProps) {
	return (
		<form
			action={`/api/admin/manuals/${manualId}/delete`}
			method="post"
			onSubmit={(event) => {
				if (!window.confirm(`「${title}」を削除しますか？`)) {
					event.preventDefault();
				}
			}}
		>
			<button
				type="submit"
				className="rounded-md border border-[#d8c7a2] px-2.5 py-1 text-sm font-semibold text-[#6f5420] hover:border-[#b9914b]"
			>
				削除
			</button>
		</form>
	);
}
