// State Management
let trains = [];
let cityPlatformMap = {}; // { "CityName": "PlatformName" }

// Load from LocalStorage on mount
function loadTrains() {
    const saved = localStorage.getItem('railwayTrains');
    if (saved) {
        trains = JSON.parse(saved);
    }
    const savedMap = localStorage.getItem('cityPlatformMap');
    if (savedMap) {
        cityPlatformMap = JSON.parse(savedMap);
    }
    assignPlatforms();
    renderDashboard();
    renderCityPlatforms();
    renderAnalytics();
}

function saveTrains() {
    localStorage.setItem('railwayTrains', JSON.stringify(trains));
}

function saveCityPlatformMap() {
    localStorage.setItem('cityPlatformMap', JSON.stringify(cityPlatformMap));
}

// Logic: Time Parsing
function timeToMins(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatMins(totalMins) {
    totalMins = (totalMins % 1440 + 1440) % 1440;
    let h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const period = h >= 12 ? 'p.m.' : 'a.m.';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${period}`;
}

// Logic: Overlap Algorithm
function isOverlap(arrA, depA, arrB, depB) {
    if (arrA < depB && arrB < depA) return true;
    let arrB_nxt = arrB + 1440, depB_nxt = depB + 1440;
    if (arrA < depB_nxt && arrB_nxt < depA) return true;
    let arrA_nxt = arrA + 1440, depA_nxt = depA + 1440;
    if (arrB < depA_nxt && arrA_nxt < depB) return true;
    return false;
}

function assignPlatforms() {
    if (trains.length === 0) return;
    
    let vipTrains = [];
    let regulars = [];
    
    trains.forEach(t => {
        t.platform = 0;
        if (t.isVip) vipTrains.push(t);
        else regulars.push(t);
    });
    
    vipTrains.sort((a, b) => a.arrival - b.arrival);
    regulars.sort((a, b) => a.arrival - b.arrival);
    
    let assigned = [];
    
    for (let t of vipTrains) {
        assignTrainToPlatform(t, 1, assigned);
        assigned.push(t);
    }
    
    for (let t of regulars) {
        let startPlat = vipTrains.length === 0 ? 1 : 2;
        assignTrainToPlatform(t, startPlat, assigned);
        assigned.push(t);
    }
    
    trains = [...vipTrains, ...regulars];
}

function assignTrainToPlatform(t, startPlat, assignedList) {
    let plat = startPlat;
    while (true) {
        let conflict = false;
        for (let other of assignedList) {
            if (other.platform === plat) {
                if (isOverlap(t.arrival, t.departure, other.arrival, other.departure)) {
                    conflict = true;
                    break;
                }
            }
        }
        if (!conflict) {
            t.platform = plat;
            break;
        } else {
            plat++;
        }
    }
}

function getPlatformDisplayName(platform, destCity) {
    const customName = cityPlatformMap[destCity];
    return customName ? `${customName} (P${platform})` : `Platform ${platform}`;
}

// UI Rendering
function renderDashboard() {
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';
    
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredTrains = trains;
    if (query) {
        filteredTrains = trains.filter(t => 
            t.trainNumber.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query) ||
            t.source.toLowerCase().includes(query) ||
            t.destination.toLowerCase().includes(query) ||
            t.driver.toLowerCase().includes(query)
        );
    }
    
    if (filteredTrains.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No trains found.</td></tr>`;
    }
    
    filteredTrains.sort((a,b)=>a.arrival-b.arrival).forEach(t => {
        const tr = document.createElement('tr');
        
        let pName = getPlatformDisplayName(t.platform, t.destination);
        const platDisplay = t.isVip 
            ? `${pName} <span class="vip-badge">VIP</span>`
            : pName;
            
        tr.innerHTML = `
            <td><strong>${t.trainNumber}</strong></td>
            <td>${t.name}</td>
            <td>${t.source} &rarr; ${t.destination}</td>
            <td>${t.driver}</td>
            <td>${formatMins(t.arrival)}</td>
            <td>${formatMins(t.departure)}</td>
            <td><strong>${platDisplay}</strong></td>
            <td>
                <button class="btn-text" onclick="editTrain('${t.trainNumber}')">Edit</button>
                <button class="btn-text danger" onclick="deleteTrain('${t.trainNumber}')">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPlatforms();
    renderAnalytics();
}

function renderPlatforms() {
    const container = document.getElementById('platformsContainer');
    container.innerHTML = '';
    
    if(trains.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">No platform assignments yet.</p>`;
        return;
    }
    
    const platformMap = {};
    trains.forEach(t => {
        if (!platformMap[t.platform]) platformMap[t.platform] = [];
        platformMap[t.platform].push(t);
    });
    
    Object.keys(platformMap).sort((a,b)=>a-b).forEach(plat => {
        const platTrains = platformMap[plat];
        platTrains.sort((a,b)=>a.arrival-b.arrival); 
        
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        const isVipPrimary = plat === '1';
        
        let headerHtml = `<div class="platform-header">
            <h3 style="font-size: 1.2rem;">Platform ${plat} ${isVipPrimary ? '<span class="vip-badge" style="font-size: 0.6rem;">Primary VIP</span>' : ''}</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">${platTrains.length} Train(s)</span>
        </div>`;
        
        let trainListHtml = platTrains.map(t => {
            const destName = cityPlatformMap[t.destination] ? ` &bull; <em style="color:var(--text-muted)">${cityPlatformMap[t.destination]}</em>` : '';
            return `
            <div class="platform-train ${t.isVip ? 'vip-train' : ''}">
                <div>
                    <div class="pt-name">${t.name} <span style="color: var(--text-muted); font-size: 0.85em;">(#${t.trainNumber})</span></div>
                    <div class="pt-time">Arr: ${formatMins(t.arrival)} &bull; Dep: ${formatMins(t.departure)}${destName}</div>
                </div>
            </div>`;
        }).join('');
        
        card.innerHTML = headerHtml + trainListHtml;
        container.appendChild(card);
    });
}

function renderAnalytics() {
    const container = document.getElementById('statsContainer');
    const driverContainer = document.getElementById('driverStatsContainer');
    
    if(trains.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted);">Not enough data for analytics.</p>`;
        driverContainer.innerHTML = `<p style="color: var(--text-muted);">No driver data.</p>`;
        return;
    }

    let vipCount = trains.filter(t => t.isVip).length;
    let regCount = trains.length - vipCount;
    
    let maxPlat = 0;
    let platCounts = {};
    let hours = new Array(24).fill(0);
    let driverCounts = {};
    
    trains.forEach(t => {
        maxPlat = Math.max(maxPlat, t.platform);
        platCounts[t.platform] = (platCounts[t.platform] || 0) + 1;
        
        let hour = Math.floor((t.arrival % 1440) / 60);
        hours[hour]++;
        
        driverCounts[t.driver] = (driverCounts[t.driver] || 0) + 1;
    });
    
    let peakHour = 0;
    let maxHourCount = 0;
    for(let i=0; i<24; i++) {
        if(hours[i] > maxHourCount) {
            maxHourCount = hours[i];
            peakHour = i;
        }
    }
    
    let busiestPlat = -1;
    let maxPlatCount = 0;
    for(let p in platCounts) {
        if(platCounts[p] > maxPlatCount) {
            maxPlatCount = platCounts[p];
            busiestPlat = p;
        }
    }
    
    container.innerHTML = `
        <div class="stat-card glass-panel">
            <span class="stat-title">Total Trains</span>
            <span class="stat-value">${trains.length}</span>
        </div>
        <div class="stat-card stat-vip glass-panel">
            <span class="stat-title">VIP Trains</span>
            <span class="stat-value">${vipCount}</span>
        </div>
        <div class="stat-card glass-panel">
            <span class="stat-title">Platforms Used</span>
            <span class="stat-value">${maxPlat}</span>
        </div>
        <div class="stat-card stat-peak glass-panel">
            <span class="stat-title">Peak Hour</span>
            <span class="stat-value">${peakHour}:00 <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted)">(${maxHourCount} trains)</span></span>
        </div>
        <div class="stat-card glass-panel">
            <span class="stat-title">Busiest Platform</span>
            <span class="stat-value">P${busiestPlat} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-muted)">(${maxPlatCount} trains)</span></span>
        </div>
    `;
    
    driverContainer.innerHTML = '';
    Object.keys(driverCounts).sort((a,b) => driverCounts[b] - driverCounts[a]).forEach(d => {
        driverContainer.innerHTML += `
            <div class="driver-stat-item">
                <span class="driver-name">${d}</span>
                <span class="driver-count">${driverCounts[d]}</span>
            </div>
        `;
    });
}

