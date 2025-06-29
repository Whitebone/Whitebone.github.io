import json
from datetime import datetime, timedelta

# Modes cycle weekly
modes = [
    "Armed",
    "Lucky Block",
    "Swappage",
    "Rush",
    "Ultimate",
    "Castle",
    "Voidless"
]

start_date_str = "2024-12-27 00:00:00"
start_date = datetime.strptime(start_date_str, "%Y-%m-%d %H:%M:%S")

# 30 years * 52 weeks per year (approximate)
total_weeks = 30 * 52

schedule = []

for i in range(total_weeks):
    date = start_date + timedelta(weeks=i)
    mode = modes[i % len(modes)]
    schedule.append({
        "date": date.strftime("%Y-%m-%d %H:%M:%S"),
        "mode": mode
    })

# Output JSON to file
with open("schedule.json", "w") as f:
    json.dump(schedule, f, indent=4)

print(f"Generated schedule.json with {len(schedule)} entries spanning ~30 years.")
