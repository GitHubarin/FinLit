/* ==========================================
   FinLit.ch - Interactive Application Logic
   ========================================== */

// Global state
let currentTheme = 'dark';
let currentLanguage = 'de'; // German is default

document.addEventListener('DOMContentLoaded', () => {
    // Language Management (Initialize first to set up static content)
    initLanguage();

    // Theme Management
    initTheme();

    // Navigation Initialization
    initNavigation();

    // General Compounding Calculator Initialization
    initCompoundingCalculator();

    // Swiss Pillars & Inflation Simulator Initialization
    initSwissSimulator();

    // Guide Widgets Initialization
    initGuideWidgets();

    // Investment Options Comparison Initialization
    initComparison();
});

/* ==========================================
   Language Management (DE / EN)
   ========================================== */
function initLanguage() {
    const btnDe = document.getElementById('lang-btn-de');
    const btnEn = document.getElementById('lang-btn-en');
    const savedLang = localStorage.getItem('language');

    if (savedLang) {
        currentLanguage = savedLang;
    } else {
        // Default to German
        currentLanguage = 'de';
    }

    applyLanguage(currentLanguage);

    btnDe.addEventListener('click', () => {
        if (currentLanguage !== 'de') {
            currentLanguage = 'de';
            applyLanguage('de');
            localStorage.setItem('language', 'de');
            triggerRecalculations();
        }
    });

    btnEn.addEventListener('click', () => {
        if (currentLanguage !== 'en') {
            currentLanguage = 'en';
            applyLanguage('en');
            localStorage.setItem('language', 'en');
            triggerRecalculations();
        }
    });
}

function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    
    // Toggle active state on language buttons
    const btnDe = document.getElementById('lang-btn-de');
    const btnEn = document.getElementById('lang-btn-en');
    
    if (lang === 'de') {
        btnDe.classList.add('active');
        btnEn.classList.remove('active');
    } else {
        btnEn.classList.add('active');
        btnDe.classList.remove('active');
    }

    // Translate dynamic headings (top header) and theme toggles
    updateHeaderTitle();
    updateThemeLabel();
}

function triggerRecalculations() {
    // Redraw compounding calc
    if (typeof calculateCompounding === 'function') {
        calculateCompounding();
    }
    // Redraw Swiss pillars & inflation
    if (typeof calculateSwissScenarios === 'function') {
        calculateSwissScenarios();
    }
    // Update guide widgets if inputs exist
    if (typeof updateAllGuideWidgets === 'function') {
        updateAllGuideWidgets();
    }
    // Redraw options comparison (also refreshes localized dropdown labels)
    if (typeof refreshComparisonLabels === 'function') {
        refreshComparisonLabels();
    }
    if (typeof calculateComparison === 'function') {
        calculateComparison();
    }
}

/* ==========================================
   Theme Handler (Dark/Light Mode)
   ========================================== */
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        currentTheme = prefersLight ? 'light' : 'dark';
    }

    applyTheme(currentTheme);

    themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateChartThemes();
    });
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeLabel();
}

function updateThemeLabel() {
    const themeLabel = document.getElementById('theme-label-text');
    if (!themeLabel) return;
    
    if (currentLanguage === 'de') {
        themeLabel.textContent = currentTheme === 'dark' ? 'Dunkelmodus' : 'Hellmodus';
    } else {
        themeLabel.textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
}

// Chart color helpers based on active theme
function getThemeChartConfig() {
    const isDark = currentTheme === 'dark';
    return {
        textColor: isDark ? '#94a3b8' : '#64748b',
        gridColor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipColor: isDark ? '#f8fafc' : '#0f172a',
        tooltipBorder: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.8)'
    };
}

function updateChartThemes() {
    const config = getThemeChartConfig();
    
    [compoundingChartInstance, scenariosChartInstance, compareChartInstance].forEach(chart => {
        if (chart) {
            chart.options.scales.x.grid.color = config.gridColor;
            chart.options.scales.x.ticks.color = config.textColor;
            chart.options.scales.y.grid.color = config.gridColor;
            chart.options.scales.y.ticks.color = config.textColor;
            chart.options.plugins.legend.labels.color = config.textColor;
            chart.options.plugins.tooltip.backgroundColor = config.tooltipBg;
            chart.options.plugins.tooltip.titleColor = config.tooltipColor;
            chart.options.plugins.tooltip.bodyColor = config.textColor;
            chart.options.plugins.tooltip.borderColor = config.tooltipBorder;
            chart.update();
        }
    });
}

/* ==========================================
   Navigation (Tabs & Mobile Sidebar)
   ========================================== */
let activeNavId = 'nav-calc';

