"""Offline test of the rule checker. Needs no API key. Run: python test_checker.py"""
from paytrace.checker import load_order, load_payment, run_checks

EXPECTED = {
    "ORD-1001": "SHIP",  # clean
    "ORD-1002": "HOLD",  # pending
    "ORD-1003": "HOLD",  # partial payment
    "ORD-1004": "HOLD",  # refunded
    "ORD-1005": "ASK",   # wrong reference
    "ORD-1006": "ASK",   # currency mismatch
}

for oid, want in EXPECTED.items():
    order = load_order(oid)
    result = run_checks(order, load_payment(order["payment_id"]))
    flag = "PASS" if result["verdict"] == want else "FAIL"
    print(f"{flag}  {oid}  expected {want}  got {result['verdict']}")