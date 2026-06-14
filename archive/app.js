/* ==========================================================================
   CARBON FOOTPRINT AWARENESS PLATFORM - MAIN CORE LOGIC
   ========================================================================== */

// 1. CONSTANTS & EMISSION FACTORS (in kg CO2e)
const EMISSION_FACTORS = {
    electricity: 0.4,       // per kWh
    naturalGas: 2.0,        // per m3
    water: 0.001,           // per liter
    vehicle: {
        petrol: 0.22,       // per km
        diesel: 0.20,       // per km
        hybrid: 0.12,       // per km
        ev: 0.05,           // per km
        none: 0.0
    },
    transit: 0.04,          // per km
    flightShort: 150,       // per flight
    flightLong: 500,        // per flight
    diet: {
        'heavy-meat': 2500, // per year
        'average-meat': 1700,
        'veggie': 1200,
        'vegan': 900
    },
    recyclingOffsets: {
        paper: -50,         // per year
        plastic: -80,
        glass: -40,
        compost: -120
    }
};

// 2. HABITS DATABASE
const HABITS_DATABASE = [
    {
        id: 'ride-bike',
        title: 'Pedal Instead of Petrol',
        description: 'Biked or walked for a short commute instead of driving a personal vehicle.',
        category: 'transport',
        impact: 'High',
        co2Saved: 3.5, // kg
        xpGained: 20,
        icon: '🚲'
    },
    {
        id: 'public-transit',
        title: 'Ride the Green Rail/Bus',
        description: 'Used public transit (bus, train, metro) for your daily commute.',
        category: 'transport',
        impact: 'Medium',
        co2Saved: 2.0,
        xpGained: 15,
        icon: '🚌'
    },
    {
        id: 'carpool',
        title: 'Carpool Companions',
        description: 'Shared a ride with at least one other person to reduce vehicle emissions.',
        category: 'transport',
        impact: 'Medium',
        co2Saved: 1.8,
        xpGained: 12,
        icon: '🚗'
    },
    {
        id: 'cold-wash',
        title: 'Cold Water Cycle',
        description: 'Washed a load of laundry using cold water instead of hot water.',
        category: 'energy',
        impact: 'Low',
        co2Saved: 0.5,
        xpGained: 8,
        icon: '🧼'
    },
    {
        id: 'led-bulbs',
        title: 'Phantom Power Cut',
        description: 'Turned off lights, computers, and appliances when leaving a room.',
        category: 'energy',
        impact: 'Low',
        co2Saved: 0.3,
        xpGained: 5,
        icon: '💡'
    },
    {
        id: 'thermostat',
        title: 'Eco Thermostat Adjust',
        description: 'Adjusted heating down or cooling up by 2°C (4°F) for the day.',
        category: 'energy',
        impact: 'Medium',
        co2Saved: 1.5,
        xpGained: 10,
        icon: '🌡️'
    },
    {
        id: 'unplug',
        title: 'Kill Vampire Draws',
        description: 'Unplugged chargers and standby electronic appliances not in active use.',
        category: 'energy',
        impact: 'Low',
        co2Saved: 0.2,
        xpGained: 5,
        icon: '🔌'
    },
    {
        id: 'meatless-meal',
        title: 'Plant-Based Day',
        description: 'Substituted all meat and dairy with plant-based ingredients for your meals today.',
        category: 'food',
        impact: 'High',
        co2Saved: 4.0,
        xpGained: 25,
        icon: '🥗'
    },
    {
        id: 'no-waste',
        title: 'Empty Plates Club',
        description: 'Planned meals carefully and finished everything, leaving zero food waste.',
        category: 'food',
        impact: 'Low',
        co2Saved: 0.8,
        xpGained: 8,
        icon: '🍽️'
    },
    {
        id: 'local-produce',
        title: 'Eat Local & Fresh',
        description: 'Purchased and consumed foods sourced entirely from local farmers or within 100 miles.',
        category: 'food',
        impact: 'Low',
        co2Saved: 0.5,
        xpGained: 8,
        icon: '🍎'
    },
    {
        id: 'reusable-bag',
        title: 'Bags of Sustainability',
        description: 'Brought your own reusable tote bags for grocery or retail shopping trips.',
        category: 'waste',
        impact: 'Low',
        co2Saved: 0.2,
        xpGained: 5,
        icon: '🛍️'
    },
    {
        id: 'no-single-use',
        title: 'Reusable Hydration',
        description: 'Avoided buying or using single-use plastic water bottles and cups today.',
        category: 'waste',
        impact: 'Low',
        co2Saved: 0.3,
        xpGained: 8,
        icon: '🥤'
    },
    {
        id: 'thrift-buy',
        title: 'Second-hand Savior',
        description: 'Purchased pre-owned clothes or gear instead of buying newly manufactured goods.',
        category: 'waste',
        impact: 'Medium',
        co2Saved: 2.2,
        xpGained: 15,
        icon: '👕'
    }
];

