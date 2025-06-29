// Parse an EST date string (e.g. "2025-01-10 00:00:00") and return a UTC Date
function parseESTToUTC(dateStr) {
    const [year, month, day, hour, minute, second] = dateStr.split(/[- :]/).map(Number);

    let utcHour = hour + 5;
    const estDate = new Date(Date.UTC(year, month - 1, day, utcHour, minute, second));

    const dstStart = new Date(Date.UTC(year, 2, 8));
    dstStart.setUTCDate(14 - dstStart.getUTCDay());

    const dstEnd = new Date(Date.UTC(year, 10, 1));
    dstEnd.setUTCDate(7 - dstEnd.getUTCDay());

    const isDST = estDate >= dstStart && estDate < dstEnd;

    if (isDST) {
        estDate.setUTCHours(estDate.getUTCHours() - 1);
    }

    return estDate;
}

// Convert to Discord timestamp format
function formatDiscordTimestamp(dateStr) {
    const date = parseESTToUTC(dateStr);
    const unixSeconds = Math.floor(date.getTime() / 1000);
    return `<t:${unixSeconds}:F>`;
}

// Format date string (12h EST display)
function formatDateEST(dateStr) {
    const date = parseESTToUTC(dateStr);

    return date.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Countdown timer
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

// Copy Discord timestamp on click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('mode-date')) {
        const discord = e.target.getAttribute('data-discord');
        navigator.clipboard.writeText(discord).then(() => {
            const originalText = e.target.textContent;
            e.target.textContent = 'Copied!';
            setTimeout(() => {
                e.target.textContent = originalText;
            }, 1000);
        });
    }
});

// Schedule updater
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

            // Current mode
            if (currentMode) {
                modeInfoElement.innerHTML = `
                    <p class="current-label">Current Dream Mode</p>
                    <p class="current-mode">${currentMode.mode}</p>
                `;
            } else {
                modeInfoElement.innerHTML = `<p>No mode is currently active.</p>`;
            }

            // Next mode
            if (nextMode) {
                const nextModeDate = parseESTToUTC(nextMode.date);
                const discord = formatDiscordTimestamp(nextMode.date);
                const formattedDate = formatDateEST(nextMode.date);
                modeInfoElement.innerHTML += `
                    <p class="next-mode">Next Mode: ${nextMode.mode} 
                        <span class="mode-date" title="Click to copy Discord timestamp" data-discord="${discord}">
                            (${formattedDate})
                        </span>
                    </p>
                    <p class="countdown">Starts in: ${calculateCountdown(nextModeDate)}</p>
                `;
            } else {
                modeInfoElement.innerHTML += `<p>No upcoming mode scheduled.</p>`;
            }

            // Upcoming list
            const upcomingModes = schedule.filter(item => {
                const modeDate = parseESTToUTC(item.date);
                return modeDate >= currentDate;
            }).slice(0, 7);

            scheduleListElement.innerHTML = '';

            upcomingModes.forEach(item => {
                const modeDate = parseESTToUTC(item.date);
                const discord = formatDiscordTimestamp(item.date);
                const formatted = formatDateEST(item.date);
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span class="mode-name">${item.mode}</span>
                    <span class="mode-date" title="Click to copy Discord timestamp" data-discord="${discord}">
                        ${formatted}
                    </span>
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

setInterval(updateSchedule, 1000);
updateSchedule();
