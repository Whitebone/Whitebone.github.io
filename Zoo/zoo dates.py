# If you're reading the source code, this is not part of the site; it's what I used to create the json with all the data and stuff
#
#




import datetime
import json

# Initial event start and end time
start_time = datetime.datetime(2024, 8, 15, 20, 55)
end_time = datetime.datetime(2024, 8, 15, 21, 55)


# Time interval between the start of consecutive events
interval = datetime.timedelta(hours=62)

# End date for generating events
end_date = datetime.datetime(2030, 1, 1)

# List of tags to cycle through
tags = [ "Elephant", "Giraffe", "Blue Whale", "Tiger", "Lion", "Monkey",]

# List to hold all event times
events = []

# Counter for tags
tag_index = 0

while start_time < end_date:
    events.append({
        "start": start_time.strftime("%Y-%m-%d %H:%M:%S"),
        "end": end_time.strftime("%Y-%m-%d %H:%M:%S"),
        "tag": tags[tag_index]
    })
    
    # Move to the next event time
    start_time += interval
    end_time += interval
    
    # Cycle through tags
    tag_index = (tag_index + 1) % len(tags)

# Convert events to JSON format
events_json = json.dumps(events, indent=4)

# Save to a file
with open('events.json', 'w') as f:
    f.write(events_json)

print("Events generated and saved to events.json")