// 3. BADGES LIST
const BADGES_DATABASE = [
    {
        id: 'first-calc',
        title: 'Eco Scout',
        description: 'Completed your first carbon footprint baseline assessment.',
        icon: '⛺'
    },
    {
        id: 'low-carbon',
        title: 'Carbon Minimalist',
        description: 'Achieved a baseline footprint below 5.0 tonnes of CO2e.',
        icon: '🍃'
    },
    {
        id: 'eco-warrior',
        title: 'Eco Warrior',
        description: 'Leveled up your eco profile and reached Level 3.',
        icon: '⚔️'
    },
    {
        id: 'habit-starter',
        title: 'Habit Starter',
        description: 'Successfully committed and logged your first carbon-saving action.',
        icon: '🌱'
    },
    {
        id: 'habit-master',
        title: 'Green Hero',
        description: 'Consistently logged 10 or more carbon-saving actions.',
        icon: '🦸'
    },
    {
        id: 'streak-3',
        title: 'Eco Devotee',
        description: 'Logged actions on at least 3 consecutive days.',
        icon: '🔥'
    },
    {
        id: 'offset-100',
        title: 'Climate Neutralizer',
        description: 'Saved over 100 kg of cumulative carbon dioxide emissions.',
        icon: '🌍'
    },
    {
        id: 'zero-waste-hero',
        title: 'Zero-Waste Champ',
        description: 'Indicated recycling of all materials in your baseline calculator.',
        icon: '♻️'
    }
];

// 4. GLOBAL APP STATE
let state = {
    hasCalculated: false,
    userName: 'Eco Tracker',
    calculatorInputs: {
        electricity: 300,
        gas: 50,
        water: 4000,
        vehicleType: 'petrol',
        vehicleDistance: 120,
        transitDistance: 50,
        flightsShort: 2,
        flightsLong: 1,
        dietType: 'average-meat',
        recycling: ['paper', 'plastic', 'glass']
    },
    footprintByCategories: {
        energy: 0,
        transport: 0,
        food: 0,
        shopping: 0.8 // Static baseline
    },
    totalFootprint: 0,
    streakCount: 0,
    lastActiveDate: '',
    dailyOffset: 0,
    cumulativeSavings: 0,
    xp: 0,
    level: 1,
    loggedHabitsToday: [],
    habitLogs: [],
    unlockedBadges: [],
    theme: 'dark'
};

// CHART OBJECTS TO HANDLE RE-INITIALIZATION GLITCHES
let categoryChartInstance = null;
let comparisonChartInstance = null;

// ==========================================================================
// CORE INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    applyTheme(state.theme);
    initUI();
    updateDashboardUI();
    checkStreaks();
});

// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================
function loadState() {
    const savedState = localStorage.getItem('ecosphere_state');
    if (savedState) {
        try {
            state = { ...state, ...JSON.parse(savedState) };
        } catch (e) {
            console.error('Error loading state from localStorage:', e);
        }
    }
}

function saveState() {
    localStorage.setItem('ecosphere_state', JSON.stringify(state));
}

// ==========================================================================
// STREAKS & DAILY LOG RESET
// ==========================================================================
function checkStreaks() {
    const today = new Date().toISOString().split('T')[0];
    
    if (state.lastActiveDate) {
        const lastDate = new Date(state.lastActiveDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day active! Keep streak going
            // (Wait until they log their first habit today to increment)
        } else if (diffDays > 1) {
            // Broke the streak
            state.streakCount = 0;
        }

        // If a new day has started, reset daily habits offset
        if (state.lastActiveDate !== today) {
            state.dailyOffset = 0;
            state.loggedHabitsToday = [];
            state.lastActiveDate = today;
            saveState();
        }
    } else {
        state.lastActiveDate = today;
        saveState();
    }
}

