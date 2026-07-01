import json
from datetime import datetime, timedelta

# Modes cycle weekly ("One Block" now added right after "Swappage")
modes = [
    "Armed",
    "Lucky Block",
    "Swappage",
    "One Block",
    "Rush",
    "Ultimate",
    "Castle",
    "Voidless"
]

# We want "today" to fall 1 day before the end of the current 7-day "Ultimate" block.
# That means the current block started 6 days ago.
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
current_block_start = today - timedelta(days=6)
current_mode_index = modes.index("Ultimate")

# 30 years * 52 weeks per year (approximate)
total_weeks = 30 * 52

schedule = []

for i in range(total_weeks):
    date = current_block_start + timedelta(weeks=i)
    mode = modes[(current_mode_index + i) % len(modes)]
    schedule.append({
        "date": date.strftime("%Y-%m-%d %H:%M:%S"),
        "mode": mode
    })

# Output JSON to file
with open("schedule.json", "w") as f:
    json.dump(schedule, f, indent=4)

print(f"Generated schedule.json with {len(schedule)} entries spanning ~30 years.")
print(f"Current block started {current_block_start.strftime('%Y-%m-%d')} as '{modes[current_mode_index]}', "
      f"with 1 day left as of {today.strftime('%Y-%m-%d')}.")
