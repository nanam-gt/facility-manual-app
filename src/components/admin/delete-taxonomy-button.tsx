"use client";

type DeleteTaxonomyButtonProps = {
	action: string;
	label: string;
	name: string;
	disabled?: boolean;
};

export function DeleteTaxonomyButton({ action, label, name, disabled = false }: DeleteTaxonomyButtonProps) {
	return (
		<button
			type="submit"
			formAction={action}
			formMethod="post"
			disabled={disabled}
			onClick={(event) => {
				if (!window.confirm(`「${name}」を削除しますか？`)) {
					event.preventDefault();
				}
			}}
			className="min-h-11 rounded-md border border-[#d8c7a2] px-4 text-sm font-semibold text-[#6f5420] hover:border-[#b9914b] disabled:cursor-not-allowed disabled:opacity-50"
		>
			{label}
		</button>
	);
}
