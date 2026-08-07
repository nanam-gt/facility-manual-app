"use client";

import { useEffect, useState } from "react";

type DirtyFormProps = {
	action: string;
	method?: "get" | "post";
	encType?: string;
	className?: string;
	children: React.ReactNode;
};

export function DirtyForm({ action, method = "post", encType, className, children }: DirtyFormProps) {
	const [dirty, setDirty] = useState(false);

	useEffect(() => {
		document.body.dataset.formDirty = dirty ? "true" : "false";

		if (!dirty) {
			return;
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.body.dataset.formDirty = "false";
		};
	}, [dirty]);

	return (
		<form
			action={action}
			method={method}
			encType={encType}
			className={className}
			onChangeCapture={() => setDirty(true)}
			onInputCapture={() => setDirty(true)}
			onClickCapture={(event) => {
				const target = event.target as HTMLElement;
				const leaveTarget = target.closest("[data-confirm-unsaved]");
				if (leaveTarget && dirty && !window.confirm("保存していない変更があります。保存せずに戻りますか？")) {
					event.preventDefault();
				}
			}}
			onSubmit={() => setDirty(false)}
		>
			{children}
		</form>
	);
}
