import os
from collections import defaultdict
from datetime import date, datetime, timedelta

import requests
from dotenv import load_dotenv

from sheets_client import get_sheet

TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"


def _parse_int(value: str) -> int | None:
	try:
		return int(float(value))
	except (TypeError, ValueError):
		return None


def _parse_float(value: str) -> float | None:
	try:
		return float(value)
	except (TypeError, ValueError):
		return None


def _read_sales_for_date(target_date: date) -> list[tuple[str, int, float]]:
	sheet = get_sheet()
	rows = sheet.get_all_values()
	sales: list[tuple[str, int, float]] = []

	for row in rows:
		if len(row) < 2:
			continue

		ts_raw = row[0].strip()
		try:
			ts = datetime.strptime(ts_raw, TIMESTAMP_FORMAT)
		except ValueError:
			continue

		if ts.date() != target_date:
			continue

		menu = row[1].strip() or "(ไม่ระบุเมนู)"
		qty = _parse_int(row[2]) if len(row) > 2 else None
		price = _parse_float(row[3]) if len(row) > 3 else None
		total = _parse_float(row[4]) if len(row) > 4 else None

		if qty is None:
			if total is not None and price:
				qty = int(round(total / price))
			else:
				qty = 1

		if total is None:
			total = qty * (price or 0.0)

		sales.append((menu, qty, total))

	return sales


def _build_report_message(target_date: date, sales: list[tuple[str, int, float]]) -> str:
	date_label = target_date.strftime("%Y-%m-%d")
	if not sales:
		return f"เมื่อวานนี้ ({date_label}) ยังไม่มีบันทึกยอดเลยนะคะ 💤📭"

	total_sales = sum(total for _, _, total in sales)
	menu_qty: dict[str, int] = defaultdict(int)
	for menu, qty, _ in sales:
		menu_qty[menu] += qty

	best_menu, best_qty = max(menu_qty.items(), key=lambda item: item[1])
	order_count = len(sales)
	total_text = f"{total_sales:,.2f}"

	return (
		f"สรุปยอดเมื่อวานนี้ ({date_label}) 🧾✨\n"
		f"- ยอดรวม {total_text} บาท 💰\n"
		f"- เมนูขายดีสุด {best_menu} ({best_qty} แก้ว) 🥤\n"
		f"- จำนวนรายการ {order_count} รายการ 🎀"
	)


def _send_telegram_message(token: str, chat_id: str, text: str) -> None:
	url = f"https://api.telegram.org/bot{token}/sendMessage"
	response = requests.post(
		url,
		json={"chat_id": chat_id, "text": text, "disable_web_page_preview": True},
		timeout=20,
	)
	if not response.ok:
		raise RuntimeError(
			f"Telegram API error: {response.status_code} {response.text}"
		)


def main() -> int:
	load_dotenv()
	token = os.getenv("TELEGRAM_BOT_TOKEN")
	chat_id = os.getenv("TELEGRAM_CHAT_ID")
	if not token or not chat_id:
		raise RuntimeError("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID")

	target_date = datetime.now().date() - timedelta(days=1)
	sales = _read_sales_for_date(target_date)
	message = _build_report_message(target_date, sales)
	_send_telegram_message(token, chat_id, message)
	print("Sent morning report to Telegram.")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
