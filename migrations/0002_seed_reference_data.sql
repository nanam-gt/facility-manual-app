INSERT INTO areas (
	id,
	code,
	name,
	short_name,
	description,
	color_key,
	display_order,
	is_active,
	created_at,
	updated_at
) VALUES
	('area_common', '00', '共通', '共通', '施設全体で共通する作業', 'neutral', 0, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('area_restaurant', '01', 'レストラン棟', 'レストラン', 'レストラン棟の清掃・準備・点検', 'green', 10, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('area_lodging', '02', '宿泊棟', '宿泊', '宿泊棟の清掃・準備・点検', 'blue', 20, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('area_bath', '03', '風呂棟', '風呂', '風呂棟の清掃・補充・点検', 'teal', 30, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('area_outdoor', '04', '建物外', '屋外', '建物外まわりの清掃・点検', 'amber', 40, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z')
ON CONFLICT(id) DO NOTHING;

INSERT INTO timings (
	id,
	name,
	description,
	display_order,
	is_active,
	created_at,
	updated_at
) VALUES
	('timing_after_out', 'OUT後', 'チェックアウト後に行う作業', 10, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('timing_before_in', 'IN前', 'チェックイン前に行う作業', 20, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('timing_as_needed', '随時', '気づいた時や必要に応じて行う作業', 30, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('timing_regular', '定期', '日次・週次・月次など定期的に行う作業', 40, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z'),
	('timing_emergency', '緊急時', '緊急時やトラブル時に行う作業', 50, 1, '2026-08-05T00:00:00Z', '2026-08-05T00:00:00Z')
ON CONFLICT(id) DO NOTHING;