const headerTitles = {
    de: {
        'nav-calc': { title: 'Zinseszins-Rechner', subtitle: 'Beobachten Sie, wie Ihr Geld über Zeit exponentiell wächst' },
        'nav-swiss': { title: 'Säulen & Inflation', subtitle: 'Vergleichen Sie Sparen im Bankkonto mit Säule 3a Steuervorteilen und Investitionen' },
        'nav-compare': { title: 'Anlageoptionen vergleichen', subtitle: 'Stellen Sie zwei Sparformen gegenüber – inklusive Säule 3a, Säule 3b und Risiko-Bandbreite' },
        'nav-guide': { title: 'Finanzwissen-Leitfaden', subtitle: 'Meistern Sie Zinseszins, Inflation und das Schweizer 3-Säulen-System' }
    },
    en: {
        'nav-calc': { title: 'Compounding Interest Calculator', subtitle: 'Watch your money grow exponentially over time' },
        'nav-swiss': { title: 'Swiss Pillars & Inflation', subtitle: 'Compare saving in cash against Pillar 3a tax deductions and investing' },
        'nav-compare': { title: 'Compare Investment Options', subtitle: 'Put two ways of saving head to head – including Pillar 3a, Pillar 3b and a risk range' },
        'nav-guide': { title: 'Financial Literacy Guide', subtitle: 'Master compounding, inflation, and the Swiss 3-Pillar system' }
    }
};

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close mobile sidebar if open
            sidebar.classList.remove('open');

            // Set active nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Show active section
            const targetSection = item.getAttribute('href').replace('#', 'section-');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            // Update Navigation State
            activeNavId = item.id;
            updateHeaderTitle();
            // Redraw the now-visible section's chart so it sizes correctly
            refreshActiveChart(item.id);
        });
    });

    // Restore desktop sidebar collapse preference
    const appContainer = document.querySelector('.app-container');
    if (localStorage.getItem('sidebarCollapsed') === 'true' && window.innerWidth > 768) {
        appContainer.classList.add('sidebar-collapsed');
    }

    // Sidebar Toggle: slide-in overlay on mobile, collapse on desktop/web
    mobileToggle.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        } else {
            appContainer.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', appContainer.classList.contains('sidebar-collapsed'));
            refreshActiveChart(activeNavId);
        }
    });

    // Close sidebar when clicking main content (only on mobile)
    document.querySelector('.main-content').addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !e.target.closest('#mobile-toggle')) {
            sidebar.classList.remove('open');
        }
    });
}

function updateHeaderTitle() {
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    if (!pageTitle || !pageSubtitle) return;

    const navDict = headerTitles[currentLanguage] || headerTitles['de'];
    const currentMeta = navDict[activeNavId];
    
    if (currentMeta) {
        pageTitle.textContent = currentMeta.title;
        pageSubtitle.textContent = currentMeta.subtitle;
    }
}

// Re-render the chart of the section that just became visible (or after a
// layout change), so Chart.js measures the canvas at its real size.
function refreshActiveChart(navId) {
    requestAnimationFrame(() => {
        if (navId === 'nav-calc' && typeof calculateCompounding === 'function') calculateCompounding();
        else if (navId === 'nav-swiss' && typeof calculateSwissScenarios === 'function') calculateSwissScenarios();
        else if (navId === 'nav-compare' && typeof calculateComparison === 'function') calculateComparison();
    });
}

/* ==========================================
   Input Synchronization Utility
   ========================================== */
function syncInputs(sliderId, numberId, callback) {
    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);

    if (!slider || !number) return;

    slider.addEventListener('input', () => {
        number.value = slider.value;
        callback();
    });

    number.addEventListener('input', () => {
        let val = parseFloat(number.value);
        if (isNaN(val)) val = 0;
        
        // Clamp input value based on slider min/max
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        
        slider.value = Math.min(Math.max(val, min), max);
        callback();
    });
}

/* ==========================================
   General Compounding Calculator Logic
   ========================================== */
let compoundingChartInstance = null;

function initCompoundingCalculator() {
    const callback = calculateCompounding;

    syncInputs('calc-principal', 'calc-principal-num', callback);
    syncInputs('calc-contribution', 'calc-contribution-num', callback);
    syncInputs('calc-rate', 'calc-rate-num', callback);
    syncInputs('calc-years', 'calc-years-num', callback);

    document.getElementById('calc-contrib-freq').addEventListener('change', callback);
    document.getElementById('calc-compounding').addEventListener('change', callback);

    // Initial run
    calculateCompounding();
}

