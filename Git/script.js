document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarNav = document.getElementById('sidebar-nav');
    const content = document.getElementById('content');
    const breadcrumb = document.getElementById('breadcrumb');
    const searchInput = document.getElementById('search-input');
    const menuBtn = document.getElementById('menu-btn');

    // State
    let manifestData = null;
    let currentActiveLink = null;
    let allCommands = []; // Flat list for search

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar on click outside (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Initialization
    async function init() {
        try {
            const response = await fetch('data/manifest.json');
            if (!response.ok) throw new Error("Failed to load manifest");
            manifestData = await response.json();
            
            buildNavigation();
            setupSearch();
            renderHome();
        } catch (err) {
            content.innerHTML = `<div style="color:var(--accent); padding:20px;">Error loading data. If viewing via file://, you may need a local server.</div>`;
            console.error(err);
        }
    }

    // Build the sidebar navigation
    function buildNavigation() {
        sidebarNav.innerHTML = '';
        allCommands = [];

        // Commands section
        manifestData.categories.forEach(cat => {
            const group = document.createElement('div');
            group.className = 'nav-group';
            
            const title = document.createElement('div');
            title.className = 'nav-group-title';
            title.textContent = cat.name;
            group.appendChild(title);

            cat.commands.forEach(cmdId => {
                const a = document.createElement('a');
                a.className = 'nav-link';
                a.innerHTML = `<span class="cmd-icon">${cat.icon}</span> ${cmdId.replace('git-', '')}`;
                a.dataset.id = cmdId;
                a.dataset.type = 'command';
                
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadCommand(cmdId);
                });
                
                group.appendChild(a);
                allCommands.push({ id: cmdId, name: cmdId, type: 'command', el: a });
            });

            sidebarNav.appendChild(group);
        });

        // Scenarios section
        const scenarioGroup = document.createElement('div');
        scenarioGroup.className = 'nav-group';
        scenarioGroup.style.marginTop = '16px';
        
        const scTitle = document.createElement('div');
        scTitle.className = 'nav-group-title';
        scTitle.textContent = 'Real-world Scenarios';
        scenarioGroup.appendChild(scTitle);

        manifestData.scenarios.forEach(sc => {
            const a = document.createElement('a');
            a.className = 'nav-link';
            a.innerHTML = `<span class="cmd-icon" style="color:var(--yellow)">★</span> ${sc.name}`;
            a.dataset.id = sc.id;
            a.dataset.type = 'scenario';
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadScenario(sc.id);
            });
            
            scenarioGroup.appendChild(a);
            allCommands.push({ id: sc.id, name: sc.name.toLowerCase(), type: 'scenario', el: a });
        });

        sidebarNav.appendChild(scenarioGroup);
        
        // Add Home button at top
        const homeDiv = document.createElement('div');
        homeDiv.className = 'nav-group';
        homeDiv.style.marginBottom = '10px';
        const homeA = document.createElement('a');
        homeA.className = 'nav-link';
        homeA.innerHTML = `<span class="cmd-icon" style="color:var(--blue)">⌂</span> Home`;
        homeA.addEventListener('click', (e) => {
            e.preventDefault();
            renderHome();
        });
        homeDiv.appendChild(homeA);
        sidebarNav.insertBefore(homeDiv, sidebarNav.firstChild);
    }

    // Search functionality
    function setupSearch() {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            allCommands.forEach(item => {
                if (query === '' || item.name.includes(query) || item.id.includes(query)) {
                    item.el.style.display = 'flex';
                } else {
                    item.el.style.display = 'none';
                }
            });
            
            // Hide empty groups
            document.querySelectorAll('.nav-group').forEach(group => {
                const links = Array.from(group.querySelectorAll('.nav-link'));
                const hasVisible = links.some(l => l.style.display !== 'none');
                group.style.display = hasVisible || group === sidebarNav.firstChild ? 'block' : 'none';
            });
        });
    }

    // Set active link visually
    function setActiveLink(id) {
        if (currentActiveLink) {
            currentActiveLink.classList.remove('active');
        }
        if (id) {
            const link = document.querySelector(`.nav-link[data-id="${id}"]`);
            if (link) {
                link.classList.add('active');
                currentActiveLink = link;
                
                // Scroll into view if needed
                link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
        
        // Auto-close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
        content.scrollTop = 0;
    }

    // Fetch and render a Command
    async function loadCommand(id) {
        try {
            content.innerHTML = '<div style="color:var(--text-muted);">Loading...</div>';
            const response = await fetch(`data/commands/${id}.json`);
            if (!response.ok) throw new Error("Not found");
            const data = await response.json();
            
            breadcrumb.innerHTML = `<span class="current">Commands</span><span class="sep">/</span><span class="current">${data.category}</span><span class="sep">/</span><span style="color:#fff">${data.name}</span>`;
            
            renderCommandHTML(data);
            setActiveLink(id);
        } catch (err) {
            content.innerHTML = `<div style="color:var(--accent);">Error loading command data.</div>`;
        }
    }

    // Render Command JSON to HTML
    function renderCommandHTML(data) {
        let html = `
            <div class="cmd-header">
                <div class="cmd-category">${data.category}</div>
                <h1 class="cmd-name">${data.name}</h1>
                <p class="cmd-short-desc">${data.shortDescription}</p>
            </div>
            
            <div class="syntax-box">${data.syntax.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            
            <div class="section-label">Detailed Description</div>
            <div class="detail-text">${formatMarkdown(data.detailedDescription)}</div>
        `;

        if (data.parameters && data.parameters.length > 0) {
            html += `<div class="section-label">Parameters & Flags</div>
                     <table class="params-table">
                        <tr><th>Flag / Argument</th><th>Description</th><th>Default</th></tr>`;
            data.parameters.forEach(p => {
                html += `<tr>
                    <td><span class="param-flag">${p.flag.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></td>
                    <td><span class="param-desc">${formatMarkdown(p.description)}</span></td>
                    <td><span class="param-default">${p.default}</span></td>
                </tr>`;
            });
            html += `</table>`;
        }

        if (data.examples && data.examples.length > 0) {
            html += `<div class="section-label">Practical Examples</div>`;
            data.examples.forEach((ex, i) => {
                html += `
                    <div class="example-block">
                        <div class="example-title"><span class="num">${i+1}</span> ${ex.title}</div>
                        <div class="example-desc">${ex.description}</div>
                        <div class="example-code">${highlightCode(ex.code)}</div>
                    </div>
                `;
            });
        }

        if (data.commonMistakes && data.commonMistakes.length > 0) {
            html += `<div class="section-label">Pro Tips & Warnings</div>
                     <ul class="tip-list">`;
            data.commonMistakes.forEach(tip => {
                let icon = tip.type === 'danger' ? '☠️' : tip.type === 'warning' ? '⚠️' : tip.type === 'success' ? '💡' : 'ℹ️';
                html += `<li class="tip-item ${tip.type}">
                    <span class="tip-icon">${icon}</span>
                    <span>${formatMarkdown(tip.text)}</span>
                </li>`;
            });
            html += `</ul>`;
        }

        if (data.relatedCommands && data.relatedCommands.length > 0) {
            html += `<div class="section-label">Related Commands</div>
                     <div class="related-list">`;
            data.relatedCommands.forEach(rc => {
                html += `<span class="related-chip" onclick="document.querySelector('.nav-link[data-id=\\'${rc}\\']').click()">${rc}</span>`;
            });
            html += `</div>`;
        }

        content.innerHTML = html;
    }

    // Fetch and render a Scenario
    async function loadScenario(id) {
        try {
            content.innerHTML = '<div style="color:var(--text-muted);">Loading...</div>';
            const response = await fetch(`data/scenarios/${id}.json`);
            if (!response.ok) throw new Error("Not found");
            const data = await response.json();
            
            breadcrumb.innerHTML = `<span class="current">Scenarios</span><span class="sep">/</span><span style="color:#fff">${data.name}</span>`;
            
            renderScenarioHTML(data);
            setActiveLink(id);
        } catch (err) {
            content.innerHTML = `<div style="color:var(--accent);">Error loading scenario data.</div>`;
        }
    }

    function renderScenarioHTML(data) {
        let html = `
            <div class="scenario-header">
                <div class="scenario-tag">${data.tag}</div>
                <h1 class="scenario-name">${data.name}</h1>
                <p class="scenario-problem">${data.problem}</p>
            </div>
            <div class="section-label">Resolution Steps</div>
        `;

        data.steps.forEach((step, i) => {
            html += `
                <div class="scenario-step">
                    <div class="scenario-step-header">
                        <div class="step-num">${i+1}</div>
                        <div class="step-title">${step.title}</div>
                    </div>
                    <div class="scenario-step-body">${formatMarkdown(step.description)}</div>
                    ${step.code ? `<div class="scenario-step-code">${highlightCode(step.code)}</div>` : ''}
                </div>
            `;
        });

        if (data.alternatives && data.alternatives.length > 0) {
            html += `<div class="section-label">Alternative Approaches</div>`;
            data.alternatives.forEach(alt => {
                html += `
                    <div class="scenario-step" style="border-color:var(--border-light)">
                        <div class="scenario-step-header" style="background:transparent">
                            <div class="step-title" style="color:var(--text-secondary)">${alt.title}</div>
                        </div>
                        <div class="scenario-step-body">${formatMarkdown(alt.description)}</div>
                        ${alt.code ? `<div class="scenario-step-code">${highlightCode(alt.code)}</div>` : ''}
                    </div>
                `;
            });
        }

        content.innerHTML = html;
    }

    // Render Home Dashboard
    function renderHome() {
        breadcrumb.innerHTML = `<span style="color:#fff">Home Overview</span>`;
        setActiveLink(null);

        let html = `
            <div class="home-hero">
                <h1>Master Git <span class="accent">Architecture.</span></h1>
                <p>Welcome to the ultimate Git reference. Select a command from the sidebar to explore its deep mechanics, flags, and real-world examples, or browse the scenario guides to resolve complex repository issues.</p>
            </div>
        `;

        manifestData.categories.forEach(cat => {
            html += `<div class="home-section-title">${cat.name}</div>
                     <div class="home-grid">`;
            cat.commands.forEach(cmdId => {
                html += `
                    <div class="home-card" onclick="document.querySelector('.nav-link[data-id=\\'${cmdId}\\']').click()">
                        <div class="home-card-title">${cmdId.replace('git-', 'git ')}</div>
                    </div>
                `;
            });
            html += `</div>`;
        });

        html += `<div class="home-section-title" style="color:var(--yellow); border-color:#332910">Real-world Scenarios</div>
                 <div class="home-grid">`;
        manifestData.scenarios.forEach(sc => {
            html += `
                <div class="home-card" onclick="document.querySelector('.nav-link[data-id=\\'${sc.id}\\']').click()">
                    <div class="home-card-title"><span class="badge">${sc.tag}</span></div>
                    <p style="margin-top:6px; color:#fff">${sc.name}</p>
                </div>
            `;
        });
        html += `</div>`;

        content.innerHTML = html;
    }

    // Helpers
    function formatMarkdown(text) {
        if (!text) return '';
        let res = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        res = res.replace(/\n\n/g, '<br><br>');
        return res;
    }

    function highlightCode(code) {
        if (!code) return '';
        return code.split('\n').map(line => {
            line = line.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (line.trim().startsWith('#')) {
                return `<span class="comment">${line}</span>`;
            }
            if (line.trim().startsWith('git ')) {
                return `<span class="cmd">${line}</span>`;
            }
            return line;
        }).join('\n');
    }

    // Start
    init();
});
