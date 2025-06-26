// Initialize fitness data
let fitnessData = {
    caloriesBurned: 0,
    stepsTaken: 0,
    activeMinutes: 0,
    activities: [],
    goals: {
        calories: 2000,
        steps: 10000,
        activeMinutes: 60
    },
    history: {},
    achievements: []
};

// Function to update the dashboard
function updateDashboard() {
    document.getElementById('calories-value').textContent = fitnessData.caloriesBurned;
    document.getElementById('steps-value').textContent = fitnessData.stepsTaken;
    document.getElementById('active-minutes-value').textContent = fitnessData.activeMinutes;

    updateActivityList();
    updateGoalProgress();
    updateCharts();
    checkAchievements();
}

// Function to update the activity list
function updateActivityList() {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    fitnessData.activities.forEach((activity, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${activity.name} - ${activity.duration} minutes (${activity.intensity} intensity)
            <button onclick="removeActivity(${index})">Remove</button>
        `;
        activityList.appendChild(li);
    });
}

// Function to add a new activity
function addActivity(name, duration, intensity) {
    fitnessData.activities.push({ name, duration, intensity });
    fitnessData.activeMinutes += duration;
    
    let calorieMultiplier;
    switch (intensity) {
        case 'low':
            calorieMultiplier = 3;
            break;
        case 'medium':
            calorieMultiplier = 5;
            break;
        case 'high':
            calorieMultiplier = 7;
            break;
        default:
            calorieMultiplier = 5;
    }
    
    fitnessData.caloriesBurned += Math.floor(duration * calorieMultiplier);
    fitnessData.stepsTaken += Math.floor(duration * 100 * (intensity === 'high' ? 1.5 : intensity === 'low' ? 0.5 : 1));
    
    updateDashboard();
    saveToHistory();
}

// Function to remove an activity
function removeActivity(index) {
    const removedActivity = fitnessData.activities.splice(index, 1)[0];
    fitnessData.activeMinutes -= removedActivity.duration;
    
    let calorieMultiplier;
    switch (removedActivity.intensity) {
        case 'low':
            calorieMultiplier = 3;
            break;
        case 'medium':
            calorieMultiplier = 5;
            break;
        case 'high':
            calorieMultiplier = 7;
            break;
        default:
            calorieMultiplier = 5;
    }
    
    fitnessData.caloriesBurned -= Math.floor(removedActivity.duration * calorieMultiplier);
    fitnessData.caloriesBurned -= Math.floor(removedActivity.duration * calorieMultiplier);
    fitnessData.stepsTaken -= Math.floor(removedActivity.duration * 100 * (removedActivity.intensity === 'high' ? 1.5 : removedActivity.intensity === 'low' ? 0.5 : 1));
    
    updateDashboard();
    saveToHistory();
}

// Function to set goals
function setGoals(calories, steps, activeMinutes) {
    fitnessData.goals.calories = calories;
    fitnessData.goals.steps = steps;
    fitnessData.goals.activeMinutes = activeMinutes;
    updateGoalProgress();
    saveToLocalStorage();
}

// Function to update goal progress
function updateGoalProgress() {
    const calorieGoal = document.getElementById('calorie-goal-input');
    const stepGoal = document.getElementById('step-goal-input');
    const activeMinutesGoal = document.getElementById('active-minutes-goal-input');

    calorieGoal.value = fitnessData.goals.calories;
    stepGoal.value = fitnessData.goals.steps;
    activeMinutesGoal.value = fitnessData.goals.activeMinutes;

    updateProgressBar('calories-progress', fitnessData.caloriesBurned, fitnessData.goals.calories);
    updateProgressBar('steps-progress', fitnessData.stepsTaken, fitnessData.goals.steps);
    updateProgressBar('active-minutes-progress', fitnessData.activeMinutes, fitnessData.goals.activeMinutes);
}

// Function to update progress bars
function updateProgressBar(id, value, goal) {
    const progressBar = document.getElementById(id);
    const percentage = Math.min((value / goal) * 100, 100);
    progressBar.innerHTML = `<div style="width: ${percentage}%"></div>`;
}

// Function to update the charts
function updateCharts() {
    updateActivityChart();
    updateWeeklyProgressChart();
}

// Function to update the activity chart
function updateActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');
    const activityData = fitnessData.activities.map(activity => activity.duration);
    const activityLabels = fitnessData.activities.map(activity => activity.name);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: activityLabels,
            datasets: [{
                label: 'Activity Duration (minutes)',
                data: activityData,
                backgroundColor: fitnessData.activities.map(activity => {
                    switch (activity.intensity) {
                        case 'low':
                            return 'rgba(75, 192, 192, 0.6)';
                        case 'medium':
                            return 'rgba(255, 206, 86, 0.6)';
                        case 'high':
                            return 'rgba(255, 99, 132, 0.6)';
                        default:
                            return 'rgba(75, 192, 192, 0.6)';
                    }
                }),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to update the weekly progress chart
function updateWeeklyProgressChart() {
    const ctx = document.getElementById('weekly-progress-chart').getContext('2d');
    const weeklyData = getWeeklyData();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.labels,
            datasets: [
                {
                    label: 'Calories Burned',
                    data: weeklyData.calories,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true
                },
                {
                    label: 'Steps Taken',
                    data: weeklyData.steps,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true
                },
                {
                    label: 'Active Minutes',
                    data: weeklyData.activeMinutes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to get weekly data for the chart
function getWeeklyData() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const labels = [];
    const calories = [];
    const steps = [];
    const activeMinutes = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000);
        const dateString = date.toISOString().split('T')[0];
        labels.push(dateString);

        const dayData = fitnessData.history[dateString] || { caloriesBurned: 0, stepsTaken: 0, activeMinutes: 0 };
        calories.push(dayData.caloriesBurned);
        steps.push(dayData.stepsTaken);
        activeMinutes.push(dayData.activeMinutes);
    }

    return { labels, calories, steps, activeMinutes };
}

// Function to save current data to history
function saveToHistory() {
    const today = new Date().toISOString().split('T')[0];
    fitnessData.history[today] = {
        caloriesBurned: fitnessData.caloriesBurned,
        stepsTaken: fitnessData.stepsTaken,
        activeMinutes: fitnessData.activeMinutes,
        activities: [...fitnessData.activities]
    };
    saveToLocalStorage();
}

// Function to load data from history
function loadHistory(date) {
    const historyData = fitnessData.history[date];
    if (historyData) {
        const historyDiv = document.getElementById('history-data');
        historyDiv.innerHTML = `
            <h3>Data for ${date}</h3>
            <p>Calories Burned: ${historyData.caloriesBurned}</p>
            <p>Steps Taken: ${historyData.stepsTaken}</p>
            <p>Active Minutes: ${historyData.activeMinutes}</p>
            <h4>Activities:</h4>
            <ul>
                ${historyData.activities.map(activity => `
                    <li>${activity.name} - ${activity.duration} minutes (${activity.intensity} intensity)</li>
                `).join('')}
            </ul>
        `;
    } else {
        document.getElementById('history-data').innerHTML = '<p>No data available for this date.</p>';
    }
}

// Function to check and update achievements
function checkAchievements() {
    const newAchievements = [];

    if (fitnessData.caloriesBurned >= 1000 && !fitnessData.achievements.includes('1000 Calories Burned')) {
        newAchievements.push('1000 Calories Burned');
    }

    if (fitnessData.stepsTaken >= 10000 && !fitnessData.achievements.includes('10,000 Steps')) {
        newAchievements.push('10,000 Steps');
    }

    if (fitnessData.activeMinutes >= 60 && !fitnessData.achievements.includes('60 Active Minutes')) {
        newAchievements.push('60 Active Minutes');
    }

    if (fitnessData.activities.length >= 5 && !fitnessData.achievements.includes('5 Activities Completed')) {
        newAchievements.push('5 Activities Completed');
    }

    fitnessData.achievements = [...fitnessData.achievements, ...newAchievements];
    updateAchievements();
    
    if (newAchievements.length > 0) {
        alert(`Congratulations! You've earned new achievements: ${newAchievements.join(', ')}`);
    }
}

// Function to update achievements display
function updateAchievements() {
    const achievementList = document.getElementById('achievement-list');
    achievementList.innerHTML = '';
    fitnessData.achievements.forEach(achievement => {
        const div = document.createElement('div');
        div.className = 'achievement';
        div.innerHTML = `
            <i class="fas fa-trophy"></i>
            <h3>${achievement}</h3>
        `;
        achievementList.appendChild(div);
    });
}

// Function to save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('fitnessData', JSON.stringify(fitnessData));
}

