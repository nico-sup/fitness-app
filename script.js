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
            <button class="deleteActivityButton" data-activity-index="${index}">Delete</button>
        `;
        activityListContainer.appendChild(activityItem);

        // Attach event listener for "Delete" button
        activityItem.querySelector(".deleteActivityButton").addEventListener("click", function () {
            deleteActivity(index);
        });

        const activityDaysContainer = document.getElementById(`activity-days-${index}`);
        
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

                // Attach event listener for checkbox
                const checkbox = dayElement.querySelector("input[type='checkbox']");
                checkbox.addEventListener("change", function () {
                    activity.daysData[dayIndex].completed = checkbox.checked;
                    saveActivities();
                    updateStats();
                });
            });
        }
    });
}

// Delete Activity
function deleteActivity(index) {
    const confirmDelete = confirm("Are you sure you want to delete this activity?");
    if (confirmDelete) {
        activities.splice(index, 1);
        saveActivities();
        renderActivities();
        updateStats();
    }
}

// Reset Inputs
function resetInputs() {
    activityNameInput.value = '';
    daysInput.value = '';
    repsInput.value = '';
}

// Go back to activities from day view
backToActivitiesButton.addEventListener("click", function () {
    document.getElementById("activitiesSection").style.display = "block";
    document.getElementById("dayActivityPage").style.display = "none";
});

// Call the functions to initialize the page
renderActivities();
updateStats();