// ==========================================================================
// CALCULATOR UTILITIES & FORMULAS
// ==========================================================================
function runCarbonCalculations() {
    const inputs = state.calculatorInputs;
    
    // 1. Home Energy (Electricity, Gas, Water)
    const annualElectricityCO2 = (inputs.electricity * 12 * EMISSION_FACTORS.electricity); // kg/yr
    const annualGasCO2 = (inputs.gas * 12 * EMISSION_FACTORS.naturalGas); // kg/yr
    const annualWaterCO2 = (inputs.water * 12 * EMISSION_FACTORS.water); // kg/yr
    const energyTotalTonnes = (annualElectricityCO2 + annualGasCO2 + annualWaterCO2) / 1000;
    
    // 2. Transportation (Vehicle and Transit and Flights)
    const vehicleFactor = EMISSION_FACTORS.vehicle[inputs.vehicleType] || 0;
    const annualVehicleCO2 = (inputs.vehicleDistance * 52 * vehicleFactor); // kg/yr
    const annualTransitCO2 = (inputs.transitDistance * 52 * EMISSION_FACTORS.transit); // kg/yr
    const annualFlightsCO2 = (inputs.flightsShort * EMISSION_FACTORS.flightShort) + (inputs.flightsLong * EMISSION_FACTORS.flightLong); // kg/yr
    const transportTotalTonnes = (annualVehicleCO2 + annualTransitCO2 + annualFlightsCO2) / 1000;

    // 3. Diet & Waste
    const baseDietCO2 = EMISSION_FACTORS.diet[inputs.dietType] || 1700; // kg/yr
    let recyclingOffset = 0;
    inputs.recycling.forEach(material => {
        recyclingOffset += (EMISSION_FACTORS.recyclingOffsets[material] || 0);
    });
    // Ensure the diet & waste footprint does not fall below a realistic 500kg of CO2 per year
    const dietTotalTonnes = Math.max(500, baseDietCO2 + recyclingOffset) / 1000;

    // 4. Shopping baseline
    const shoppingTotalTonnes = state.footprintByCategories.shopping;

    // Set footprint by categories
    state.footprintByCategories.energy = parseFloat(energyTotalTonnes.toFixed(2));
    state.footprintByCategories.transport = parseFloat(transportTotalTonnes.toFixed(2));
    state.footprintByCategories.food = parseFloat(dietTotalTonnes.toFixed(2));

    // Sum total
    const grandTotal = energyTotalTonnes + transportTotalTonnes + dietTotalTonnes + shoppingTotalTonnes;
    state.totalFootprint = parseFloat(grandTotal.toFixed(2));
    state.hasCalculated = true;

    // Check Badges & Achievements
    unlockBadge('first-calc');
    if (state.totalFootprint < 5.0) {
        unlockBadge('low-carbon');
    }
    
    // Zero waste hero check (all recycling boxes checked)
    if (inputs.recycling.includes('paper') && 
        inputs.recycling.includes('plastic') && 
        inputs.recycling.includes('glass') && 
        inputs.recycling.includes('compost')) {
        unlockBadge('zero-waste-hero');
    }

    saveState();
}

// ==========================================================================
// LEVELING & XP SYSTEM
// ==========================================================================
function addXP(amount) {
    state.xp += amount;
    
    // Level formula: Level = floor(XP / 100) + 1
    const newLevel = Math.floor(state.xp / 100) + 1;
    if (newLevel > state.level) {
        state.level = newLevel;
        triggerLevelUpAnimation(newLevel);
    }
    saveState();
}

function triggerLevelUpAnimation(newLevel) {
    // Show toast alert
    showToast('🏆 LEVEL UP!', `You reached Level ${newLevel}! Keep saving carbon to level up further.`);
    
    // Check level achievements
    if (newLevel >= 3) {
        unlockBadge('eco-warrior');
    }
}

// ==========================================================================
// BADGE MILSETONES EVALUATION
// ==========================================================================
function unlockBadge(badgeId) {
    if (!state.unlockedBadges.includes(badgeId)) {
        state.unlockedBadges.push(badgeId);
        
        // Find badge info
        const badge = BADGES_DATABASE.find(b => b.id === badgeId);
        if (badge) {
            // Gain 50 XP bonus for unlocking a badge!
            addXP(50);
            showToast('⭐ BADGE UNLOCKED', `"${badge.title}" - ${badge.description}`);
        }
        saveState();
    }
}

// ==========================================================================
// THEME SWITCHER
// ==========================================================================
function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeText = themeBtn.querySelector('.theme-text');
    
    if (themeName === 'light') {
        themeText.innerText = 'Dark Mode';
    } else {
        themeText.innerText = 'Light Mode';
    }
    state.theme = themeName;
    saveState();
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(title, message) {
    const toast = document.getElementById('achievement-toast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastDesc = document.getElementById('achievement-toast-desc');
    
    toastTitle.innerText = title;
    toastDesc.innerText = message;
    
    toast.classList.remove('hidden');
    toast.classList.remove('fade-out');
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 5000);
}

