let darkAuctionInterval = null;

async function loadDarkAuctionEvents() {
  try {
    const response = await fetch('dark_schedule.json');
    if (!response.ok) throw new Error('Failed to load dark_schedule.json');

    const data = await response.json();
    displayDarkAuctionEvent(data.events);
  } catch (error) {
    console.error(error);
    document.getElementById('dark-auction-content').innerText = 'Failed to load event data.';
  }
}

function displayDarkAuctionEvent(events) {
  const container = document.getElementById('dark-auction-content');
  container.innerHTML = '';

  if (!events || events.length === 0) {
    container.innerHTML = '<p>No upcoming Dark Auction events found.</p>';
    return;
  }

  const now = new Date();

  // Find the next event where main_event is in the future or currently within 5 minutes before main_event
  let nextEventIndex = events.findIndex(event => {
    const mainEventTime = new Date(event.main_event);
    const subEventTime = new Date(event.sub_event);
    // Show if main event in future OR currently within 5 minutes before main event
    return (mainEventTime > now) || (now >= new Date(mainEventTime.getTime() - 5 * 60000) && now <= mainEventTime);
  });

  // If no future event found, show last event (or empty)
  if (nextEventIndex === -1) {
    container.innerHTML = '<p>No upcoming Dark Auction events found.</p>';
    return;
  }

  const event = events[nextEventIndex];
  const mainEventTime = new Date(event.main_event);
  const subEventTime = new Date(event.sub_event);

  // Determine display mode: 
  // If now within 5 minutes before main event (Dark Auction Now)
  // Else countdown until next sub event (Dark Auction Start)

  let showNow = false;
  let countdownTarget = subEventTime;

  const fiveMinutesBeforeMain = new Date(mainEventTime.getTime() - 5 * 60000);

  if (now >= fiveMinutesBeforeMain && now <= mainEventTime) {
    showNow = true;
    // For countdown, show until next sub_event (if exists), else subEventTime itself
    // Next sub event is next event's sub_event if exists, else same sub_event
    if (nextEventIndex + 1 < events.length) {
      countdownTarget = new Date(events[nextEventIndex + 1].sub_event);
    } else {
      countdownTarget = subEventTime;
    }
  } else if (now > mainEventTime) {
    // After main event, move to next event for countdown if possible
    if (nextEventIndex + 1 < events.length) {
      countdownTarget = new Date(events[nextEventIndex + 1].sub_event);
    } else {
      countdownTarget = subEventTime;
    }
  } else {
    // Before 5 minutes window, countdown to sub_event normally
    countdownTarget = subEventTime;
  }

  container.innerHTML = `
    <div class="event-box">
  <strong>EVENT:</strong> Dark Auction<br>
  <strong>${showNow ? 'Time until next Dark Auction start' : 'Starts at'}:</strong> 
  <span class="event-time countdown">${countdownTarget.toLocaleString([], {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})}</span><br>
  <strong>COUNTDOWN:</strong> <span id="dark-auction-countdown" class="countdown">Loading...</span>
  <hr>
</div>

  `;

  // Clear old interval
  if (darkAuctionInterval) clearInterval(darkAuctionInterval);

  startDarkAuctionCountdown(countdownTarget.getTime());
}

function startDarkAuctionCountdown(targetTimestamp) {
  const countdownElement = document.getElementById('dark-auction-countdown');

  function updateCountdown() {
    const now = Date.now();
    const diffMs = targetTimestamp - now;

    if (diffMs <= 0) {
      countdownElement.textContent = 'Event Started';
      countdownElement.style.color = '#888';
      clearInterval(darkAuctionInterval);

      // Refresh event display after 2s to update to next event
      setTimeout(loadDarkAuctionEvents, 2000);
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  darkAuctionInterval = setInterval(updateCountdown, 1000);
}

window.addEventListener("load", loadDarkAuctionEvents);
