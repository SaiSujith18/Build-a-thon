// Application State
let currentUser = null;
let users = [];
let actions = [];
let userChallenges = [];
let currentTipIndex = 0;

// Sample Data
const sampleUsers = [
    {"id": 1, "username": "EcoWarrior", "email": "eco@example.com", "password": "eco123", "points": 245, "streak": 12, "actionsCount": 28},
    {"id": 2, "username": "GreenStudent", "email": "green@example.com", "password": "green123", "points": 189, "streak": 8, "actionsCount": 22},
    {"id": 3, "username": "SustainabilityPro", "email": "sustain@example.com", "password": "sustain123", "points": 312, "streak": 15, "actionsCount": 35}
];

const ecoTips = [
    {"id": 1, "title": "Reusable Water Bottles", "description": "Switch to reusable water bottles to reduce plastic waste", "category": "Waste"},
    {"id": 2, "title": "Take the Stairs", "description": "Use stairs instead of elevators to save energy", "category": "Energy"},
    {"id": 3, "title": "Bike to Campus", "description": "Cycle or walk instead of driving to reduce emissions", "category": "Transport"},
    {"id": 4, "title": "Unplug Devices", "description": "Unplug chargers and electronics when not in use", "category": "Energy"},
    {"id": 5, "title": "Shorter Showers", "description": "Take shorter showers to conserve water", "category": "Water"},
    {"id": 6, "title": "Meal Planning", "description": "Plan meals to reduce food waste", "category": "Food"},
    {"id": 7, "title": "Digital Receipts", "description": "Choose digital receipts over printed ones", "category": "Waste"},
    {"id": 8, "title": "LED Bulbs", "description": "Replace incandescent bulbs with LED lights", "category": "Energy"}
];

const challenges = [
    {"id": 1, "title": "Plastic-Free Week", "description": "Avoid single-use plastics for 7 days", "targetPoints": 50, "duration": "7 days", "category": "Waste"},
    {"id": 2, "title": "Energy Saver", "description": "Reduce energy consumption daily", "targetPoints": 100, "duration": "14 days", "category": "Energy"},
    {"id": 3, "title": "Green Commuter", "description": "Use sustainable transport methods", "targetPoints": 75, "duration": "10 days", "category": "Transport"},
    {"id": 4, "title": "Water Warrior", "description": "Implement water conservation practices", "targetPoints": 60, "duration": "7 days", "category": "Water"}
];

const achievements = [
    {"id": 1, "title": "First Steps", "description": "Log your first sustainable action", "icon": "🌱", "requirement": 1, "type": "actions"},
    {"id": 2, "title": "Week Warrior", "description": "Maintain a 7-day streak", "icon": "🔥", "requirement": 7, "type": "streak"},
    {"id": 3, "title": "Century Club", "description": "Earn 100 points", "icon": "💯", "requirement": 100, "type": "points"},
    {"id": 4, "title": "Action Hero", "description": "Log 50 actions", "icon": "🦸", "requirement": 50, "type": "actions"},
    {"id": 5, "title": "Eco Champion", "description": "Earn 500 points", "icon": "🏆", "requirement": 500, "type": "points"}
];

const categoryIcons = {
    "transport": "🚲",
    "energy": "⚡",
    "waste": "♻️",
    "water": "💧",
    "food": "🥗",
    "other": "🌍"
};