// ==========================================================================
// HABITS LOGGER ACTIONS
// ==========================================================================
function logHabit(habitId) {
    // Check if already logged today
    if (state.loggedHabitsToday.includes(habitId)) {
        return;
    }
    
    const habit = HABITS_DATABASE.find(h => h.id === habitId);
    if (!habit) return;
    
    // 1. Streak Tracker
    const today = new Date().toISOString().split('T')[0];
    if (state.loggedHabitsToday.length === 0) {
        // First log of the day!
        if (state.lastActiveDate) {
            const lastDate = new Date(state.lastActiveDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                state.streakCount += 1;
            } else {
                state.streakCount = 1;
            }
        } else {
            state.streakCount = 1;
        }
        state.lastActiveDate = today;
    }

    // 2. Add to logs today
    state.loggedHabitsToday.push(habitId);
    
    // 3. Update scores & stats
    state.dailyOffset = parseFloat((state.dailyOffset + habit.co2Saved).toFixed(2));
    state.cumulativeSavings = parseFloat((state.cumulativeSavings + habit.co2Saved).toFixed(2));
    
    // 4. Log history item
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.habitLogs.unshift({
        id: habitId,
        title: habit.title,
        time: timestamp,
        date: today,
        co2Saved: habit.co2Saved,
        xpGained: habit.xpGained
    });

    // 5. Add XP
    addXP(habit.xpGained);

    // 6. Check Badges
    unlockBadge('habit-starter');
    if (state.habitLogs.length >= 10) {
        unlockBadge('habit-master');
    }
    if (state.streakCount >= 3) {
        unlockBadge('streak-3');
    }
    if (state.cumulativeSavings >= 100) {
        unlockBadge('offset-100');
    }

    saveState();
    
    // Update screen UI
    updateDashboardUI();
    renderHabitTrackerView();
    showToast('🌱 ACTION LOGGED', `You saved ${habit.co2Saved}kg of CO2! +${habit.xpGained} XP earned.`);
}

// ==========================================================================
// SCREEN UI RENDERING
// ==========================================================================

// Main Dashboard Updater
function updateDashboardUI() {
    // 1. Text elements
    const nameSpan = document.getElementById('sidebar-user-name');
    const levelSpan = document.getElementById('sidebar-user-level');
    const greeting = document.getElementById('greeting');
    const totalFootprintVal = document.getElementById('total-footprint-value');
    const footprintComparison = document.getElementById('footprint-comparison');
    const dailyOffsetVal = document.getElementById('daily-offset-value');
    const streakText = document.getElementById('streak-text');
    const xpText = document.getElementById('dashboard-xp-text');
    const xpProgress = document.getElementById('dashboard-xp-progress');
    const xpNextLevel = document.getElementById('xp-next-level');

    // Sidebar & Greeting
    nameSpan.innerText = state.userName;
    levelSpan.innerText = `Lvl ${state.level} • ${getLevelName(state.level)}`;
    greeting.innerText = `Hello, ${state.userName}!`;

    // Dynamic Level XP progress bar
    const currentLevelXP = state.xp % 100;
    xpProgress.style.width = `${currentLevelXP}%`;
    xpText.innerText = `Lvl ${state.level} • ${state.xp} XP`;
    xpNextLevel.innerText = `${100 - currentLevelXP} XP to Level ${state.level + 1}`;

    // Streak / Daily Offset
    dailyOffsetVal.innerText = state.dailyOffset.toFixed(1);
    streakText.innerText = `${state.streakCount} day tracking streak`;

    if (state.hasCalculated) {
        document.getElementById('setup-cta-card').classList.add('hidden');
        document.getElementById('analytics-grid').classList.remove('hidden');
        document.getElementById('quick-action-panel').classList.remove('hidden');
        
        totalFootprintVal.innerText = state.totalFootprint.toFixed(1);
        
        // Footprint Comparison Benchmark text
        const diffPercent = Math.abs(((state.totalFootprint - 6.5) / 6.5) * 100).toFixed(0);
        if (state.totalFootprint < 6.5) {
            footprintComparison.innerText = `🍀 ${diffPercent}% lower than the UK/EU average!`;
            footprintComparison.className = 'stat-subtext text-success';
        } else {
            footprintComparison.innerText = `⚠️ ${diffPercent}% higher than the UK/EU average.`;
            footprintComparison.className = 'stat-subtext text-warning';
        }
        
        // Render charts
        renderCharts();
    } else {
        document.getElementById('setup-cta-card').classList.remove('hidden');
        document.getElementById('analytics-grid').classList.add('hidden');
        document.getElementById('quick-action-panel').classList.add('hidden');
        totalFootprintVal.innerText = '--';
        footprintComparison.innerText = 'Complete the calculator to see stats';
    }

    // Render Quick Action Habits List (filtered to 3 uncompleted habits of medium/high impact)
    const quickHabitsContainer = document.getElementById('quick-habits-container');
    quickHabitsContainer.innerHTML = '';
    
    const uncompleted = HABITS_DATABASE.filter(h => !state.loggedHabitsToday.includes(h.id));
    const selection = uncompleted.slice(0, 3);
    
    if (selection.length > 0) {
        selection.forEach(h => {
            const card = document.createElement('div');
            card.className = 'habit-card';
            card.innerHTML = `
                <div class="habit-info-group">
                    <div class="habit-category-icon">${h.icon}</div>
                    <div class="habit-details">
                        <h4>${h.title}</h4>
                        <div class="habit-meta">
                            <span class="habit-badge impact-${h.impact.toLowerCase()}">${h.impact} Impact</span>
                            <span class="habit-badge xp">+${h.xpGained} XP</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-log" onclick="logHabit('${h.id}')">Log</button>
            `;
            quickHabitsContainer.appendChild(card);
        });
    } else {
        quickHabitsContainer.innerHTML = '<p class="empty-state">🎉 You have completed all recommended daily habits today!</p>';
    }
}

