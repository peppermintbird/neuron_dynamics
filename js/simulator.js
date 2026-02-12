export class Simulator {
    constructor(containerId, systemsMap, options = {}) {
        this.systems = systemsMap;
        this.options = {
            dt: 0.02,
            defaultSystem: Object.keys(systemsMap)[0],
            ...options
        };
        
        this.currentSystemKey = this.options.defaultSystem;
        this.animationId = null;
        this.plotData = [];
        this.state = null;
        
        // Soft Professional Layout
        this.baseLayout = {
            margin: { l: 50, r: 20, t: 40, b: 40 },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white',
            font: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            xaxis: { title: 'Time (ms)', showgrid: false, zerolinecolor: '#333', range: [0, 200] },
            yaxis: { showgrid: true, gridcolor: '#f0f0f0', zeroline: false }
        };

        this.init();
    }

    init() {
        this.dom = {
            systemSelect: document.querySelector('.js-system-select'),
            equationDisplay: document.querySelector('.js-equation-display'),
            paramsContainer: document.querySelector('.js-params-container'),
            plotDiv: document.querySelector('.js-plot-div'),
            btnRestart: document.querySelector('.js-btn-restart'),
            btnReset: document.querySelector('.js-btn-reset'),
        };

        if (!this.dom.plotDiv) return;

        this.populateSystemSelect();
        this.bindEvents();
        this.reset();
        
        setTimeout(() => this.start(), 100);
    }

    populateSystemSelect() {
        const optionsHTML = Object.entries(this.systems).map(([key, sys]) => 
            `<option value="${key}" ${key === this.currentSystemKey ? 'selected' : ''}>${sys.name}</option>`
        ).join('');
        this.dom.systemSelect.innerHTML = optionsHTML;
    }

    bindEvents() {
        this.dom.systemSelect.addEventListener('change', (e) => {
            this.stop();
            this.currentSystemKey = e.target.value;
            this.reset();
            setTimeout(() => this.start(), 50);
        });

        this.dom.btnReset.addEventListener('click', () => this.reset());
        this.dom.btnRestart.addEventListener('click', () => this.restart());
    }

    getCurrentSystem() {
        return this.systems[this.currentSystemKey];
    }

    updateUIControls() {
        const system = this.getCurrentSystem();
        
        // 1. Inject HTML Equations (Instant & Clean)
        this.dom.equationDisplay.innerHTML = system.equation;
        
        // 2. Render Sliders
        this.dom.paramsContainer.innerHTML = system.parameters.map(param => `
            <div class="param-item">
                <div class="param-header">
                    <span>${param.label}</span>
                    <span class="param-val js-param-val">${param.value.toFixed(param.step < 0.1 ? 2 : 1)}</span>
                </div>
                <input type="range" class="js-param-slider" 
                    data-id="${param.id}"
                    min="${param.min}" max="${param.max}" step="${param.step}" value="${param.value}">
            </div>
        `).join('');
        
        this.dom.paramsContainer.querySelectorAll('.js-param-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const display = e.target.closest('.param-item').querySelector('.js-param-val');
                const step = parseFloat(e.target.step);
                display.textContent = parseFloat(e.target.value).toFixed(step < 0.1 ? 2 : 1);
            });
        });
    }

    initPlot() {
        const system = this.getCurrentSystem();
        const layout = {
            ...this.baseLayout,
            title: { 
                text: system.plotConfig.title, 
                font: { size: 16, color: '#1a2b42', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } 
            },
            yaxis: { ...this.baseLayout.yaxis, ...system.plotConfig.yaxis }
        };

        Plotly.newPlot(this.dom.plotDiv, [{
            x: [], y: [],
            mode: 'lines',
            line: { color: '#1a2b42', width: 2.5 }
        }], layout, { 
            responsive: true, 
            displayModeBar: true 
        });
    }

    getParameters() {
        const sliders = this.dom.paramsContainer.querySelectorAll('.js-param-slider');
        return Array.from(sliders).map(s => parseFloat(s.value));
    }

    reset() {
        this.updateUIControls();
        this.restart();
    }

    restart() {
        const system = this.getCurrentSystem();
        this.state = JSON.parse(JSON.stringify(system.initialState));
        this.plotData = [[this.state.t, this.state.x]];
        this.initPlot();
    }

    animate() {
        if (!this.animationId) return;

        const system = this.getCurrentSystem();
        const params = this.getParameters();
        const dt = this.options.dt;
        
        const stepsPerFrame = system.name.includes('Hodgkin') ? 20 : 10;

        for (let i = 0; i < stepsPerFrame; i++) {
            this.state = system.simulate(params, this.state, dt);
            this.plotData.push([this.state.t, this.state.x]);
        }
        
        if (this.plotData.length > 5000) {
            this.plotData.splice(0, stepsPerFrame);
        }
        
        this.updatePlotView();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updatePlotView() {
        const xData = this.plotData.map(d => d[0]);
        const yData = this.plotData.map(d => d[1]);
        const t = this.state.t;
        
        let xRange = [0, 200];
        if (t > 180) {
            xRange = [t - 180, t + 20];
        }
        
        Plotly.react(this.dom.plotDiv, 
            [{ x: xData, y: yData, mode: 'lines', line: { color: '#1a2b42', width: 2.5 } }],
            { ...this.dom.plotDiv.layout, xaxis: { ...this.dom.plotDiv.layout.xaxis, range: xRange } }
        );
    }

    start() {
        if (this.animationId) return;
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}