// Utility Functions
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showError(message) {
    const authError = document.getElementById('auth-error');
    authError.textContent = message;
    authError.classList.add('show');
    setTimeout(() => authError.classList.remove('show'), 5000);
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function calculateStreak(userActions) {
    if (userActions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique dates when user logged actions
    const actionDates = [...new Set(userActions.map(action => {
        const date = new Date(action.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }))].sort((a, b) => b - a);
    
    if (actionDates.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check if there's an action today or yesterday to start counting
    for (let i = 0; i < actionDates.length; i++) {
        const actionDate = new Date(actionDates[i]);
        
        if (actionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (actionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Data Management
function loadData() {
    try {
        users = JSON.parse(localStorage.getItem('sustainabilityUsers') || '[]');
        actions = JSON.parse(localStorage.getItem('sustainabilityActions') || '[]');
        userChallenges = JSON.parse(localStorage.getItem('sustainabilityUserChallenges') || '[]');
        
        // Initialize with sample users if empty
        if (users.length === 0) {
            users = [...sampleUsers];
            saveData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        users = [...sampleUsers];
        actions = [];
        userChallenges = [];
        saveData();
    }
}

function saveData() {
    try {
        localStorage.setItem('sustainabilityUsers', JSON.stringify(users));
        localStorage.setItem('sustainabilityActions', JSON.stringify(actions));
        localStorage.setItem('sustainabilityUserChallenges', JSON.stringify(userChallenges));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function getCurrentSession() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}

function setCurrentSession(user) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Error setting session:', error);
    }
}

function clearCurrentSession() {
    try {
        localStorage.removeItem('currentUser');
    } catch (error) {
        console.error('Error clearing session:', error);
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    console.log('Login attempt for:', username);
    
    if (!username || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    const user = users.find(u => u.username === username);
    if (!user) {
        showError('User not found');
        return;
    }
    
    // Simple password check (in real app, would be hashed)
    if (user.password !== password) {
        showError('Invalid password');
        return;
    }
    
    currentUser = user;
    setCurrentSession(user);
    showDashboard();
    showToast(`Welcome back, ${user.username}!`);
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Register form submitted');
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    console.log('Register attempt for:', username, email);
    
    if (!username || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        showError('Username already exists');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        showError('Email already registered');
        return;
    }
    
    const newUser = {
        id: generateId(),
        username,
        email,
        password,
        points: 0,
        streak: 0,
        actionsCount: 0,
        joinDate: new Date().toISOString()
    };
    
    users.push(newUser);
    currentUser = newUser;
    setCurrentSession(newUser);
    saveData();
    showDashboard();
    showToast(`Welcome to Sustainability Tracker, ${username}!`);
}

function handleLogout() {
    currentUser = null;
    clearCurrentSession();
    showAuth();
    showToast('Logged out successfully');
}

// UI Navigation
function showAuth() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

function showDashboard() {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Initialize dashboard components
    updateDashboard();
    setTimeout(() => {
        initTipsCarousel();
        initSocialSharing();
    }, 100);
}

// Dashboard Updates
function updateDashboard() {
    if (!currentUser) return;
    
    console.log('Updating dashboard for user:', currentUser.username);
    
    // Update user info in header
    document.getElementById('user-name').textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById('user-points').textContent = currentUser.points;
    document.getElementById('user-streak').textContent = currentUser.streak;
    
    // Update stats
    document.getElementById('streak-display').textContent = currentUser.streak;
    document.getElementById('total-points').textContent = currentUser.points;
    document.getElementById('total-actions').textContent = currentUser.actionsCount;
    
    updateAchievements();
    updateLeaderboard();
    updateChallenges();
    updateRecentActions();
}

function updateUserStats() {
    const userActions = actions.filter(a => a.userId === currentUser.id);
    currentUser.points = userActions.reduce((sum, action) => sum + action.points, 0);
    currentUser.actionsCount = userActions.length;
    currentUser.streak = calculateStreak(userActions);
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = { ...currentUser };
    }
    
    saveData();
    updateDashboard();
}

// Action Logging
function handleActionSubmit(e) {
    e.preventDefault();
    
    console.log('Action form submitted');
    
    const category = document.getElementById('action-category').value;
    const description = document.getElementById('action-description').value.trim();
    const points = parseInt(document.getElementById('action-points').value);
    const notes = document.getElementById('action-notes').value.trim();
    const photoInput = document.getElementById('action-photo');
    
    if (!category || !description || points < 1 || points > 10) {
        showToast('Please fill all required fields correctly');
        return;
    }
    
    const newAction = {
        id: generateId(),
        userId: currentUser.id,
        category,
        description,
        points,
        notes,
        date: new Date().toISOString(),
        photo: photoInput.files[0] ? URL.createObjectURL(photoInput.files[0]) : null
    };
    
    actions.push(newAction);
    updateUserStats();
    
    // Reset form
    document.getElementById('action-form').reset();
    
    showToast(`Action logged! +${points} points`);
    checkNewAchievements();
}

// Achievements
function updateAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    achievements.forEach(achievement => {
        const isEarned = checkAchievement(achievement);
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${isEarned ? 'earned' : ''}`;
        badge.title = achievement.description;
        
        badge.innerHTML = `
            <span class="achievement-icon">${achievement.icon}</span>
            <span>${achievement.title}</span>
        `;
        
        container.appendChild(badge);
    });
}

function checkAchievement(achievement) {
    switch (achievement.type) {
        case 'points':
            return currentUser.points >= achievement.requirement;
        case 'actions':
            return currentUser.actionsCount >= achievement.requirement;
        case 'streak':
            return currentUser.streak >= achievement.requirement;
        default:
            return false;
    }
}

function checkNewAchievements() {
    achievements.forEach(achievement => {
        if (checkAchievement(achievement)) {
            const earnedBadges = JSON.parse(localStorage.getItem('earnedAchievements') || '[]');
            const key = `${currentUser.id}-${achievement.id}`;
            
            if (!earnedBadges.includes(key)) {
                earnedBadges.push(key);
                localStorage.setItem('earnedAchievements', JSON.stringify(earnedBadges));
                showToast(`🎉 Achievement unlocked: ${achievement.title}!`);
            }
        }
    });
}

// Leaderboard
function updateLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    
    container.innerHTML = '';
    
    sortedUsers.slice(0, 5).forEach((user, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${user.id === currentUser.id ? 'current-user' : ''}`;
        
        item.innerHTML = `
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${user.username}</span>
            <span class="leaderboard-points">${user.points} pts</span>
        `;
        
        container.appendChild(item);
    });
}

// Eco Tips Carousel
function initTipsCarousel() {
    const container = document.getElementById('tips-container');
    const prevBtn = document.querySelector('.carousel-btn--prev');
    const nextBtn = document.querySelector('.carousel-btn--next');
    
    if (!container || !prevBtn || !nextBtn) return;
    
    function renderTips() {
        container.innerHTML = '';
        ecoTips.forEach(tip => {
            const card = document.createElement('div');
            card.className = 'tip-card';
            card.innerHTML = `
                <h4>${tip.title}</h4>
                <p>${tip.description}</p>
                <small>Category: ${tip.category}</small>
            `;
            container.appendChild(card);
        });
    }
    
    function updateCarousel() {
        if (container.children.length === 0) return;
        const cardWidth = container.children[0].offsetWidth + 16; // gap
        container.style.transform = `translateX(-${currentTipIndex * cardWidth}px)`;
    }
    
    prevBtn.addEventListener('click', () => {
        currentTipIndex = Math.max(0, currentTipIndex - 1);
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        currentTipIndex = Math.min(ecoTips.length - 1, currentTipIndex + 1);
        updateCarousel();
    });
    
    renderTips();
    updateCarousel();
    
    // Auto-advance carousel
    setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % ecoTips.length;
        updateCarousel();
    }, 5000);
}

// Challenges
function updateChallenges() {
    const container = document.getElementById('challenges-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    challenges.forEach(challenge => {
        const userChallenge = userChallenges.find(uc => uc.userId === currentUser.id && uc.challengeId === challenge.id);
        const userCategoryActions = actions.filter(a => 
            a.userId === currentUser.id && 
            a.category === challenge.category.toLowerCase()
        );
        const categoryPoints = userCategoryActions.reduce((sum, action) => sum + action.points, 0);
        const progress = Math.min(100, (categoryPoints / challenge.targetPoints) * 100);
        
        const item = document.createElement('div');
        item.className = 'challenge-item';
        
        item.innerHTML = `
            <div class="challenge-header">
                <div>
                    <h4 class="challenge-title">${challenge.title}</h4>
                    <div class="challenge-duration">${challenge.duration}</div>
                </div>
                ${!userChallenge ? `<button class="btn btn--primary challenge-join-btn" data-challenge-id="${challenge.id}">Join</button>` : '<span class="status status--success">Joined</span>'}
            </div>
            <p class="challenge-description">${challenge.description}</p>
            <div class="challenge-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="challenge-target">${categoryPoints}/${challenge.targetPoints} points</div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Add event listeners for join buttons
    container.querySelectorAll('.challenge-join-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const challengeId = parseInt(e.target.dataset.challengeId);
            joinChallenge(challengeId);
        });
    });
}

function joinChallenge(challengeId) {
    const existingChallenge = userChallenges.find(uc => uc.userId === currentUser.id && uc.challengeId === challengeId);
    if (existingChallenge) return;
    
    userChallenges.push({
        id: generateId(),
        userId: currentUser.id,
        challengeId: challengeId,
        joinDate: new Date().toISOString()
    });
    
    saveData();
    updateChallenges();
    showToast('Challenge joined successfully!');
}

// Recent Actions
function updateRecentActions() {
    const container = document.getElementById('recent-actions-container');
    if (!container) return;
    
    const userActions = actions
        .filter(a => a.userId === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    container.innerHTML = '';
    
    if (userActions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No actions logged yet. Start by logging your first sustainable action!</p>
            </div>
        `;
        return;
    }
    
    userActions.forEach(action => {
        const item = document.createElement('div');
        item.className = 'action-item fade-in';
        
        item.innerHTML = `
            <span class="action-category-icon">${categoryIcons[action.category]}</span>
            <div class="action-content">
                <div class="action-description">${action.description}</div>
                <div class="action-meta">${formatDate(action.date)} • ${action.category}</div>
            </div>
            <span class="action-points">+${action.points}</span>
            <button class="action-delete" data-action-id="${action.id}" title="Delete action">🗑️</button>
        `;
        
        container.appendChild(item);
    });
    
    // Add delete functionality
    container.querySelectorAll('.action-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actionId = e.target.dataset.actionId;
            deleteAction(actionId);
        });
    });
}

function deleteAction(actionId) {
    if (confirm('Are you sure you want to delete this action?')) {
        actions = actions.filter(a => a.id !== actionId);
        updateUserStats();
        showToast('Action deleted successfully');
    }
}

// Social Sharing
function initSocialSharing() {
    const shareBtn = document.getElementById('share-achievement');
    const copyBtn = document.getElementById('copy-link');
    const exportBtn = document.getElementById('export-data');
    const shareModal = document.getElementById('share-modal');
    const shareNativeBtn = document.getElementById('share-native');
    const shareCopyBtn = document.getElementById('share-copy');
    const modalClose = document.querySelector('.modal-close');
    
    if (!shareBtn || !shareModal) return;
    
    shareBtn.addEventListener('click', () => {
        document.getElementById('share-points').textContent = currentUser.points;
        document.getElementById('share-streak').textContent = currentUser.streak;
        shareModal.classList.add('show');
    });
    
    modalClose.addEventListener('click', () => {
        shareModal.classList.remove('show');
    });
    
    shareNativeBtn.addEventListener('click', async () => {
        const text = `I've earned ${currentUser.points} points and maintained a ${currentUser.streak} day streak on my sustainability journey! 🌱`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Sustainability Achievement',
                    text: text,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Achievement copied to clipboard!');
            });
        }
        shareModal.classList.remove('show');
    });
    
    shareCopyBtn.addEventListener('click', () => {
        const text = document.getElementById('share-text').textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Text copied to clipboard!');
            shareModal.classList.remove('show');
        });
    });
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!');
        });
    });
    
    exportBtn.addEventListener('click', exportUserData);
}

