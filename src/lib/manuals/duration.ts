export function formatDuration(
	minMinutes: number | null,
	maxMinutes: number | null,
	note: string | null,
): string | null {
	if (minMinutes === null && maxMinutes === null && !note) {
		return null;
	}

	const range =
		minMinutes !== null && maxMinutes !== null && minMinutes !== maxMinutes
			? `${minMinutes}〜${maxMinutes}分`
			: `${minMinutes ?? maxMinutes}分`;

	return note ? `${range}（${note}）` : range;
}
