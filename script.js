
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const millisecondsElement = document.getElementById("milliseconds");

const startBtn = document.getElementById("startBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");

const timerStatus = document.getElementById("timerStatus");
const progressBar = document.getElementById("progressBar");
const lapsList = document.getElementById("lapsList");
const emptyState = document.getElementById("emptyState");
const lapCount = document.getElementById("lapCount");

// Stopwatch state
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let animationId = null;
let previousLapTime = 0;
let laps = [];

// Format milliseconds into MM:SS:CC
function formatTime(time) {
  const totalCentiseconds = Math.floor(time / 10);

  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor(totalCentiseconds / 100) % 60;
  const centiseconds = totalCentiseconds % 100;

  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    centiseconds: String(centiseconds).padStart(2, "0")
  };
}

// Display the current time
function updateDisplay(time) {
  const formatted = formatTime(time);

  minutesElement.textContent = formatted.minutes;
  secondsElement.textContent = formatted.seconds;
  millisecondsElement.textContent = formatted.centiseconds;

  // Progress repeats every minute
  const progress = (time % 60000) / 60000 * 100;
  progressBar.style.width = `${progress}%`;
}

// Update the timer using requestAnimationFrame
function tick() {
  if (!isRunning) return;

  elapsedTime = performance.now() - startTime;
  updateDisplay(elapsedTime);

  animationId = requestAnimationFrame(tick);
}

// Start or pause the stopwatch
function toggleStopwatch() {
  if (!isRunning) {
    // Start or resume
    startTime = performance.now() - elapsedTime;
    isRunning = true;

    startBtn.innerHTML = "<span>❚❚</span> PAUSE";
    timerStatus.textContent = "STOPWATCH RUNNING";

    lapBtn.disabled = false;

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(tick);
  } else {
    // Pause
    elapsedTime = performance.now() - startTime;
    isRunning = false;

    cancelAnimationFrame(animationId);
    animationId = null;

    updateDisplay(elapsedTime);

    startBtn.innerHTML = "<span>▶</span> RESUME";
    timerStatus.textContent = "TIMER PAUSED";
    lapBtn.disabled = true;
  }
}

// Record a lap
function recordLap() {
  if (!isRunning) return;

  const currentTime = performance.now() - startTime;
  const lapDuration = currentTime - previousLapTime;

  const lap = {
    number: laps.length + 1,
    total: currentTime,
    duration: lapDuration
  };

  laps.unshift(lap);
  previousLapTime = currentTime;

  renderLaps();
}

// Display all lap records
function renderLaps() {
  lapsList.replaceChildren();
  emptyState.hidden = laps.length > 0;

  lapCount.textContent =
    `${laps.length} ${laps.length === 1 ? "LAP" : "LAPS"}`;

  laps.forEach((lap) => {
    const row = document.createElement("div");
    row.className = "lap-row";

    const number = document.createElement("span");
    number.className = "lap-number";
    number.textContent = `LAP ${String(lap.number).padStart(2, "0")}`;

    const total = document.createElement("span");
    total.className = "lap-time";
    total.textContent = formatLapTime(lap.total);

    const difference = document.createElement("span");
    difference.className = "lap-diff";
    difference.textContent = `+${formatLapTime(lap.duration)}`;

    // Mark the fastest lap
    const fastestLap = Math.min(...laps.map(item => item.duration));

    if (lap.duration === fastestLap) {
      difference.classList.add("fastest");
      difference.textContent = `⚡ ${formatLapTime(lap.duration)}`;
    }

    // Mark slower laps compared with the previous lap
    if (lap.duration > lap.total - lap.duration) {
      // No styling needed; lap durations are shown individually.
    }

    row.append(number, total, difference);
    lapsList.appendChild(row);
  });
}

// Format a lap time for the lap list
function formatLapTime(time) {
  const formatted = formatTime(time);

  return `${formatted.minutes}:${formatted.seconds}.${formatted.centiseconds}`;
}

// Reset the entire stopwatch
function resetStopwatch() {
  isRunning = false;

  cancelAnimationFrame(animationId);
  animationId = null;

  startTime = 0;
  elapsedTime = 0;
  previousLapTime = 0;
  laps = [];

  updateDisplay(0);
  renderLaps();

  startBtn.innerHTML = "<span>▶</span> START";
  timerStatus.textContent = "READY TO START";
  lapBtn.disabled = true;
}

// Button events
startBtn.addEventListener("click", toggleStopwatch);
lapBtn.addEventListener("click", recordLap);
resetBtn.addEventListener("click", resetStopwatch);

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Avoid shortcuts while typing in an input field
  if (event.target.matches("input, textarea, select")) return;

  if (event.code === "Space") {
    event.preventDefault();

    if (event.repeat) return;

    toggleStopwatch();
  }

  if (event.code === "KeyL" && !event.repeat) {
    recordLap();
  }

  if (event.code === "KeyR" && !event.repeat) {
    resetStopwatch();
  }
});

// Initialize the stopwatch
updateDisplay(0);
renderLaps();
