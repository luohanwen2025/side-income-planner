// ============================================
// App State
// ============================================

const AppState = {
    currentStep: 1,
    totalSteps: 5,
    answers: {
        step1: {},
        step2: {},
        step3: {}
    },
    generatedBlueprint: null
};

// ============================================
// DOM Elements
// ============================================

const Elements = {
    // Progress
    progressFill: document.getElementById('progress-fill'),
    currentStepSpan: document.getElementById('current-step'),
    totalStepsSpan: document.getElementById('total-steps'),

    // Step containers
    stepContainers: document.querySelectorAll('.step-container'),

    // Step 1
    step1Skills: document.getElementById('step1-skills'),
    step1Interests: document.getElementById('step1-interests'),
    step1Time: document.getElementById('step1-time'),
    step1WorkTypeRadios: document.getElementsByName('work-type'),

    // Step 2
    step2Income: document.getElementById('step2-income'),
    step2Timeline: document.getElementById('step2-timeline'),

    // Step 3
    step3Enjoy: document.getElementById('step3-enjoy'),
    step3Avoid: document.getElementById('step3-avoid'),

    // Review
    reviewStep1: document.getElementById('review-step1'),
    reviewStep2: document.getElementById('review-step2'),
    reviewStep3: document.getElementById('review-step3'),

    // Screens
    loadingScreen: document.getElementById('loading-screen'),
    errorScreen: document.getElementById('error-screen'),
    errorTitle: document.getElementById('error-title'),
    errorMessage: document.getElementById('error-message'),
    retryButton: document.getElementById('retry-button'),
    backButton: document.getElementById('back-button'),

    // Blueprint
    blueprintContent: document.getElementById('blueprint-content'),
    saveButton: document.getElementById('save-button'),
    newPlanButton: document.getElementById('new-plan-button'),
    savedPlansSection: document.getElementById('saved-plans-section'),
    savedPlansList: document.getElementById('saved-plans-list'),

    // Navigation buttons
    nextButtons: document.querySelectorAll('.next-button'),
    prevButtons: document.querySelectorAll('.prev-button'),
    generateButton: document.querySelector('.generate-button'),

    // Example toggles
    exampleToggles: document.querySelectorAll('.example-toggle')
};

// ============================================
// Initialize App
// ============================================

function init() {
    // Set total steps
    Elements.totalStepsSpan.textContent = AppState.totalSteps;

    // Load saved state if exists
    loadState();

    // Setup event listeners
    setupEventListeners();

    // Update UI
    updateProgress();
    showStep(AppState.currentStep);
}

function setupEventListeners() {
    // Next buttons
    Elements.nextButtons.forEach(button => {
        button.addEventListener('click', handleNext);
    });

    // Previous buttons
    Elements.prevButtons.forEach(button => {
        button.addEventListener('click', handlePrevious);
    });

    // Generate button
    if (Elements.generateButton) {
        Elements.generateButton.addEventListener('click', handleGenerate);
    }

    // Example toggles
    Elements.exampleToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleExample);
    });

    // Save button
    if (Elements.saveButton) {
        Elements.saveButton.addEventListener('click', saveBlueprint);
    }

    // New plan button
    if (Elements.newPlanButton) {
        Elements.newPlanButton.addEventListener('click', resetApp);
    }

    // Retry button
    if (Elements.retryButton) {
        Elements.retryButton.addEventListener('click', handleGenerate);
    }

    // Back button
    if (Elements.backButton) {
        Elements.backButton.addEventListener('click', () => {
            hideScreen('error-screen');
            showStep(AppState.currentStep);
        });
    }
}

// ============================================
// Navigation
// ============================================

function handleNext() {
    // Validate current step
    if (!validateStep(AppState.currentStep)) {
        return;
    }

    // Save answers
    saveStepAnswers(AppState.currentStep);

    // Move to next step
    if (AppState.currentStep < AppState.totalSteps) {
        AppState.currentStep++;
        updateProgress();

        // If going to review step, populate it
        if (AppState.currentStep === 4) {
            populateReview();
        }

        showStep(AppState.currentStep);
        saveState();
    }
}

function handlePrevious() {
    if (AppState.currentStep > 1) {
        AppState.currentStep--;
        updateProgress();
        showStep(AppState.currentStep);
        saveState();
    }
}