function renderCityPlatforms() {
    const tbody = document.getElementById('cityPlatformTableBody');
    tbody.innerHTML = '';
    
    if (Object.keys(cityPlatformMap).length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">No custom platform names mapped yet.</td></tr>`;
        return;
    }
    
    for (const [city, pName] of Object.entries(cityPlatformMap)) {
        tbody.innerHTML += `
            <tr>
                <td><strong>${city}</strong></td>
                <td>${pName}</td>
                <td><button class="btn-text danger" onclick="deleteCityPlatform('${city}')">Del</button></td>
            </tr>
        `;
    }
}

// Interaction Handlers
function handleSearch() {
    renderDashboard();
}

function handleAddCityPlatform(e) {
    e.preventDefault();
    const city = document.getElementById('cpCity').value.trim();
    const name = document.getElementById('cpName').value.trim();
    
    if (!city || !name) return;
    
    cityPlatformMap[city] = name;
    saveCityPlatformMap();
    renderCityPlatforms();
    renderDashboard(); // Re-render to update platform names in table
    
    document.getElementById('cpCity').value = '';
    document.getElementById('cpName').value = '';
}

function deleteCityPlatform(city) {
    if (confirm(`Remove custom platform name for ${city}?`)) {
        delete cityPlatformMap[city];
        saveCityPlatformMap();
        renderCityPlatforms();
        renderDashboard();
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const originalNum = document.getElementById('editOriginalNumber').value;
    const number = document.getElementById('tNumber').value;
    
    if (originalNum) {
        trains = trains.filter(x => x.trainNumber !== originalNum);
    } else {
        if (trains.find(x => x.trainNumber === number)) {
            alert("A train with this number already exists!");
            return;
        }
    }
    
    let arr = timeToMins(document.getElementById('tArr').value);
    let dep = timeToMins(document.getElementById('tDep').value);
    
    if (dep <= arr) {
        dep += 1440; 
    }
    
    const newTrain = {
        trainNumber: number.replace(/,/g, "-"),
        name: document.getElementById('tName').value.replace(/,/g, "-"),
        source: document.getElementById('tSource').value,
        destination: document.getElementById('tDest').value,
        driver: document.getElementById('tDriver').value,
        arrival: arr,
        departure: dep,
        isVip: document.getElementById('tVip').checked,
        platform: 0
    };
    
    trains.push(newTrain);
    assignPlatforms();
    saveTrains();
    renderDashboard();
    closeModal('addModal');
}

function handleAddDelay(e) {
    e.preventDefault();
    const num = document.getElementById('dNumber').value;
    const mins = parseInt(document.getElementById('dMins').value);
    
    const t = trains.find(x => x.trainNumber === num);
    if (!t) {
        alert("Train not found!");
        return;
    }
    
    t.arrival += mins;
    t.departure += mins;
    
    assignPlatforms();
    saveTrains();
    renderDashboard();
    closeModal('delayModal');
}

function editTrain(num) {
    const t = trains.find(x => x.trainNumber === num);
    if (!t) return;
    
    document.getElementById('editOriginalNumber').value = t.trainNumber;
    document.getElementById('tNumber').value = t.trainNumber;
    document.getElementById('tName').value = t.name;
    document.getElementById('tSource').value = t.source;
    document.getElementById('tDest').value = t.destination;
    document.getElementById('tDriver').value = t.driver;
    document.getElementById('tVip').checked = t.isVip;
    
    const arrH = Math.floor((t.arrival%1440) / 60).toString().padStart(2, '0');
    const arrM = ((t.arrival%1440) % 60).toString().padStart(2, '0');
    document.getElementById('tArr').value = `${arrH}:${arrM}`;
    
    const depH = Math.floor((t.departure%1440) / 60).toString().padStart(2, '0');
    const depM = ((t.departure%1440) % 60).toString().padStart(2, '0');
    document.getElementById('tDep').value = `${depH}:${depM}`;
    
    document.getElementById('modalTitle').innerText = "Edit Train Details";
    openModal('addModal');
}

function deleteTrain(num) {
    if (confirm("Are you sure you want to remove train " + num + "?")) {
        trains = trains.filter(x => x.trainNumber !== num);
        assignPlatforms();
        saveTrains();
        renderDashboard();
    }
}

function exportReport() {
    if (trains.length === 0) {
        alert("No data to export!");
        return;
    }
    
    let content = "===== TRAIN REPORT =====\n";
    let sortedTrains = [...trains].sort((a,b)=>a.arrival-b.arrival);
    
    sortedTrains.forEach(t => {
        let pName = getPlatformDisplayName(t.platform, t.destination);
        content += `${t.trainNumber} | ${t.name} | ${t.source} -> ${t.destination} | ${pName} | Arr: ${formatMins(t.arrival)} | Dep: ${formatMins(t.departure)}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'train_report.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// UI Navigation / Modals
function switchTab(tabId, event) {
    if(event) event.preventDefault();
    document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    
    if(event) event.currentTarget.classList.add('active');
    
    let titles = {
        'dashboard': 'Live Train Schedule',
        'platforms': 'Platform View',
        'analytics': 'System Analytics',
        'cityPlatforms': 'City Platform Mappings'
    };
    document.getElementById('pageTitle').innerText = titles[tabId] || 'Railway Scheduler';
}

function openModal(id) {
    if (id === 'addModal' && document.getElementById('editOriginalNumber').value === "") {
        document.getElementById('modalTitle').innerText = "Add New Train";
        document.getElementById('trainForm').reset();
        document.getElementById('editOriginalNumber').value = "";
    }
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if(id === 'addModal') document.getElementById('editOriginalNumber').value = ""; 
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Initialize
loadTrains();