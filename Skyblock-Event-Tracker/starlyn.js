let countdownInterval = null;

async function loadStarlynEvents() {
  try {
    const response = await fetch('event_schedule.json');
    if (!response.ok) throw new Error('Failed to load event_schedule.json');

    const data = await response.json();
    displayStarlynEvents(data.events);
  } catch (error) {
    console.error(error);
    document.getElementById('starlyn-content').innerText = 'Failed to load event data.';
  }
}

function displayStarlynEvents(eventTimestamps) {
  const contentDiv = document.getElementById('starlyn-content');
  contentDiv.innerHTML = '';

  if (!eventTimestamps || eventTimestamps.length === 0) {
    contentDiv.innerHTML = '<p>No upcoming events found.</p>';
    return;
  }

  const now = Date.now();
  const upcomingEvents = eventTimestamps
    .map(ts => new Date(ts))
    .filter(dt => dt.getTime() > now)
    .sort((a, b) => a - b);

  if (upcomingEvents.length === 0) {
    contentDiv.innerHTML = '<p>No upcoming events at the moment.</p>';
    return;
  }

  const eventTime = upcomingEvents[0];
  const eventDiv = document.createElement('div');
  eventDiv.classList.add('event-box');
  eventDiv.innerHTML = `
    <strong>EVENT:</strong> Starlyn Contest <br>
    <strong>ENDS AT:</strong> 
    <span class="start-time">
      ${eventTime.toLocaleString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}
    </span><br>

    <strong>COUNTDOWN:</strong>
    <span class="countdown" data-time="${eventTime.getTime()}">Loading...</span>
    <hr>
  `;
  contentDiv.appendChild(eventDiv);

  // Stop any previous countdowns before starting a new one
  if (countdownInterval) clearInterval(countdownInterval);
  startStarlynCountdown(eventTime.getTime());
}

function startStarlynCountdown(eventTimestamp) {
  const countdownElement = document.querySelector('#starlyn-content .countdown');

  function updateCountdown() {
    const now = Date.now();
    const diffMs = eventTimestamp - now;

    if (diffMs <= 0) {
      countdownElement.textContent = 'Ended';
      countdownElement.style.color = '#888';
      clearInterval(countdownInterval);

      // Wait 2s and refresh
      setTimeout(loadStarlynEvents, 2000);
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

window.addEventListener("load", loadStarlynEvents);