function showStep(stepNumber) {
    // Hide all steps
    Elements.stepContainers.forEach(container => {
        container.classList.add('hidden');
    });

    // Show current step
    const currentContainer = document.querySelector(`.step-container[data-step="${stepNumber}"]`);
    if (currentContainer) {
        currentContainer.classList.remove('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
    const percentage = ((AppState.currentStep - 1) / (AppState.totalSteps - 1)) * 100;
    Elements.progressFill.style.width = `${percentage}%`;
    Elements.currentStepSpan.textContent = AppState.currentStep;
}

// ============================================
// Validation
// ============================================

function validateStep(stepNumber) {
    let isValid = true;
    let errorMessage = '';

    switch(stepNumber) {
        case 1:
            if (!Elements.step1Skills.value.trim()) {
                isValid = false;
                errorMessage = 'Please describe your skills.';
            } else if (!Elements.step1Interests.value.trim()) {
                isValid = false;
                errorMessage = 'Please describe your interests.';
            } else if (!Elements.step1Time.value || Elements.step1Time.value < 1) {
                isValid = false;
                errorMessage = 'Please enter a valid number of hours.';
            }
            break;

        case 2:
            if (!Elements.step2Income.value.trim()) {
                isValid = false;
                errorMessage = 'Please enter your income target.';
            } else if (!Elements.step2Timeline.value.trim()) {
                isValid = false;
                errorMessage = 'Please enter your timeline.';
            }
            break;

        case 3:
            if (!Elements.step3Enjoy.value.trim()) {
                isValid = false;
                errorMessage = 'Please describe what work energizes you.';
            }
            break;
    }

    if (!isValid) {
        alert(errorMessage);
    }

    return isValid;
}

// ============================================
// Save & Load State
// ============================================

function saveStepAnswers(stepNumber) {
    switch(stepNumber) {
        case 1:
            AppState.answers.step1 = {
                skills: Elements.step1Skills.value.trim(),
                interests: Elements.step1Interests.value.trim(),
                time: Elements.step1Time.value.trim(),
                workType: Array.from(Elements.step1WorkTypeRadios).find(radio => radio.checked)?.value || 'online'
            };
            break;

        case 2:
            AppState.answers.step2 = {
                income: Elements.step2Income.value.trim(),
                timeline: Elements.step2Timeline.value.trim()
            };
            break;

        case 3:
            AppState.answers.step3 = {
                enjoy: Elements.step3Enjoy.value.trim(),
                avoid: Elements.step3Avoid.value.trim()
            };
            break;
    }
}

function populateReview() {
    const step1 = AppState.answers.step1;
    const step2 = AppState.answers.step2;
    const step3 = AppState.answers.step3;

    Elements.reviewStep1.innerHTML = `
        <strong>Skills:</strong> ${step1.skills}<br>
        <strong>Interests:</strong> ${step1.interests}<br>
        <strong>Time Available:</strong> ${step1.time} hours/week<br>
        <strong>Preference:</strong> ${step1.workType.charAt(0).toUpperCase() + step1.workType.slice(1)} work
    `;

    Elements.reviewStep2.innerHTML = `
        <strong>Income Target:</strong> ${step2.income}/month<br>
        <strong>Timeline:</strong> First dollar in ${step2.timeline}
    `;

    Elements.reviewStep3.innerHTML = `
        <strong>Energizes me:</strong> ${step3.enjoy}<br>
        ${step3.avoid ? `<strong>Drains me:</strong> ${step3.avoid}` : ''}
    `;
}

function saveState() {
    try {
        const state = {
            currentStep: AppState.currentStep,
            answers: AppState.answers
        };
        localStorage.setItem('sideIncomePlanner_state', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem('sideIncomePlanner_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            AppState.currentStep = state.currentStep || 1;
            AppState.answers = state.answers || {};

            // Populate form fields
            if (AppState.answers.step1) {
                Elements.step1Skills.value = AppState.answers.step1.skills || '';
                Elements.step1Interests.value = AppState.answers.step1.interests || '';
                Elements.step1Time.value = AppState.answers.step1.time || '';
                if (AppState.answers.step1.workType) {
                    const radio = Array.from(Elements.step1WorkTypeRadios)
                        .find(r => r.value === AppState.answers.step1.workType);
                    if (radio) radio.checked = true;
                }
            }

            if (AppState.answers.step2) {
                Elements.step2Income.value = AppState.answers.step2.income || '';
                Elements.step2Timeline.value = AppState.answers.step2.timeline || '';
            }

            if (AppState.answers.step3) {
                Elements.step3Enjoy.value = AppState.answers.step3.enjoy || '';
                Elements.step3Avoid.value = AppState.answers.step3.avoid || '';
            }
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

// ============================================
// Example Toggles
// ============================================

function toggleExample(event) {
    const toggle = event.currentTarget;
    const content = toggle.nextElementSibling;
    toggle.classList.toggle('active');
    content.classList.toggle('hidden');
}

// ============================================
// Generate Blueprint
// ============================================

async function handleGenerate() {
    // Save final answers
    saveStepAnswers(3);

    // Show loading screen
    showScreen('loading-screen');

    try {
        // Call the API
        const response = await fetch('/api/generate-blueprint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answers: AppState.answers
            })
        });

        const data = await response.json();

        // Hide loading screen
        hideScreen('loading-screen');

        if (data.success) {
            // Store the blueprint
            AppState.generatedBlueprint = data.data;

            // Display the blueprint
            displayBlueprint(data.data);

            // Move to results step
            AppState.currentStep = 5;
            showStep(5);

            // Clear saved state (they've completed the flow)
            localStorage.removeItem('sideIncomePlanner_state');

            // Load saved plans
            loadSavedPlans();
        } else {
            // Show error
            showError(data.error || 'Failed to generate blueprint. Please try again.');
        }

    } catch (error) {
        console.error('Error generating blueprint:', error);
        hideScreen('loading-screen');
        showError('Network error. Please check your connection and try again.');
    }
}

function displayBlueprint(blueprint) {
    // Convert markdown-like content to HTML
    const htmlContent = formatBlueprintToHTML(blueprint);
    Elements.blueprintContent.innerHTML = htmlContent;
}

function formatBlueprintToHTML(blueprint) {
    let html = '';

    // User Context
    if (blueprint.userContext) {
        html += `<h2>User Context</h2>`;
        html += `<p>${blueprint.userContext}</p>`;
    }

    // Opportunity Map
    if (blueprint.opportunityMap && Array.isArray(blueprint.opportunityMap)) {
        html += `<h2>Opportunity Map</h2>`;
        html += `<ul>`;
        blueprint.opportunityMap.forEach(opp => {
            html += `<li><strong>${opp.title || opp}</strong>${opp.description ? `: ${opp.description}` : ''}</li>`;
        });
        html += `</ul>`;
    }

    // Idea Evaluation
    if (blueprint.ideaEvaluation && Array.isArray(blueprint.ideaEvaluation)) {
        html += `<h2>Idea Evaluation</h2>`;
        blueprint.ideaEvaluation.forEach(evaluation => {
            html += `<h3>${evaluation.idea || 'Idea'}</h3>`;
            html += `<p><strong>Fit:</strong> ${evaluation.fit || ''}</p>`;
            html += `<p><strong>Feasibility:</strong> ${evaluation.feasibility || ''}</p>`;
            html += `<p><strong>Financial Potential:</strong> ${evaluation.financialPotential || ''}</p>`;
        });
    }

    // Chosen Opportunity
    if (blueprint.chosenOpportunity) {
        html += `<h2>Chosen Opportunity</h2>`;
        html += `<p>${blueprint.chosenOpportunity}</p>`;
    }

    // Quick Validation Plan
    if (blueprint.quickValidationPlan) {
        html += `<h2>Quick Validation Plan</h2>`;
        html += `<p>${blueprint.quickValidationPlan}</p>`;
    }

    // Action Plan
    if (blueprint.actionPlan) {
        html += `<h2>Action Plan</h2>`;
        html += `<p>${blueprint.actionPlan}</p>`;
    }

    // Sustainability System
    if (blueprint.sustainabilitySystem) {
        html += `<h2>Sustainability System</h2>`;
        html += `<p>${blueprint.sustainabilitySystem}</p>`;
    }

    // Reflection Prompts
    if (blueprint.reflectionPrompts && Array.isArray(blueprint.reflectionPrompts)) {
        html += `<h2>Reflection Prompts</h2>`;
        html += `<ol>`;
        blueprint.reflectionPrompts.forEach(prompt => {
            html += `<li>${prompt}</li>`;
        });
        html += `</ol>`;
    }

    // Closing Encouragement
    if (blueprint.closingEncouragement) {
        html += `<h2>Closing Encouragement</h2>`;
        html += `<p>${blueprint.closingEncouragement}</p>`;
    }

    return html;
}

// ============================================
// Error Handling
// ============================================

function showError(message) {
    Elements.errorMessage.textContent = message;
    showScreen('error-screen');
}

function showScreen(screenId) {
    // Hide all steps
    Elements.stepContainers.forEach(container => {
        container.classList.add('hidden');
    });

    // Hide other screens
    Elements.loadingScreen.classList.add('hidden');
    Elements.errorScreen.classList.add('hidden');

    // Show requested screen
    document.getElementById(screenId).classList.remove('hidden');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
    }
}

// ============================================
// Save & Load Plans
// ============================================

function saveBlueprint() {
    if (!AppState.generatedBlueprint) {
        alert('No blueprint to save.');
        return;
    }

    try {
        // Get existing plans
        const plans = getSavedPlans();

        // Create new plan object
        const newPlan = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            answers: AppState.answers,
            blueprint: AppState.generatedBlueprint
        };

        // Add to beginning of array
        plans.unshift(newPlan);

        // Keep only last 10 plans
        if (plans.length > 10) {
            plans.splice(10);
        }

        // Save to localStorage
        localStorage.setItem('sideIncomePlanner_savedPlans', JSON.stringify(plans));

        // Show success message
        alert('Blueprint saved successfully!');

        // Reload the list
        loadSavedPlans();

    } catch (error) {
        console.error('Error saving blueprint:', error);
        alert('Failed to save blueprint. Please try again.');
    }
}

function getSavedPlans() {
    try {
        const saved = localStorage.getItem('sideIncomePlanner_savedPlans');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error getting saved plans:', error);
        return [];
    }
}

function loadSavedPlans() {
    const plans = getSavedPlans();

    if (plans.length === 0) {
        Elements.savedPlansSection.classList.add('hidden');
        return;
    }

    Elements.savedPlansSection.classList.remove('hidden');
    Elements.savedPlansList.innerHTML = '';

    plans.forEach(plan => {
        const planElement = createPlanElement(plan);
        Elements.savedPlansList.appendChild(planElement);
    });
}

function createPlanElement(plan) {
    const div = document.createElement('div');
    div.className = 'saved-plan-item';

    const date = new Date(plan.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Extract a preview from the blueprint
    let preview = '';
    if (plan.blueprint.chosenOpportunity) {
        preview = plan.blueprint.chosenOpportunity.substring(0, 150) + '...';
    } else if (plan.answers.step1 && plan.answers.step1.skills) {
        preview = `Skills: ${plan.answers.step1.skills.substring(0, 100)}...`;
    }

    div.innerHTML = `
        <div class="saved-plan-header">
            <span class="saved-plan-title">Blueprint from ${formattedDate}</span>
            <span class="saved-plan-date">${formattedDate}</span>
        </div>
        <div class="saved-plan-preview">${preview}</div>
        <div class="saved-plan-actions">
            <button class="btn btn-secondary btn-sm load-plan" data-id="${plan.id}">View</button>
            <button class="btn btn-secondary btn-sm delete-plan" data-id="${plan.id}">Delete</button>
        </div>
    `;

    // Add event listeners
    const loadButton = div.querySelector('.load-plan');
    const deleteButton = div.querySelector('.delete-plan');

    loadButton.addEventListener('click', () => loadPlan(plan.id));
    deleteButton.addEventListener('click', () => deletePlan(plan.id));

    return div;
}

function loadPlan(planId) {
    const plans = getSavedPlans();
    const plan = plans.find(p => p.id === planId);

    if (plan) {
        AppState.generatedBlueprint = plan.blueprint;
        displayBlueprint(plan.blueprint);

        // Scroll to blueprint
        Elements.blueprintContent.scrollIntoView({ behavior: 'smooth' });
    }
}

function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this blueprint?')) {
        return;
    }

    try {
        const plans = getSavedPlans();
        const filteredPlans = plans.filter(p => p.id !== planId);

        localStorage.setItem('sideIncomePlanner_savedPlans', JSON.stringify(filteredPlans));

        // Reload the list
        loadSavedPlans();

    } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan. Please try again.');
    }
}

// ============================================
// Reset App
// ============================================

function resetApp() {
    if (!confirm('Start a new plan? This will clear your current progress.')) {
        return;
    }

    // Reset state
    AppState.currentStep = 1;
    AppState.answers = {
        step1: {},
        step2: {},
        step3: {}
    };
    AppState.generatedBlueprint = null;

    // Clear form fields
    Elements.step1Skills.value = '';
    Elements.step1Interests.value = '';
    Elements.step1Time.value = '';
    Array.from(Elements.step1WorkTypeRadios).forEach(r => r.checked = false);

    Elements.step2Income.value = '';
    Elements.step2Timeline.value = '';

    Elements.step3Enjoy.value = '';
    Elements.step3Avoid.value = '';

    // Clear saved state
    localStorage.removeItem('sideIncomePlanner_state');

    // Update UI
    updateProgress();
    showStep(1);
    loadSavedPlans();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', init);