// 2. HABIT TRACKER TAB
function renderHabitTrackerView(categoryFilter = 'all') {
    const listContainer = document.getElementById('habits-list-container');
    const cumulativeSavingsSpan = document.getElementById('cumulative-savings');
    const savingsEquivalentSpan = document.getElementById('savings-equivalent');
    const historyContainer = document.getElementById('history-list-container');
    const streakCountSpan = document.getElementById('tracker-streak-count');
    
    streakCountSpan.innerText = `${state.streakCount} Days Active`;
    cumulativeSavingsSpan.innerText = state.cumulativeSavings.toFixed(1);
    
    // Equivalent of planting trees: 1 mature tree absorbs ~22kg of CO2 per year.
    const treeEquivalent = (state.cumulativeSavings / 22).toFixed(1);
    savingsEquivalentSpan.innerHTML = `That's equivalent to planting <strong>${treeEquivalent}</strong> mature trees! 🌲`;

    // Filter habits
    let habits = HABITS_DATABASE;
    if (categoryFilter !== 'all') {
        habits = HABITS_DATABASE.filter(h => h.category === categoryFilter);
    }

    listContainer.innerHTML = '';
    habits.forEach(h => {
        const isLogged = state.loggedHabitsToday.includes(h.id);
        const card = document.createElement('div');
        card.className = `habit-card ${isLogged ? 'logged' : ''}`;
        card.innerHTML = `
            <div class="habit-info-group">
                <div class="habit-category-icon">${h.icon}</div>
                <div class="habit-details">
                    <h4>${h.title}</h4>
                    <p class="card-subtitle" style="margin-bottom:0; margin-top: 2px;">${h.description}</p>
                    <div class="habit-meta" style="margin-top: 8px;">
                        <span class="habit-badge impact-${h.impact.toLowerCase()}">${h.impact} Impact</span>
                        <span class="habit-badge xp">+${h.xpGained} XP</span>
                        <span class="habit-badge" style="background-color: rgba(255,255,255,0.03); color: var(--text-secondary);">${h.co2Saved}kg CO₂e</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-log" ${isLogged ? 'disabled' : `onclick="logHabit('${h.id}')"`}>${isLogged ? 'Logged' : 'Log'}</button>
        `;
        listContainer.appendChild(card);
    });

    // Render activity history feed
    historyContainer.innerHTML = '';
    if (state.habitLogs.length > 0) {
        state.habitLogs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div>
                    <strong>${log.title}</strong>
                    <span style="display:block; color:var(--text-muted); font-size:0.75rem;">+${log.xpGained} XP • ${log.co2Saved}kg CO₂e saved</span>
                </div>
                <span class="timestamp">${log.time}</span>
            `;
            historyContainer.appendChild(item);
        });
    } else {
        historyContainer.innerHTML = '<p class="empty-state">No actions logged yet today. Complete a habit checklist to start your record!</p>';
    }
}

// 3. MILESTONES TAB
function renderMilestonesView() {
    const levelNumSpan = document.getElementById('milestones-level-num');
    const levelNameSpan = document.getElementById('milestones-level-name');
    const xpTextSpan = document.getElementById('milestones-xp-text');
    const xpProgress = document.getElementById('milestones-xp-progress');
    const badgesContainer = document.getElementById('badges-grid-container');

    levelNumSpan.innerText = state.level;
    levelNameSpan.innerText = getLevelName(state.level);
    
    const levelXP = state.xp % 100;
    xpProgress.style.width = `${levelXP}%`;
    xpTextSpan.innerText = `${levelXP} / 100 XP to next level (Total: ${state.xp} XP)`;

    badgesContainer.innerHTML = '';
    BADGES_DATABASE.forEach(badge => {
        const isUnlocked = state.unlockedBadges.includes(badge.id);
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
        badgeCard.innerHTML = `
            <div class="badge-art">${badge.icon}</div>
            <h4>${badge.title}</h4>
            <p>${badge.description}</p>
        `;
        badgesContainer.appendChild(badgeCard);
    });
}

// Helper to resolve level designations
function getLevelName(lvl) {
    if (lvl === 1) return 'Green Novice';
    if (lvl === 2) return 'Eco Apprentice';
    if (lvl === 3) return 'Carbon Guardian';
    if (lvl === 4) return 'Sustainability Champ';
    return 'Climate Leader';
}

// 4. INSIGHTS TAB (GENERATE DYNAMIC ADVICE BASED ON baselines)
function renderInsightsView() {
    const container = document.getElementById('insights-container');
    container.innerHTML = '';
    
    if (!state.hasCalculated) {
        container.innerHTML = `
            <div class="card glass" style="grid-column: 1 / -1; padding: 40px; text-align: center;">
                <h3>Baseline Calculator Required</h3>
                <p style="margin-top: 12px; margin-bottom: 20px;">We generate personalized carbon reduction recommendations based on your unique consumption numbers. Complete your baseline configuration first.</p>
                <button class="btn btn-primary" onclick="openCalculatorModal()">Open Calculator</button>
            </div>
        `;
        return;
    }

    const categories = [
        { key: 'energy', title: 'Home Utility & Energy', icon: '🏠', colorClass: 'energy' },
        { key: 'transport', title: 'Transportation & Flights', icon: '🚗', colorClass: 'transport' },
        { key: 'food', title: 'Diet & Consumption', icon: '🥗', colorClass: 'food' }
    ];

    // Order by emission score (descending) to highlight the highest first
    const sortedCategories = [...categories].sort((a, b) => {
        return state.footprintByCategories[b.key] - state.footprintByCategories[a.key];
    });

    sortedCategories.forEach((cat, index) => {
        const score = state.footprintByCategories[cat.key];
        const pct = ((score / state.totalFootprint) * 100).toFixed(0);
        const card = document.createElement('div');
        card.className = `insight-card card glass ${cat.colorClass}`;
        
        let priority = 'Medium Priority';
        let priorityClass = 'text-warning';
        if (index === 0) {
            priority = 'High Priority (Main Emitter)';
            priorityClass = 'text-danger';
        } else if (score < 1.0) {
            priority = 'Low Priority';
            priorityClass = 'text-success';
        }

        // Custom tips based on category
        let description = '';
        let bulletTips = [];

        if (cat.key === 'energy') {
            description = `Your utilities account for <strong>${score} t CO₂e</strong> (${pct}% of your footprint). Heating, hot water, and electricity represent quick opportunities for optimization.`;
            bulletTips = [
                'Upgrade home heating/cooling insulation (saves up to 15% energy loss)',
                'Swap all incandescent bulbs for high-efficiency LED replacements',
                'Lower heating thermostat to 19°C (66°F) and use layers indoors',
                'If available, transition utility bills to a 100% green energy supply program'
            ];
        } else if (cat.key === 'transport') {
            description = `Transport is generating <strong>${score} t CO₂e</strong> (${pct}% of your footprint). Transit fuels and flights are highly carbon-intensive.`;
            bulletTips = [
                'Replace short vehicle trips (<5km) with walking or bike riding',
                'Consolidate flights or explore vacationing closer to home via rail',
                'Switch next vehicle replacement to an EV or plug-in hybrid model',
                'Maintain proper tire inflation to improve gas mileage efficiency by 3%'
            ];
        } else {
            description = `Diet and waste consumption totals <strong>${score} t CO₂e</strong> (${pct}% of your footprint). Animal protein and food waste represent high greenhouse gases.`;
            bulletTips = [
                'Try a "Meatless Monday" or replace beef/lamb dishes with chicken or legumes',
                'Compost organic waste to prevent landfill methane generation',
                'Plan weekly groceries in advance to reduce food spoilage',
                'Carry reusable hydration vessels and avoid single-use packaging'
            ];
        }

        card.innerHTML = `
            <div class="insight-card-header">
                <span class="cat" style="color: var(--text-primary); font-size: 1rem;">${cat.icon} ${cat.title}</span>
                <span class="impact ${priorityClass}" style="background-color:rgba(255,255,255,0.03); font-weight:700;">${priority}</span>
            </div>
            <h3>${score.toFixed(1)} Tonnes of CO₂e/yr</h3>
            <p>${description}</p>
            <div class="suggestion-actions">
                <span>Recommended Actions:</span>
                <ul>
                    ${bulletTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
        container.appendChild(card);
    });
}

