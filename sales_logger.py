import sys
from datetime import datetime

from dotenv import load_dotenv

from sheets_client import get_sheet


def parse_sale(raw: str) -> tuple[str, int, float, float]:
	parts = [part.strip() for part in raw.split(":")]
	if len(parts) != 3 or not all(parts):
		raise ValueError("Expected format: menu:qty:price")

	menu = parts[0]
	try:
		qty = int(parts[1])
		price = float(parts[2])
	except ValueError as exc:
		raise ValueError("qty must be int and price must be number") from exc

	if qty <= 0 or price < 0:
		raise ValueError("qty must be > 0 and price must be >= 0")

	total = qty * price
	return menu, qty, price, total


def main() -> int:
	load_dotenv()

	if len(sys.argv) < 2:
		print("Usage: python sales_logger.py menu:qty:price")
		return 1

	raw = " ".join(sys.argv[1:])
	try:
		menu, qty, price, total = parse_sale(raw)
	except ValueError as exc:
		print(f"Error: {exc}")
		return 1

	timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
	sheet = get_sheet()
	sheet.append_row([timestamp, menu, qty, price, total])
	print(f"Logged: {timestamp} | {menu} x{qty} @ {price} = {total}")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())
