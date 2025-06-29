// Parse an EST date string (e.g. "2025-01-10 00:00:00") and return a UTC Date
function parseESTToUTC(dateStr) {
    const [year, month, day, hour, minute, second] = dateStr.split(/[- :]/).map(Number);

    // EST is UTC-5 by default
    let utcHour = hour + 5;

    const estDate = new Date(Date.UTC(year, month - 1, day, utcHour, minute, second));

    // Approximate DST boundaries for US
    const dstStart = new Date(Date.UTC(year, 2, 8)); // Second Sunday in March
    dstStart.setUTCDate(14 - dstStart.getUTCDay());

    const dstEnd = new Date(Date.UTC(year, 10, 1)); // First Sunday in November
    dstEnd.setUTCDate(7 - dstEnd.getUTCDay());

    const isDST = estDate >= dstStart && estDate < dstEnd;

    if (isDST) {
        estDate.setUTCHours(estDate.getUTCHours() - 1); // Adjust to UTC-4
    }

    return estDate;
}

// Format a date string from schedule.json to a readable EST date
function formatDateEST(dateStr) {
    const date = parseESTToUTC(dateStr);

    return date.toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Countdown calculator from UTC Date
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

// Fetch and process schedule.json
function updateSchedule() {
    fetch('schedule.json')
        .then(response => response.json())
        .then(schedule => {
            const currentDate = new Date();
            const modeInfoElement = document.getElementById('mode-info');
            const scheduleListElement = document.getElementById('schedule-list');

            let currentMode = null;
            let nextMode = null;

            schedule.forEach(item => {
                const modeDate = parseESTToUTC(item.date);

                if (modeDate <= currentDate) {
                    currentMode = item;
                } else if (!nextMode || parseESTToUTC(item.date) < parseESTToUTC(nextMode.date)) {
                    nextMode = item;
                }
            });

            // Display current mode
            if (currentMode) {
                modeInfoElement.innerHTML = `
                    <p class="current-label">Current Dream Mode</p>
                    <p class="current-mode">${currentMode.mode}</p>
                `;
            } else {
                modeInfoElement.innerHTML = `<p>No mode is currently active.</p>`;
            }

            // Display next mode with countdown
            if (nextMode) {
                const nextModeDate = parseESTToUTC(nextMode.date);
                modeInfoElement.innerHTML += `
                    <p class="next-mode">Next Mode: ${nextMode.mode} (${formatDateEST(nextMode.date)})</p>
                    <p class="countdown">Starts in: ${calculateCountdown(nextModeDate)}</p>
                `;
            } else {
                modeInfoElement.innerHTML += `<p>No upcoming mode scheduled.</p>`;
            }

            // Show next 7 scheduled modes
            const upcomingModes = schedule.filter(item => {
                const modeDate = parseESTToUTC(item.date);
                return modeDate >= currentDate;
            }).slice(0, 7);

            scheduleListElement.innerHTML = ''; // Clear list

            upcomingModes.forEach(item => {
                const modeDate = parseESTToUTC(item.date);
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="mode-name">${item.mode}</span>
                    <span class="mode-date">${formatDateEST(item.date)}</span>
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

// Refresh every second
setInterval(updateSchedule, 1000);

// Initial call
updateSchedule();
