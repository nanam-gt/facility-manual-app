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
			onSubmit={() => setDirty(false)}
		>
			{children}
		</form>
	);
}