// ==========================================================================
// VISUAL CHARTS GRAPHICS (CHART.JS IMPLEMENTATION)
// ==========================================================================
function renderCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') return;

    // Check light/dark modes colors for charts
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.05)';

    // Category Breakdown Donut Chart
    const ctxCategory = document.getElementById('emissionsCategoryChart').getContext('2d');
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    categoryChartInstance = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: ['Home Utilities', 'Transportation', 'Diet & Waste', 'Shopping Baseline'],
            datasets: [{
                data: [
                    state.footprintByCategories.energy,
                    state.footprintByCategories.transport,
                    state.footprintByCategories.food,
                    state.footprintByCategories.shopping
                ],
                backgroundColor: [
                    '#3b82f6', // Sky Blue for utilities
                    '#f59e0b', // Amber/Yellow for Transport
                    '#10b981', // Emerald for Food
                    '#8b5cf6'  // Purple for shopping baseline
                ],
                borderColor: isDark ? '#1e293b' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { family: 'Outfit', size: 12, weight: '500' },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw.toFixed(1)} t CO2e/yr`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });

    // Comparison Bar Chart
    const ctxCompare = document.getElementById('emissionsCompareChart').getContext('2d');
    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
    }
    comparisonChartInstance = new Chart(ctxCompare, {
        type: 'bar',
        data: {
            labels: ['Paris Target', 'Global Avg', 'UK/EU Avg', 'Your Baseline', 'US Avg'],
            datasets: [{
                label: 'Tonnes CO₂e per capita / year',
                data: [2.0, 4.8, 6.5, state.totalFootprint, 14.5],
                backgroundColor: function(context) {
                    const label = context.chart.data.labels[context.dataIndex];
                    if (label === 'Your Baseline') {
                        return '#10b981'; // Green for the user
                    }
                    if (label === 'Paris Target') {
                        return '#3b82f6'; // Blue target
                    }
                    return 'rgba(148, 163, 184, 0.4)'; // Gray for other benchmarks
                },
                borderRadius: 6,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` ${context.raw.toFixed(1)} tonnes CO2e`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Inter', size: 10 } },
                    title: {
                        display: true,
                        text: 't CO₂e / Year',
                        color: textColor,
                        font: { family: 'Outfit', size: 11, weight: '600' }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: textColor, font: { family: 'Outfit', size: 11, weight: '600' } }
                }
            }
        }
    });
}

// ==========================================================================
// INTERACTIVE MODAL WIZARD CONTROLLER (CALCULATOR)
// ==========================================================================
let currentWizardStep = 1;

function openCalculatorModal() {
    currentWizardStep = 1;
    showWizardStep(1);
    
    // Load existing values into form inputs if calculator was run before
    const inputs = state.calculatorInputs;
    
    document.getElementById('calc-user-name').value = state.userName;
    document.getElementById('home-electricity').value = inputs.electricity;
    document.getElementById('home-gas').value = inputs.gas;
    document.getElementById('home-water').value = inputs.water;
    document.getElementById('vehicle-type').value = inputs.vehicleType;
    document.getElementById('vehicle-distance').value = inputs.vehicleDistance;
    document.getElementById('transit-distance').value = inputs.transitDistance;
    document.getElementById('flights-short').value = inputs.flightsShort;
    document.getElementById('flights-long').value = inputs.flightsLong;
    document.getElementById('diet-type').value = inputs.dietType;
    
    document.getElementById('recycle-paper').checked = inputs.recycling.includes('paper');
    document.getElementById('recycle-plastic').checked = inputs.recycling.includes('plastic');
    document.getElementById('recycle-glass').checked = inputs.recycling.includes('glass');
    document.getElementById('recycle-compost').checked = inputs.recycling.includes('compost');

    document.getElementById('calculator-modal').classList.remove('hidden');
}

function closeCalculatorModal() {
    document.getElementById('calculator-modal').classList.add('hidden');
    updateDashboardUI();
}

function showWizardStep(step) {
    currentWizardStep = step;
    
    // Hide all steps
    document.querySelectorAll('.modal-step').forEach(stepDiv => {
        stepDiv.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Update progress bar
    const progressPct = step * 20; // 5 steps total, 20% increments
    document.getElementById('modal-progress-bar').style.width = `${progressPct}%`;
    
    // Update step indicator labels
    document.querySelectorAll('.step-label').forEach((label, idx) => {
        if (idx < step) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}

function saveWizardStepData(step) {
    if (step === 1) {
        const nameVal = document.getElementById('calc-user-name').value.trim();
        if (nameVal) {
            state.userName = nameVal;
        }
    } else if (step === 2) {
        state.calculatorInputs.electricity = parseFloat(document.getElementById('home-electricity').value) || 0;
        state.calculatorInputs.gas = parseFloat(document.getElementById('home-gas').value) || 0;
        state.calculatorInputs.water = parseFloat(document.getElementById('home-water').value) || 0;
    } else if (step === 3) {
        state.calculatorInputs.vehicleType = document.getElementById('vehicle-type').value;
        state.calculatorInputs.vehicleDistance = parseFloat(document.getElementById('vehicle-distance').value) || 0;
        state.calculatorInputs.transitDistance = parseFloat(document.getElementById('transit-distance').value) || 0;
        state.calculatorInputs.flightsShort = parseInt(document.getElementById('flights-short').value) || 0;
        state.calculatorInputs.flightsLong = parseInt(document.getElementById('flights-long').value) || 0;
    } else if (step === 4) {
        state.calculatorInputs.dietType = document.getElementById('diet-type').value;
        
        // Assemble recycling checklist
        const recycling = [];
        if (document.getElementById('recycle-paper').checked) recycling.push('paper');
        if (document.getElementById('recycle-plastic').checked) recycling.push('plastic');
        if (document.getElementById('recycle-glass').checked) recycling.push('glass');
        if (document.getElementById('recycle-compost').checked) recycling.push('compost');
        state.calculatorInputs.recycling = recycling;

        // Perform main carbon engine calculations
        runCarbonCalculations();
        
        // Update results visual
        document.getElementById('calc-total-co2').innerText = state.totalFootprint.toFixed(1);
        
        const verdict = document.getElementById('calc-verdict-text');
        if (state.totalFootprint < 4.0) {
            verdict.innerText = '🌱 Excellent! Your footprint is low and close to sustainable levels.';
            verdict.className = 'calc-verdict text-success';
        } else if (state.totalFootprint <= 8.5) {
            verdict.innerText = '🔔 Moderate footprint. You can cut down easily with simple daily habit shifts.';
            verdict.className = 'calc-verdict text-warning';
        } else {
            verdict.innerText = '⚠️ Higher than average footprint. Focus on transportation and utility actions.';
            verdict.className = 'calc-verdict text-danger';
        }
    }
}

// ==========================================================================
// NAVIGATION & ELEMENT EVENT LISTENERS INITIALIZATION
// ==========================================================================
function initUI() {
    // Navigation routing switching tabs
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Render view specifically
            if (targetId === 'tracker-section') {
                renderHabitTrackerView();
            } else if (targetId === 'milestones-section') {
                renderMilestonesView();
            } else if (targetId === 'insights-section') {
                renderInsightsView();
            } else {
                updateDashboardUI();
            }
        });
    });

    // Theme Toggle Handler
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        // Redraw charts with new label colors if in dashboard tab
        if (document.getElementById('dashboard-section').classList.contains('active')) {
            renderCharts();
        }
    });

    // Calculator Modals controls
    document.getElementById('start-calc-cta').addEventListener('click', openCalculatorModal);
    document.getElementById('recalculate-btn').addEventListener('click', openCalculatorModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeCalculatorModal);
    document.getElementById('btn-close-calc').addEventListener('click', closeCalculatorModal);

    // Modal Wizard transitions
    document.getElementById('btn-next-1').addEventListener('click', () => {
        saveWizardStepData(1);
        showWizardStep(2);
    });
    
    document.getElementById('btn-prev-2').addEventListener('click', () => {
        showWizardStep(1);
    });
    document.getElementById('btn-next-2').addEventListener('click', () => {
        saveWizardStepData(2);
        showWizardStep(3);
    });

    document.getElementById('btn-prev-3').addEventListener('click', () => {
        showWizardStep(2);
    });
    document.getElementById('btn-next-3').addEventListener('click', () => {
        saveWizardStepData(3);
        showWizardStep(4);
    });

    document.getElementById('btn-prev-4').addEventListener('click', () => {
        showWizardStep(3);
    });
    document.getElementById('btn-next-4').addEventListener('click', () => {
        saveWizardStepData(4);
        showWizardStep(5);
    });

    // Habits filter tab handlers
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderHabitTrackerView(tab.getAttribute('data-category'));
        });
    });

    // Dashboard "View All Habits" link button redirects to habits tab
    document.getElementById('view-all-habits').addEventListener('click', () => {
        document.getElementById('nav-tracker').click();
    });
}