function calculateCompounding() {
    const principal = parseFloat(document.getElementById('calc-principal-num').value) || 0;
    const contribution = parseFloat(document.getElementById('calc-contribution-num').value) || 0;
    const rate = (parseFloat(document.getElementById('calc-rate-num').value) || 0) / 100;
    const years = parseInt(document.getElementById('calc-years-num').value) || 1;
    const contribFreq = parseInt(document.getElementById('calc-contrib-freq').value) || 12;
    const compoundFreq = parseInt(document.getElementById('calc-compounding').value) || 12;

    const labels = [];
    const principalData = [];
    const contributionsData = [];
    const interestData = [];

    let currentBalance = principal;
    let totalContributions = principal;

    const yrLabel = currentLanguage === 'de' ? 'Jahr' : 'Year';
    labels.push(`${yrLabel} 0`);
    principalData.push(principal);
    contributionsData.push(0);
    interestData.push(0);

    for (let y = 1; y <= years; y++) {
        // Compound calculations over the year
        const periodsPerYear = compoundFreq;
        const ratePerPeriod = rate / periodsPerYear;
        
        const contributionsPerYear = contribFreq;
        const annualContribution = contribution * contributionsPerYear;
        const contributionPerPeriod = annualContribution / periodsPerYear;

        for (let p = 0; p < periodsPerYear; p++) {
            currentBalance = currentBalance * (1 + ratePerPeriod) + contributionPerPeriod;
            totalContributions += contributionPerPeriod;
        }

        const totalInterest = currentBalance - totalContributions;
        
        labels.push(`${yrLabel} ${y}`);
        principalData.push(principal);
        contributionsData.push(totalContributions - principal);
        interestData.push(Math.max(0, totalInterest));
    }

    const finalBalance = currentBalance;
    const finalContributions = totalContributions;
    const finalInterest = Math.max(0, finalBalance - finalContributions);
    const compoundRatio = finalBalance > 0 ? (finalInterest / finalBalance) * 100 : 0;

    // Update KPIs
    document.getElementById('metric-future-val').textContent = formatCurrency(finalBalance);
    document.getElementById('metric-total-contrib').textContent = formatCurrency(finalContributions);
    document.getElementById('metric-total-interest').textContent = formatCurrency(finalInterest);
    document.getElementById('metric-ratio').textContent = `${compoundRatio.toFixed(1)}%`;

    // Draw Chart
    drawCompoundingChart(labels, principalData, contributionsData, interestData);
}

function drawCompoundingChart(labels, principalData, contributionsData, interestData) {
    const ctx = document.getElementById('compoundingChart').getContext('2d');
    const colors = getThemeChartConfig();

    const dsLabels = {
        de: { principal: 'Startkapital', contrib: 'Beiträge', interest: 'Zinsertrag' },
        en: { principal: 'Principal', contrib: 'Contributions', interest: 'Interest Earned' }
    };
    const currentDsLabels = dsLabels[currentLanguage] || dsLabels['de'];

    if (compoundingChartInstance) {
        compoundingChartInstance.destroy();
    }

    compoundingChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: currentDsLabels.principal,
                    data: principalData,
                    backgroundColor: '#3b82f6', // Primary Blue
                    stack: 'Stack 0',
                },
                {
                    label: currentDsLabels.contrib,
                    data: contributionsData,
                    backgroundColor: 'rgba(59, 130, 246, 0.4)', // Muted Blue
                    stack: 'Stack 0',
                },
                {
                    label: currentDsLabels.interest,
                    data: interestData,
                    backgroundColor: '#10b981', // Secondary Green
                    stack: 'Stack 0',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use custom HTML legend
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        maxTicksLimit: 12
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        callback: function(value) {
                            return value >= 1000 ? (value / 1000) + 'k' : value;
                        }
                    }
                }
            }
        }
    });
}

/* ==========================================
   Swiss Pillars & Inflation Simulator Logic
   ========================================== */
let scenariosChartInstance = null;

function initSwissSimulator() {
    const callback = calculateSwissScenarios;

    syncInputs('swiss-annual-contrib', 'swiss-annual-contrib-num', callback);
    syncInputs('swiss-tax-rate', 'swiss-tax-rate-num', callback);
    syncInputs('swiss-years', 'swiss-years-num', callback);
    syncInputs('swiss-inflation', 'swiss-inflation-num', callback);
    syncInputs('swiss-bank-rate', 'swiss-bank-rate-num', callback);
    syncInputs('swiss-market-rate', 'swiss-market-rate-num', callback);

    // Initial calculation
    calculateSwissScenarios();
}

