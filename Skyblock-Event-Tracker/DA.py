import json
from datetime import datetime, timedelta
import pytz

est = pytz.timezone("US/Eastern")

# Start time: today at 2:54:30 PM EST
now = datetime.now(est)
start_time = est.localize(datetime(now.year, now.month, now.day, 15, 00))

# Duration: 10 years
duration_years = 10
end_time = start_time + timedelta(days=365 * duration_years)

interval = timedelta(hours=1)
sub_event_offset = timedelta(minutes=5)  # sub-event 5 minutes before main event

events = []

current_time = start_time
while current_time <= end_time:
    main_event = current_time.isoformat()
    sub_event = (current_time - sub_event_offset).isoformat()
    events.append({
        "main_event": main_event,
        "sub_event": sub_event
    })
    current_time += interval

output = {
    "event_name": "Hourly Main Event",
    "sub_event_name": "Sub Event (5 mins before)",
    "start_time_EST": start_time.isoformat(),
    "interval_hours": 1,
    "occurrences": len(events),
    "events": events
}

with open("Dark_Schedule.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Generated hourly_events_with_sub.json with {len(events)} event pairs.")
