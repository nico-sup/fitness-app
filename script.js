// Variables
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let currentActivityIndex = -1;
let currentDayIndex = -1;
let timerInterval;
let secondsElapsed = 0;

// Elements
const activityNameInput = document.getElementById("activityName");
const daysInput = document.getElementById("days");
const repsInput = document.getElementById("reps");
const addActivityButton = document.getElementById("addActivity");
const totalActivitiesElement = document.getElementById("totalActivities");
const totalRepsElement = document.getElementById("totalReps");
const daysRemainingElement = document.getElementById("daysRemaining");
const progressBar = document.getElementById("progressBar");
const progressPercentageElement = document.getElementById("progressPercentage");
const activityListContainer = document.getElementById("activityList");
const activityDayTitle = document.getElementById("activityDayTitle");
const activityDescription = document.getElementById("activityDescription");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerButton = document.getElementById("startTimer");
const stopTimerButton = document.getElementById("stopTimer");
const saveTimeButton = document.getElementById("saveTime");
const backToActivitiesButton = document.getElementById("backToActivities");

// Save Activities to localStorage
function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Add Activity
addActivityButton.addEventListener("click", function () {
    const activityName = activityNameInput.value.trim();
    const days = parseInt(daysInput.value);
    const reps = parseInt(repsInput.value);

    if (activityName && !isNaN(days) && !isNaN(reps) && days > 0 && reps > 0) {
        const activity = {
            name: activityName,
            days: days,
            reps: reps,
            daysData: Array.from({ length: days }, () => ({ completed: false, timeSpent: 0 })),
        };
        activities.push(activity);
        saveActivities(); // Save to localStorage
        renderActivities();
        resetInputs();
        updateStats();
    } else {
        alert("Please fill out all fields correctly.");
    }
});

// Update Stats
function updateStats() {
    const totalActivities = activities.length;
    const totalReps = activities.reduce((sum, activity) => sum + (activity.reps * activity.days), 0);
    const daysRemaining = activities.reduce((sum, activity) => sum + activity.days, 0) - activities.reduce((sum, activity) => sum + activity.daysData.filter(day => day.completed).length, 0);

    totalActivitiesElement.textContent = totalActivities;
    totalRepsElement.textContent = totalReps;
    daysRemainingElement.textContent = daysRemaining;

    const progress = (totalReps > 0) ? (activities.reduce((sum, activity) => sum + (activity.reps * activity.daysData.filter(day => day.completed).length), 0) / totalReps) * 100 : 0;
    progressBar.value = progress;
    progressPercentageElement.textContent = `${Math.round(progress)}%`;
}

// Render Activities List
function renderActivities() {
    activityListContainer.innerHTML = "";
    activities.forEach((activity, index) => {
        const activityItem = document.createElement("div");
        activityItem.classList.add("activity");
        activityItem.innerHTML = `
            <h3>${activity.name}</h3>
            <p>${activity.days} days, ${activity.reps} reps/day</p>
            <div id="activity-days-${index}" class="activity-days"></div>
        `;
        activityListContainer.appendChild(activityItem);

        const activityDaysContainer = document.getElementById(`activity-days-${index}`);
        
        // Ensure daysData exists and is an array before using forEach
        if (Array.isArray(activity.daysData)) {
            activity.daysData.forEach((day, dayIndex) => {
                const dayElement = document.createElement("div");
                dayElement.classList.add("day");
                dayElement.innerHTML = `
                    <div>
                    <input type="checkbox" id="day-${index}-${dayIndex}" ${day.completed ? 'checked' : ''}>
                    <label for="day-${index}-${dayIndex}">Day ${dayIndex + 1}</label>
                    </div>
                    <button class="viewDayButton" data-activity-index="${index}" data-day-index="${dayIndex}">View Day ${dayIndex + 1}</button>
                `;
                activityDaysContainer.appendChild(dayElement);

                // Attach event listener for each "View Day" button
                dayElement.querySelector(".viewDayButton").addEventListener("click", function () {
                    currentActivityIndex = parseInt(this.dataset.activityIndex);
                    currentDayIndex = parseInt(this.dataset.dayIndex);
                    const activity = activities[currentActivityIndex];
                    const day = activity.daysData[currentDayIndex];
                    
                    activityDayTitle.textContent = `${activity.name} - Day ${currentDayIndex + 1}`;
                    activityDescription.textContent = `Complete your task for today!`;
                    document.getElementById("activitiesSection").style.display = "none";
                    document.getElementById("dayActivityPage").style.display = "block";
                    
                    // Initialize timer for this specific day
                    secondsElapsed = day.timeSpent;  // Restore the previous time spent
                    updateTimerDisplay();
                });

                // Attach event listener for checkbox
                const checkbox = dayElement.querySelector("input[type='checkbox']");
                checkbox.addEventListener("change", function () {
                    activity.daysData[dayIndex].completed = checkbox.checked;
                    saveActivities(); // Save to localStorage
                    updateStats();
                });
            });
        } else {
            console.error(`daysData for activity '${activity.name}' is not defined or not an array`);
        }
    });
}

// Timer for Activity Day
let timerRunning = false;

startTimerButton.addEventListener("click", function () {
    if (!timerRunning) {
        timerInterval = setInterval(function () {
            secondsElapsed++;
            updateTimerDisplay();
        }, 1000);
        timerRunning = true;
    }
});

stopTimerButton.addEventListener("click", function () {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;

        // Save the time when the timer is stopped
        if (currentActivityIndex !== -1 && currentDayIndex !== -1) {
            const activity = activities[currentActivityIndex];
            const day = activity.daysData[currentDayIndex];
            
            // Save the time spent for the specific day
            day.timeSpent = secondsElapsed;
            day.completed = true; // Mark the day as completed
            
            // Automatically check the checkbox for this day
            document.getElementById(`day-${currentActivityIndex}-${currentDayIndex}`).checked = true;

            saveActivities(); // Save to localStorage
            secondsElapsed = 0;
            updateStats();
            updateTimerDisplay();
            alert("Time saved and day marked as complete!");
        }
    }
});

saveTimeButton.addEventListener("click", function () {
    if (currentActivityIndex !== -1 && currentDayIndex !== -1) {
        const activity = activities[currentActivityIndex];
        const day = activity.daysData[currentDayIndex];
        
        // Save the time spent for the specific day
        day.timeSpent = secondsElapsed;
        day.completed = true;
        
        // Update global time spent
        activity.daysData[currentDayIndex] = day;
        saveActivities(); // Save to localStorage
        secondsElapsed = 0;
        updateStats();
        updateTimerDisplay();
        alert("Time saved!");
    }
});

// Back to Activities Page
backToActivitiesButton.addEventListener("click", function () {
    document.getElementById("dayActivityPage").style.display = "none";
    document.getElementById("activitiesSection").style.display = "block";
});

// Update Timer Display
function updateTimerDisplay() {
    const hours = String(Math.floor(secondsElapsed / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((secondsElapsed % 3600) / 60)).padStart(2, '0');
    const seconds = String(secondsElapsed % 60).padStart(2, '0');
    timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Reset Inputs
function resetInputs() {
    activityNameInput.value = '';
    daysInput.value = '';
    repsInput.value = '';
}

// Initial Render
renderActivities();
updateStats();