function calculateSwissScenarios() {
    const annualContrib = parseFloat(document.getElementById('swiss-annual-contrib-num').value) || 0;
    const taxRate = (parseFloat(document.getElementById('swiss-tax-rate-num').value) || 0) / 100;
    const years = parseInt(document.getElementById('swiss-years-num').value) || 1;
    const inflation = (parseFloat(document.getElementById('swiss-inflation-num').value) || 0) / 100;
    const bankRate = (parseFloat(document.getElementById('swiss-bank-rate-num').value) || 0) / 100;
    const marketRate = (parseFloat(document.getElementById('swiss-market-rate-num').value) || 0) / 100;

    const labels = [];
    const bankRealData = [];
    const private3bRealData = [];
    const cash3aRealData = [];
    const inv3aRealData = [];

    // Initial states
    let bankNominal = 0;
    let cash3aNominal = 0;
    let inv3aNominal = 0;
    let private3bNominal = 0;
    let accumulatedTaxSavingsNominal = 0;

    const yrLabel = currentLanguage === 'de' ? 'Jahr' : 'Year';
    labels.push(`${yrLabel} 0`);
    bankRealData.push(0);
    private3bRealData.push(0);
    cash3aRealData.push(0);
    inv3aRealData.push(0);

    const taxSavingsPerYear = annualContrib * taxRate;

    for (let y = 1; y <= years; y++) {
        // Scenario A: Standard Bank Savings Account (Pillar 3b Cash)
        bankNominal = bankNominal * (1 + bankRate) + annualContrib;
        const bankReal = bankNominal / Math.pow(1 + inflation, y);

        // Scenario B: Pillar 3b Invested (Global ETFs, compounding at market return rate, no tax relief)
        private3bNominal = private3bNominal * (1 + marketRate) + annualContrib;
        const private3bReal = private3bNominal / Math.pow(1 + inflation, y);

        // Scenario C: Pillar 3a Cash Account
        // Capital accumulates at bank rate, tax savings accumulate in bank account
        cash3aNominal = cash3aNominal * (1 + bankRate) + annualContrib;
        accumulatedTaxSavingsNominal = accumulatedTaxSavingsNominal * (1 + bankRate) + taxSavingsPerYear;
        const cash3aReal = (cash3aNominal + accumulatedTaxSavingsNominal) / Math.pow(1 + inflation, y);

        // Scenario D: Pillar 3a Invested
        // Capital accumulates at market rate, tax savings accumulate in bank account
        inv3aNominal = inv3aNominal * (1 + marketRate) + annualContrib;
        const inv3aReal = (inv3aNominal + accumulatedTaxSavingsNominal) / Math.pow(1 + inflation, y);

        labels.push(`${yrLabel} ${y}`);
        bankRealData.push(bankReal);
        private3bRealData.push(private3bReal);
        cash3aRealData.push(cash3aReal);
        inv3aRealData.push(inv3aReal);
    }

    // Final values
    const finalBankNom = bankNominal;
    const finalBankReal = bankNominal / Math.pow(1 + inflation, years);
    const finalPrivate3bNom = private3bNominal;
    const finalPrivate3bReal = private3bNominal / Math.pow(1 + inflation, years);
    const finalCash3aNom = cash3aNominal;
    const finalCash3aReal = (cash3aNominal + accumulatedTaxSavingsNominal) / Math.pow(1 + inflation, years);
    const finalInv3aNom = inv3aNominal;
    const finalInv3aReal = (inv3aNominal + accumulatedTaxSavingsNominal) / Math.pow(1 + inflation, years);

    const lostPurchasingPower = finalBankNom - finalBankReal;
    const totalTaxSavings = taxSavingsPerYear * years;
    const netAdvantageVsBank = finalInv3aReal - finalBankReal;

    // Update Card 1: Bank Account
    document.getElementById('scenario-bank-nominal').textContent = formatCurrency(finalBankNom);
    document.getElementById('scenario-bank-real').textContent = formatCurrency(finalBankReal);
    if (currentLanguage === 'de') {
        document.getElementById('scenario-bank-loss').innerHTML = `<span>⚠️ Kaufkraftverlust: <strong>${formatCurrency(lostPurchasingPower)}</strong></span>`;
    } else {
        document.getElementById('scenario-bank-loss').innerHTML = `<span>⚠️ Lost Purchasing Power: <strong>${formatCurrency(lostPurchasingPower)}</strong></span>`;
    }

    // Update Card 2: Pillar 3b Invested
    document.getElementById('scenario-3b-nominal').textContent = formatCurrency(finalPrivate3bNom);
    document.getElementById('scenario-3b-real').textContent = formatCurrency(finalPrivate3bReal);
    if (currentLanguage === 'de') {
        document.getElementById('scenario-3b-tax').innerHTML = `<span>🔓 Flexibler Zugriff (Kein Lock-up)</span>`;
    } else {
        document.getElementById('scenario-3b-tax').innerHTML = `<span>🔓 Flexible Access (No Lock-up)</span>`;
    }

    // Update Card 3: Pillar 3a Cash
    document.getElementById('scenario-3a-cash-nominal').textContent = formatCurrency(finalCash3aNom);
    document.getElementById('scenario-3a-cash-real').textContent = formatCurrency(finalCash3aReal);
    if (currentLanguage === 'de') {
        document.getElementById('scenario-3a-cash-gain').innerHTML = `<span>💰 Steuerersparnis gesamt: <strong>${formatCurrency(totalTaxSavings)}</strong></span>`;
    } else {
        document.getElementById('scenario-3a-cash-gain').innerHTML = `<span>💰 Total Tax Saved: <strong>${formatCurrency(totalTaxSavings)}</strong></span>`;
    }

    // Update Card 4: Pillar 3a Invested
    document.getElementById('scenario-3a-inv-nominal').textContent = formatCurrency(finalInv3aNom);
    document.getElementById('scenario-3a-inv-real').textContent = formatCurrency(finalInv3aReal);
    if (currentLanguage === 'de') {
        document.getElementById('scenario-3a-inv-tax').innerHTML = `<span>🚀 Vorteil vs. Bank: <strong>+${formatCurrency(netAdvantageVsBank)}</strong></span>`;
    } else {
        document.getElementById('scenario-3a-inv-tax').innerHTML = `<span>🚀 Advantage vs Bank: <strong>+${formatCurrency(netAdvantageVsBank)}</strong></span>`;
    }

    // Draw scenarios chart
    drawScenariosChart(labels, bankRealData, private3bRealData, cash3aRealData, inv3aRealData);
}

