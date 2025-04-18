// Helper to convert to UTC (using UTC for consistency)
function convertToUTC(date) {
    return new Date(date.toISOString()); // Convert to UTC (ISO string representation)
}

// Helper to format the date into Month Name and Day, in EST time (America/New_York)
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString("en-US", options);
}

// Helper to calculate the countdown time (using UTC for synchronization)
function calculateCountdown(targetDate) {
    const now = new Date();
    const timeDifference = targetDate - now;

    if (timeDifference <= 0) return "Time's up!";

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Fetch the JSON file and process the data
function updateSchedule() {
    fetch('schedule.json')
        .then(response => response.json())
        .then(schedule => {
            const currentDate = convertToUTC(new Date()); // Use UTC to compare times
            const modeInfoElement = document.getElementById('mode-info');
            const scheduleListElement = document.getElementById('schedule-list');

            let currentMode = null;
            let nextMode = null;

            // Find the current mode and next mode
            schedule.forEach(item => {
                const modeDate = convertToUTC(new Date(item.date)); // Ensure UTC conversion
                if (modeDate <= currentDate) {
                    currentMode = item;
                } else if (!nextMode || modeDate < convertToUTC(new Date(nextMode.date))) {
                    nextMode = item;
                }
            });

            // Display the "Current Dream Mode" label and the current mode
            if (currentMode) {
                modeInfoElement.innerHTML = `
                    <p class="current-label">Current Dream Mode</p>
                    <p class="current-mode">${currentMode.mode}</p>
                `;
            } else {
                modeInfoElement.innerHTML = `<p>No mode is currently active.</p>`;
            }

            // Display the next mode with countdown
            if (nextMode) {
                const nextModeDate = convertToUTC(new Date(nextMode.date)); // Ensure UTC conversion
                modeInfoElement.innerHTML += `
                    <p class="next-mode">Next Mode: ${nextMode.mode} (${formatDate(nextMode.date)})</p>
                    <p class="countdown">Starts in: ${calculateCountdown(nextModeDate)}</p>
                `;
            } else {
                modeInfoElement.innerHTML += `<p>No upcoming mode scheduled.</p>`;
            }

            // Display the upcoming 7 modes
            const upcomingModes = schedule.filter(item => {
                const modeDate = convertToUTC(new Date(item.date)); // Ensure UTC conversion
                return modeDate >= currentDate;
            }).slice(0, 7);

            scheduleListElement.innerHTML = ''; // Clear existing list items

            upcomingModes.forEach(item => {
                const modeDate = convertToUTC(new Date(item.date)); // Ensure UTC conversion
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="mode-name">${item.mode}</span>
                    <span class="mode-date">${formatDate(item.date)}</span>
                    <span class="countdown">${calculateCountdown(modeDate)}</span>
                `;
                scheduleListElement.appendChild(listItem);
            });

        })
        .catch(error => {
            console.error('Error fetching schedule.json:', error);
            document.getElementById('mode-info').innerHTML = '<p>Failed to load schedule.</p>';
        });
}

// Update the schedule every second
setInterval(updateSchedule, 1000);

// Initial load
updateSchedule();
