import requests
import sys
from datetime import date, timedelta
import random

# ============ CONFIG ============
BASE_URL = "http://localhost:8080"
USERNAME = "raju"
PASSWORD = "sikdar"
ANIMAL_ID = 27          # <-- Change this to Cow1's actual ID
DAYS_BACK = 60          # 2 months
# ================================

def login():
    print(f"Logging in as {USERNAME}...")
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": USERNAME, "password": PASSWORD},
    )
    r.raise_for_status()
    token = r.json()["data"]["token"]
    print("✓ Login successful")
    return token

def post_milk(token, payload):
    r = requests.post(
        f"{BASE_URL}/api/milk",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    if r.status_code == 201:
        return True, None
    try:
        msg = r.json().get("message", r.text)
    except Exception:
        msg = r.text
    return False, msg

def main():
    token = login()
    today = date.today()
    start = today - timedelta(days=DAYS_BACK)

    created = 0
    skipped = 0
    failed = 0

    current = start
    while current <= today:
        # Realistic cow milk yield: 12-16 L/day split across sessions
        morning = round(random.uniform(4.5, 6.0), 1)
        noon    = round(random.uniform(3.5, 5.0), 1)
        night   = round(random.uniform(4.0, 5.5), 1)

        payload = {
            "animalId": ANIMAL_ID,
            "date": current.isoformat(),
            "morningLiters": morning,
            "noonLiters": noon,
            "nightLiters": night,
        }

        ok, err = post_milk(token, payload)

        if ok:
            created += 1
            total = morning + noon + night
            print(f"  ✓ {current}  {total:.1f} L  ({morning} + {noon} + {night})")
        elif err and "already exists" in err.lower():
            skipped += 1
            print(f"  ⏭  {current}  skipped (already exists)")
        else:
            failed += 1
            print(f"  ✗ {current}  FAILED: {err}")

        current += timedelta(days=1)

    print()
    print("=" * 50)
    print(f"Done. Created: {created} | Skipped: {skipped} | Failed: {failed}")
    print("=" * 50)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()