function drawScenariosChart(labels, bankReal, private3bReal, cash3aReal, inv3aReal) {
    const ctx = document.getElementById('scenariosChart').getContext('2d');
    const colors = getThemeChartConfig();

    const dsLabels = {
        de: {
            bank: 'Bank-Sparkonto (Realer Wert)',
            private3b: 'Säule 3b Investiert (Real)',
            cash3a: '3a Sparkonto + Steuervorteil (Real)',
            inv3a: '3a Investiert + Steuervorteil (Real)'
        },
        en: {
            bank: 'Bank Savings (Real Value)',
            private3b: 'Pillar 3b Invested (Real)',
            cash3a: '3a Cash + Tax Savings (Real)',
            inv3a: '3a Invested + Tax Savings (Real)'
        }
    };
    const currentDsLabels = dsLabels[currentLanguage] || dsLabels['de'];

    if (scenariosChartInstance) {
        scenariosChartInstance.destroy();
    }

    scenariosChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: currentDsLabels.bank,
                    data: bankReal,
                    borderColor: '#ef4444', // Red
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: false,
                    borderWidth: 2,
                    tension: 0.15,
                    pointRadius: 0
                },
                {
                    label: currentDsLabels.private3b,
                    data: private3bReal,
                    borderColor: '#3b82f6', // Blue
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1.5,
                    tension: 0.15,
                    pointRadius: 0
                },
                {
                    label: currentDsLabels.cash3a,
                    data: cash3aReal,
                    borderColor: '#f59e0b', // Yellow
                    fill: false,
                    borderWidth: 2,
                    tension: 0.15,
                    pointRadius: 0
                },
                {
                    label: currentDsLabels.inv3a,
                    data: inv3aReal,
                    borderColor: '#10b981', // Emerald Green
                    fill: true,
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    borderWidth: 3,
                    tension: 0.15,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Custom HTML legend
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label.split(' (')[0]}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        maxTicksLimit: 12
                    }
                },
                y: {
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        callback: function(value) {
                            return value >= 1000 ? (value / 1000) + 'k' : value;
                        }
                    }
                }
            }
        }
    });
}

/* ==========================================
   Financial Guide Interactive Widgets
   ========================================== */
