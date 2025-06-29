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

  startStarlynCountdown();
}

function startStarlynCountdown() {
  const countdownElements = document.querySelectorAll('#starlyn-content .countdown');

  function updateCountdown() {
    const now = Date.now();
    countdownElements.forEach(el => {
      const eventTime = parseInt(el.getAttribute('data-time'));
      const diffMs = eventTime - now;

      if (diffMs <= 0) {
        el.textContent = 'Started';
        el.style.color = '#555';
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      el.textContent = `${hours}h ${minutes}m ${seconds}s`;
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

window.addEventListener("load", loadStarlynEvents);
