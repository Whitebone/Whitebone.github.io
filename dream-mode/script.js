// Parse EST date string to UTC Date object
function parseESTToUTC(dateStr) {
    const [year, month, day, hour, minute, second] = dateStr.split(/[- :]/).map(Number);
    let utcHour = hour + 5;
    const estDate = new Date(Date.UTC(year, month - 1, day, utcHour, minute, second));

    // DST detection simplified for US
    const dstStart = new Date(Date.UTC(year, 2, 8)); // Second Sunday March
    dstStart.setUTCDate(14 - dstStart.getUTCDay());
    const dstEnd = new Date(Date.UTC(year, 10, 1)); // First Sunday November
    dstEnd.setUTCDate(7 - dstEnd.getUTCDay());

    const isDST = estDate >= dstStart && estDate < dstEnd;
    if (isDST) estDate.setUTCHours(estDate.getUTCHours() - 1);

    return estDate;
}

function formatDiscordTimestamp(dateStr, style = 'F') {
    const date = parseESTToUTC(dateStr);
    return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
}

function formatDateEST(dateStr) {
    const date = parseESTToUTC(dateStr);
    // Format without timezone suffix
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

function calculateCountdown(targetDate) {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) return "Time's up!";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

let scheduleData = [];
const scheduleListElement = document.getElementById('schedule-list');
const modeInfoElement = document.getElementById('mode-info');

// Build schedule list once on load
function buildScheduleList() {
    scheduleListElement.innerHTML = '';

    const now = new Date();

    // Group all events by mode, sorted ascending by date
    const groupedByMode = {};
    scheduleData.forEach(item => {
        if (!groupedByMode[item.mode]) groupedByMode[item.mode] = [];
        groupedByMode[item.mode].push(item);
    });
    Object.values(groupedByMode).forEach(arr =>
        arr.sort((a,b) => parseESTToUTC(a.date) - parseESTToUTC(b.date))
    );

    // Next 7 upcoming items overall
    const upcoming = scheduleData.filter(item => parseESTToUTC(item.date) >= now).slice(0, 7);

    upcoming.forEach(item => {
        const mode = item.mode;
        const modeDates = groupedByMode[mode];

        const currentIndex = modeDates.findIndex(i => i.date === item.date);

        // Upcoming: current + next 3 (4 total)
        const upcomingDates = modeDates.slice(currentIndex, currentIndex + 4);

        // Past: previous 4
        const pastDates = modeDates.slice(Math.max(0, currentIndex - 4), currentIndex);

        // Format lists
        const formatDatesList = (dates) => dates.map(d => {
            const discord = formatDiscordTimestamp(d.date);
            const formatted = formatDateEST(d.date);
            return `<li><span class="mode-date" title="Click to copy Discord timestamp" data-discord="${discord}">${formatted}</span></li>`;
        }).join('');

        const li = document.createElement('li');
        li.classList.add('schedule-item');
        li.dataset.mode = mode;
        li.dataset.date = item.date;

        li.innerHTML = `
            <div class="schedule-item-header">
                <span class="mode-name">${mode}</span>
                <span class="mode-date" title="Click to copy Discord timestamp" data-discord="${formatDiscordTimestamp(item.date)}">${formatDateEST(item.date)}</span>
                <span class="countdown" title="Click to copy relative Discord timestamp" data-discord="${formatDiscordTimestamp(item.date, 'R')}">${calculateCountdown(parseESTToUTC(item.date))}</span>
            </div>

            <div class="hover-expanded">
                <div class="hover-column upcoming-column">
                    <div class="hover-header">Upcoming</div>
                    <ul class="hover-list upcoming-list">${formatDatesList(upcomingDates)}</ul>
                </div>
                <div class="hover-column past-column">
                    <div class="hover-header">Past</div>
                    <ul class="hover-list past-list">${formatDatesList(pastDates)}</ul>
                </div>
            </div>
        `;

        scheduleListElement.appendChild(li);
    });
}

// Update countdown timers and mode info without rebuilding list
function updateCountdowns() {
    const now = new Date();

    let currentMode = null;
    let nextMode = null;

    scheduleData.forEach(item => {
        const modeDate = parseESTToUTC(item.date);
        if (modeDate <= now) currentMode = item;
        else if (!nextMode || parseESTToUTC(nextMode.date) > modeDate) nextMode = item;
    });

    if (currentMode) {
        modeInfoElement.innerHTML = `
            <p class="current-label">Current Dream Mode</p>
            <p class="current-mode">${currentMode.mode}</p>
        `;
    } else {
        modeInfoElement.innerHTML = `<p>No mode is currently active.</p>`;
    }

    if (nextMode) {
        const nextModeDate = parseESTToUTC(nextMode.date);
        // Format the date string for display without GMT, as requested
        const formattedDate = formatDateEST(nextMode.date);
        // Also add a span around the date part for clickable copy with class "next-mode-date"
        modeInfoElement.innerHTML += `
            <p class="next-mode">Next Mode: ${nextMode.mode} 
                (<span class="next-mode-date" title="Click to copy Discord timestamp" data-discord="${formatDiscordTimestamp(nextMode.date)}">${formattedDate}</span>)
            </p>
            <p class="countdown" title="Click to copy relative Discord timestamp" data-discord="${formatDiscordTimestamp(nextMode.date, 'R')}">Starts in: ${calculateCountdown(nextModeDate)}</p>
        `;
    } else {
        modeInfoElement.innerHTML += `<p>No upcoming mode scheduled.</p>`;
    }

    // Update countdowns in list
    document.querySelectorAll('.schedule-item').forEach(li => {
        const dateStr = li.dataset.date;
        const date = parseESTToUTC(dateStr);
        const countdownSpan = li.querySelector('.countdown');
        if (countdownSpan) countdownSpan.textContent = calculateCountdown(date);
    });
}

// Copy discord timestamp on click for all clickable elements (mode-date, countdown, next-mode-date)
document.addEventListener('click', e => {
    const target = e.target;

    if (
        target.classList.contains('mode-date') ||
        target.classList.contains('countdown') ||
        target.classList.contains('next-mode-date')
    ) {
        const discord = target.getAttribute('data-discord');
        if (!discord) return;

        navigator.clipboard.writeText(discord).then(() => {
            const origText = target.textContent;
            target.textContent = 'Copied!';
            setTimeout(() => {
                target.textContent = origText;
            }, 1000);
        });
    }
});

// Initial load
fetch('schedule.json')
    .then(res => res.json())
    .then(data => {
        scheduleData = data;
        buildScheduleList();
        updateCountdowns();
        setInterval(updateCountdowns, 1000);
    })
    .catch(err => {
        console.error('Failed to load schedule:', err);
        modeInfoElement.innerHTML = '<p>Failed to load schedule.</p>';
    });
