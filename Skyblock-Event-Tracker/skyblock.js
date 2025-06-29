let serverTimeOffset = 0;

async function fetchSkyblockData() {
  try {
    const response = await fetch("https://api.soopy.dev/skyblock/chevents/get");
    if (!response.ok) throw new Error(`HTTP ERROR! STATUS: ${response.status}`);

    const data = await response.json();
    serverTimeOffset = data.data.curr_time - Date.now();
    displaySkyblockData(data.data);
  } catch (error) {
    console.error("ERROR FETCHING DATA:", error);
    document.getElementById("skyblock-content").innerText = "Failed to load data.";
  }
}

function displaySkyblockData(data) {
  const contentDiv = document.getElementById("skyblock-content");
  contentDiv.innerHTML = "";
  const events = data.running_events;

  if (!events || Object.keys(events).length === 0) {
    contentDiv.innerHTML = "<p>No events running.</p>";
    return;
  }

  for (const location in events) {
    if (events[location].length > 0) {
      const locationHeader = document.createElement("h2");
      locationHeader.textContent = location.replace(/_/g, " ");
      contentDiv.appendChild(locationHeader);

      events[location].forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-box");

        const endTime = event.ends_at;
        const startTime = endTime - 600000;

        let eventName = event.event;
        if (eventName === "DOUBLE_POWDER") eventName = "Double Powder";
        else if (eventName === "BETTER_TOGETHER") eventName = "Better Together";
        else if (eventName === "GONE_WITH_THE_WIND") eventName = "Gone With The Wind";
        else eventName = eventName.replace(/_/g, " ").toUpperCase();

        eventDiv.innerHTML = `
          <strong>EVENT:</strong> ${eventName} <br>
          <strong>STARTED:</strong> <span class="stopwatch" data-start="${startTime}"></span> 
          (<span class="start-time" data-time="${startTime}"></span>) <br>
          <strong>LOBBY COUNT:</strong> ${event.lobby_count} <br>
          <strong>DOUBLE EVENT:</strong> ${event.is_double ? "YES" : "NO"} <br>
          <hr>
        `;
        contentDiv.appendChild(eventDiv);
      });
    }
  }

  startSkyblockStopwatch();
}

function startSkyblockStopwatch() {
  setInterval(() => {
    const currentTime = Date.now() + serverTimeOffset;

    document.querySelectorAll("#skyblock-content .stopwatch").forEach((element) => {
      const startTime = parseInt(element.getAttribute("data-start"));
      const timeElapsed = Math.floor((currentTime - startTime) / 1000);
      const minutes = Math.floor(Math.abs(timeElapsed) / 60);
      const seconds = Math.abs(timeElapsed) % 60;

      if (timeElapsed < 0) {
        element.textContent = `Starts in ${minutes}m ${seconds}s`;
      } else {
        element.textContent = `${minutes}m ${seconds}s ago`;
      }
    });

    document.querySelectorAll("#skyblock-content .start-time").forEach((element) => {
      const eventTime = parseInt(element.getAttribute("data-time"));
      element.textContent = new Date(eventTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    });
  }, 1000);
}

window.addEventListener("load", () => {
  fetchSkyblockData();
  setInterval(fetchSkyblockData, 5000);
});
