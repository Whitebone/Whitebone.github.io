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

# We want the current "Ultimate" block to roll over to the next mode on July 3.
# That means the current block started 5 days before today.
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
current_block_start = today - timedelta(days=5)
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
next_mode_date = current_block_start + timedelta(weeks=1)
print(f"Current block started {current_block_start.strftime('%Y-%m-%d')} as '{modes[current_mode_index]}', "
      f"next mode starts {next_mode_date.strftime('%Y-%m-%d')}.")