function exportUserData() {
    const userActions = actions.filter(a => a.userId === currentUser.id);
    const data = {
        user: currentUser,
        actions: userActions,
        challenges: userChallenges.filter(uc => uc.userId === currentUser.id),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sustainability-data-${currentUser.username}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
}

// Theme Management
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-color-scheme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    });
}

// Auth Tab Management
function initAuthTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            console.log('Tab clicked:', tab);
            
            // Update tab buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update forms
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            const targetForm = document.getElementById(`${tab}-form`);
            if (targetForm) {
                targetForm.classList.add('active');
            }
            
            // Clear error
            const authError = document.getElementById('auth-error');
            if (authError) {
                authError.classList.remove('show');
            }
        });
    });
}

// Event Listeners
function initEventListeners() {
    console.log('Initializing event listeners');
    
    // Auth forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Dashboard
    const logoutBtn = document.getElementById('logout-btn');
    const actionForm = document.getElementById('action-form');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (actionForm) {
        actionForm.addEventListener('submit', handleActionSubmit);
    }
    
    // Modal backdrop click
    const shareModal = document.getElementById('share-modal');
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                modal.classList.remove('show');
            }
        }
    });
}

// Initialize Application
function init() {
    console.log('Initializing Sustainability Tracker application');
    
    loadData();
    initAuthTabs();
    initEventListeners();
    initThemeToggle();
    
    // Check if user is already logged in
    const session = getCurrentSession();
    if (session) {
        currentUser = users.find(u => u.id === session.id);
        if (currentUser) {
            console.log('User session found, showing dashboard');
            showDashboard();
        } else {
            console.log('Invalid session, clearing and showing auth');
            clearCurrentSession();
            showAuth();
        }
    } else {
        console.log('No session found, showing auth');
        showAuth();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application');
    init();
});