function initGuideWidgets() {
    // 1. Guide Menu Tab Switching
    const tabBtns = document.querySelectorAll('.guide-tab-btn');
    const tabContents = document.querySelectorAll('.guide-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // 2. Rule of 72 Estimators
    const ruleInputDe = document.getElementById('rule72-rate-de');
    const ruleResultDe = document.getElementById('rule72-result-de');
    const ruleInputEn = document.getElementById('rule72-rate-en');
    const ruleResultEn = document.getElementById('rule72-result-en');

    const setupRule72 = (input, result) => {
        if (!input || !result) return;
        const calc = () => {
            const rate = parseFloat(input.value) || 0;
            if (rate <= 0) {
                result.textContent = currentLanguage === 'de' ? 'Nie' : 'Never';
                return;
            }
            const years = 72 / rate;
            const unit = currentLanguage === 'de' ? 'Jahre' : 'Years';
            result.textContent = `${years.toFixed(1)} ${unit}`;
        };
        input.addEventListener('input', calc);
    };

    setupRule72(ruleInputDe, ruleResultDe);
    setupRule72(ruleInputEn, ruleResultEn);

    // 3. Inflation Decay Visualizers
    const infRateDe = document.getElementById('inf-decay-rate-de');
    const infYearsDe = document.getElementById('inf-decay-years-de');
    const infResultDe = document.getElementById('inf-decay-result-de');

    const infRateEn = document.getElementById('inf-decay-rate-en');
    const infYearsEn = document.getElementById('inf-decay-years-en');
    const infResultEn = document.getElementById('inf-decay-result-en');

    const setupInflationDecay = (rateIn, yearsIn, resultOut) => {
        if (!rateIn || !yearsIn || !resultOut) return;
        const calc = () => {
            const baseAmount = 10000;
            const rate = (parseFloat(rateIn.value) || 0) / 100;
            const years = parseInt(yearsIn.value) || 1;
            const remainingValue = baseAmount * Math.pow(1 - rate, years);
            resultOut.textContent = formatCurrency(remainingValue);
        };
        rateIn.addEventListener('input', calc);
        yearsIn.addEventListener('input', calc);
    };

    setupInflationDecay(infRateDe, infYearsDe, infResultDe);
    setupInflationDecay(infRateEn, infYearsEn, infResultEn);

    // Trigger initial widget states
    updateAllGuideWidgets();
}

function updateAllGuideWidgets() {
    // Rule of 72 trigger
    const rDe = document.getElementById('rule72-rate-de');
    if (rDe) rDe.dispatchEvent(new Event('input'));
    const rEn = document.getElementById('rule72-rate-en');
    if (rEn) rEn.dispatchEvent(new Event('input'));

    // Inflation trigger
    const infDe = document.getElementById('inf-decay-rate-de');
    if (infDe) infDe.dispatchEvent(new Event('input'));
    const infEn = document.getElementById('inf-decay-rate-en');
    if (infEn) infEn.dispatchEvent(new Event('input'));
}

/* ==========================================
   Investment Options Comparison Logic
   ========================================== */
let compareChartInstance = null;

// Option catalogue. Returns are NOMINAL annual assumptions (low / mid / high),
// based on long-term historical figures. low/high express the inherent risk band.
const COMPARE_OPTIONS = {
    'sparkonto': {
        pillar: '3b',
        color: '#ef4444',
        low: 0.5, mid: 1.25, high: 2.0,
        de: { name: 'Sparkonto', short: 'Sparkonto', risk: 'Sehr tief', tax: 'Kein Steuerabzug', access: 'Jederzeit',
              trait: 'Sicher und flexibel – aber kaum Wachstum. Ideal für den Notgroschen, nicht für den Vermögensaufbau.' },
        en: { name: 'Savings Account', short: 'Savings', risk: 'Very low', tax: 'No deduction', access: 'Anytime',
              trait: 'Safe and flexible – but barely grows. Ideal for an emergency fund, not for building wealth.' }
    },
    '3a-konto': {
        pillar: '3a',
        color: '#f59e0b',
        low: 0.1, mid: 0.5, high: 1.0,
        de: { name: 'Säule 3a – Konto', short: '3a Konto', risk: 'Sehr tief', tax: 'Jährlicher Steuerabzug', access: 'Gebunden bis ~Pension',
              trait: 'Spart jedes Jahr Steuern, wächst aber kaum. Sinnvoller als Bar-Cash dank Steuerabzug.' },
        en: { name: 'Pillar 3a – Account', short: '3a Account', risk: 'Very low', tax: 'Annual tax deduction', access: 'Locked until ~retirement',
              trait: 'Saves tax every year but barely grows. Better than plain cash thanks to the deduction.' }
    },
    '3a-etf': {
        pillar: '3a',
        color: '#10b981',
        low: 3.0, mid: 5.0, high: 8.0,
        de: { name: 'Säule 3a – Wertschriften (ETF)', short: '3a ETF', risk: 'Mittel–hoch', tax: 'Jährlicher Steuerabzug', access: 'Gebunden bis ~Pension',
              trait: 'Aktien-Rendite UND Steuerabzug. Stark für den langfristigen Vorsorge-Aufbau (z.B. VIAC, Finpension).' },
        en: { name: 'Pillar 3a – Securities (ETF)', short: '3a ETF', risk: 'Medium–high', tax: 'Annual tax deduction', access: 'Locked until ~retirement',
              trait: 'Equity returns AND a tax deduction. Powerful for long-term retirement saving (e.g. VIAC, Finpension).' }
    },
    'etf-welt': {
        pillar: '3b',
        color: '#3b82f6',
        low: 3.0, mid: 5.0, high: 9.0,
        de: { name: 'ETF-Weltportfolio', short: 'Welt-ETF', risk: 'Mittel–hoch', tax: 'Kursgewinne steuerfrei', access: 'Jederzeit',
              trait: 'Der flexible Vermögensmotor: tausende Firmen weltweit, jederzeit verfügbar, Kursgewinne steuerfrei.' },
        en: { name: 'Global ETF Portfolio', short: 'World ETF', risk: 'Medium–high', tax: 'Capital gains tax-free', access: 'Anytime',
              trait: 'The flexible wealth engine: thousands of companies worldwide, available anytime, gains tax-free.' }
    },
    'portfolio-mixed': {
        pillar: '3b',
        color: '#8b5cf6',
        low: 2.0, mid: 4.0, high: 6.0,
        de: { name: 'Ausgewogenes Portfolio (60/40)', short: '60/40', risk: 'Mittel', tax: 'Kursgewinne steuerfrei', access: 'Jederzeit',
              trait: 'Mischung aus Aktien und Anleihen: ruhigere Schwankungen, dafür etwas tiefere Rendite als reine Aktien.' },
        en: { name: 'Balanced Portfolio (60/40)', short: '60/40', risk: 'Medium', tax: 'Capital gains tax-free', access: 'Anytime',
              trait: 'A mix of stocks and bonds: calmer swings, but slightly lower returns than pure equities.' }
    }
};

const COMPARE_DEFAULT_A = 'sparkonto';
const COMPARE_DEFAULT_B = '3a-etf';

function initComparison() {
    const selA = document.getElementById('cmp-option-a');
    const selB = document.getElementById('cmp-option-b');
    if (!selA || !selB) return;

    populateCompareSelect(selA, COMPARE_DEFAULT_A);
    populateCompareSelect(selB, COMPARE_DEFAULT_B);

    const callback = calculateComparison;
    syncInputs('cmp-principal', 'cmp-principal-num', callback);
    syncInputs('cmp-contribution', 'cmp-contribution-num', callback);
    syncInputs('cmp-years', 'cmp-years-num', callback);
    selA.addEventListener('change', callback);
    selB.addEventListener('change', callback);

    calculateComparison();
}

function populateCompareSelect(selectEl, selectedKey) {
    selectEl.innerHTML = '';
    Object.keys(COMPARE_OPTIONS).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = compareOptionLabel(key);
        if (key === selectedKey) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function compareOptionLabel(key) {
    const o = COMPARE_OPTIONS[key];
    const loc = o[currentLanguage] || o.de;
    // 3a options already say "Säule 3a"; tag the others with their pillar in brackets.
    return o.pillar === '3a' ? loc.name : `${loc.name} (3b)`;
}

// Keep dropdown labels in sync when the language changes, preserving selection.
function refreshComparisonLabels() {
    ['cmp-option-a', 'cmp-option-b'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const current = sel.value;
        populateCompareSelect(sel, current);
    });
}

// Future value of monthly contributions, compounded monthly, for a given annual rate.
function compareSeries(annualRatePct, principal, monthly, years) {
    const r = annualRatePct / 100 / 12;
    const series = [principal];
    let balance = principal;
    for (let y = 1; y <= years; y++) {
        for (let m = 0; m < 12; m++) {
            balance = balance * (1 + r) + monthly;
        }
        series.push(balance);
    }
    return series;
}

function calculateComparison() {
    const selA = document.getElementById('cmp-option-a');
    const selB = document.getElementById('cmp-option-b');
    if (!selA || !selB) return;

    const keyA = selA.value;
    const keyB = selB.value;
    const optA = COMPARE_OPTIONS[keyA];
    const optB = COMPARE_OPTIONS[keyB];

    const principal = parseFloat(document.getElementById('cmp-principal-num').value) || 0;
    const monthly = parseFloat(document.getElementById('cmp-contribution-num').value) || 0;
    const years = parseInt(document.getElementById('cmp-years-num').value) || 1;

    const yrLabel = currentLanguage === 'de' ? 'Jahr' : 'Year';
    const labels = [];
    for (let y = 0; y <= years; y++) labels.push(`${yrLabel} ${y}`);

    const aLow = compareSeries(optA.low, principal, monthly, years);
    const aMid = compareSeries(optA.mid, principal, monthly, years);
    const aHigh = compareSeries(optA.high, principal, monthly, years);
    const bLow = compareSeries(optB.low, principal, monthly, years);
    const bMid = compareSeries(optB.mid, principal, monthly, years);
    const bHigh = compareSeries(optB.high, principal, monthly, years);

    const contributed = principal + monthly * 12 * years;

    fillCompareCard('a', optA, aMid, aLow, aHigh, contributed);
    fillCompareCard('b', optB, bMid, bLow, bHigh, contributed);
    fillCompareTable('a', optA);
    fillCompareTable('b', optB);
    fillCompareDiff(optA, optB, aMid[aMid.length - 1], bMid[bMid.length - 1]);

    drawCompareChart(labels, optA, aLow, aMid, aHigh, optB, bLow, bMid, bHigh);
}

function fillCompareCard(suffix, opt, mid, low, high, contributed) {
    const loc = opt[currentLanguage] || opt.de;
    const finalMid = mid[mid.length - 1];
    const finalLow = low[low.length - 1];
    const finalHigh = high[high.length - 1];

    document.getElementById('cmp-name-' + suffix).textContent = loc.name;
    document.getElementById('cmp-pillar-' + suffix).textContent = opt.pillar === '3a' ? 'Säule 3a' : 'Säule 3b';
    const pillarEl = document.getElementById('cmp-pillar-' + suffix);
    pillarEl.className = 'pillar-badge ' + (opt.pillar === '3a' ? 'pillar-3a' : 'pillar-3b');
    document.getElementById('cmp-risk-' + suffix).textContent = loc.risk;
    document.getElementById('cmp-mid-' + suffix).textContent = formatCurrency(finalMid);
    document.getElementById('cmp-range-' + suffix).textContent = `${formatCurrency(finalLow)} – ${formatCurrency(finalHigh)}`;
    document.getElementById('cmp-contrib-' + suffix).textContent = formatCurrency(contributed);
    document.getElementById('cmp-gain-' + suffix).textContent = formatCurrency(Math.max(0, finalMid - contributed));
    document.getElementById('cmp-trait-' + suffix).textContent = loc.trait;

    const card = document.getElementById('cmp-card-' + suffix);
    card.style.borderLeft = `4px solid ${opt.color}`;
}

function fillCompareTable(suffix, opt) {
    const loc = opt[currentLanguage] || opt.de;
    document.getElementById('cmp-th-' + suffix).textContent = loc.short;
    document.getElementById('cmp-tbl-pillar-' + suffix).textContent = opt.pillar === '3a' ? 'Säule 3a' : 'Säule 3b';
    document.getElementById('cmp-tbl-return-' + suffix).textContent =
        `${formatPct(opt.low)} – ${formatPct(opt.high)} (Ø ${formatPct(opt.mid)})`;
    document.getElementById('cmp-tbl-risk-' + suffix).textContent = loc.risk;
    document.getElementById('cmp-tbl-tax-' + suffix).textContent = loc.tax;
    document.getElementById('cmp-tbl-access-' + suffix).textContent = loc.access;
}

function formatPct(v) {
    const s = (Math.round(v * 10) / 10).toString().replace('.', currentLanguage === 'de' ? '.' : '.');
    return s + '%';
}

function fillCompareDiff(optA, optB, finalA, finalB) {
    const box = document.getElementById('cmp-diff-box');
    if (!box) return;
    const locA = optA[currentLanguage] || optA.de;
    const locB = optB[currentLanguage] || optB.de;
    const diff = Math.abs(finalB - finalA);
    const higher = finalB >= finalA ? locB.name : locA.name;
    const lower = finalB >= finalA ? locA.name : locB.name;

    if (Math.round(diff) === 0) {
        box.innerHTML = currentLanguage === 'de'
            ? `<span>Beide Optionen führen langfristig zu einem ähnlichen Ergebnis.</span>`
            : `<span>Both options lead to a similar result over the long run.</span>`;
        return;
    }

    if (currentLanguage === 'de') {
        box.innerHTML = `<span>📊 Über diesen Zeitraum erzielt <strong>${higher}</strong> im Mittel rund <strong>${formatCurrency(diff)}</strong> mehr als <strong>${lower}</strong>.</span>`;
    } else {
        box.innerHTML = `<span>📊 Over this period, <strong>${higher}</strong> ends up with roughly <strong>${formatCurrency(diff)}</strong> more than <strong>${lower}</strong> on average.</span>`;
    }
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawCompareChart(labels, optA, aLow, aMid, aHigh, optB, bLow, bMid, bHigh) {
    const ctx = document.getElementById('compareChart').getContext('2d');
    const colors = getThemeChartConfig();
    const locA = optA[currentLanguage] || optA.de;
    const locB = optB[currentLanguage] || optB.de;

    // Update custom legend
    document.getElementById('cmp-legend-a').textContent = locA.name;
    document.getElementById('cmp-legend-b').textContent = locB.name;
    document.getElementById('cmp-legend-dot-a').style.backgroundColor = optA.color;
    document.getElementById('cmp-legend-dot-b').style.backgroundColor = optB.color;

    if (compareChartInstance) compareChartInstance.destroy();

    const band = (label, data, color, fillTarget) => ({
        label, data,
        borderColor: 'transparent',
        backgroundColor: hexToRgba(color, 0.12),
        fill: fillTarget,
        pointRadius: 0,
        tension: 0.15,
        isBand: true
    });
    const midLine = (label, data, color) => ({
        label, data,
        borderColor: color,
        backgroundColor: 'transparent',
        fill: false,
        borderWidth: 3,
        tension: 0.15,
        pointRadius: 0,
        isBand: false
    });

    compareChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                band(locA.name + ' low', aLow, optA.color, false),
                band(locA.name + ' high', aHigh, optA.color, '-1'),
                midLine(locA.name, aMid, optA.color),
                band(locB.name + ' low', bLow, optB.color, false),
                band(locB.name + ' high', bHigh, optB.color, '-1'),
                midLine(locB.name, bMid, optB.color)
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.tooltipBorder,
                    borderWidth: 1,
                    filter: function(item) { return !item.dataset.isBand; },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor, maxTicksLimit: 12 }
                },
                y: {
                    grid: { color: colors.gridColor },
                    ticks: {
                        color: colors.textColor,
                        callback: function(value) { return value >= 1000 ? (value / 1000) + 'k' : value; }
                    }
                }
            }
        }
    });
}

/* ==========================================
   Formatting Helper Utilities
   ========================================== */
function formatCurrency(amount) {
    if (currentLanguage === 'de') {
        // German Swiss format: CHF 10'000
        return 'CHF ' + Math.round(amount).toLocaleString('de-CH').replace(/,/g, "'");
    } else {
        // Standard English format: CHF 10,000
        return 'CHF ' + Math.round(amount).toLocaleString('en-US');
    }
}