// Function to load data from local storage
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('fitnessData');
    if (storedData) {
        fitnessData = JSON.parse(storedData);
    }
}

// Event listener for adding activities
document.getElementById('add-activity-btn').addEventListener('click', () => {
    const name = document.getElementById('activity-name').value;
    const duration = parseInt(document.getElementById('activity-duration').value);
    const intensity = document.getElementById('activity-intensity').value;
    if (name && duration) {
        addActivity(name, duration, intensity);
        document.getElementById('activity-name').value = '';
        document.getElementById('activity-duration').value = '';
        document.getElementById('activity-intensity').value = 'low';
    }
});

// Event listener for setting goals
document.getElementById('set-goals-btn').addEventListener('click', () => {
    const calories = parseInt(document.getElementById('calorie-goal-input').value);
    const steps = parseInt(document.getElementById('step-goal-input').value);
    const activeMinutes = parseInt(document.getElementById('active-minutes-goal-input').value);
    setGoals(calories, steps, activeMinutes);
});

// Event listener for loading history
document.getElementById('load-history-btn').addEventListener('click', () => {
    const date = document.getElementById('history-date').value;
    loadHistory(date);
});

// Function to initialize the dashboard
function initDashboard() {
    loadFromLocalStorage();
    updateDashboard();
}

// Initialize the dashboard
initDashboard();



