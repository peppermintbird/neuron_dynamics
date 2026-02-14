/**
 * Definitions of neuronal dynamical systems.
 * Contains equations, parameters, and simulation logic.
 */
export const NEURON_MODELS = {
    lif: {
        name: 'Leaky Integrate-and-Fire (LIF)',
        // Stacked HTML equations with proper typography
        equation: `
            <div class="eq-stack">
                <div class="eq-row">
                    <span class="var">τ</span>
                    <span class="op">·</span>
                    <span class="frac">dV/dt</span>
                    <span class="op">=</span>
                    <span class="op">−</span>(<span class="var">V</span> <span class="op">−</span> <span class="var">E<sub>L</sub></span>)
                    <span class="op">+</span>
                    <span class="var">R</span><span class="var">I</span>
                </div>
                <div class="eq-note">
                    If <span class="var">V</span> > <span class="var">V<sub>th</sub></span>, then <span class="var">V</span> ← <span class="var">V<sub>reset</sub></span>
                </div>
            </div>
        `,
        parameters: [
            { id: 'I', label: 'Input Current (nA)', min: 0, max: 40, step: 0.5, value: 21 },
            { id: 'tau', label: 'Time Constant τ (ms)', min: 5, max: 50, step: 1, value: 20 },
            { id: 'Vth', label: 'Threshold (mV)', min: -60, max: -40, step: 1, value: -50 },
            { id: 'El', label: 'Resting Pot. (mV)', min: -80, max: -60, step: 1, value: -70 }
        ],
        initialState: { x: -70, y: 0, z: 0, t: 0 },
        simulate: (params, state, dt) => {
            const [I, tau, Vth, El] = params;
            const V_reset = El - 5; 
            let V = state.x;

            if (V >= Vth) V = V_reset;

            const dV = (El - V + I) / tau;
            let newV = V + dt * dV;

            if (newV >= Vth) newV = 0; // Visual Spike

            return { x: newV, t: state.t + dt };
        },
        plotConfig: {
            title: 'LIF Response',
            yaxis: { title: 'Voltage (mV)', range: [-85, 10] }
        }
    },

    izhikevich_rs: {
        name: 'Izhikevich (Regular Spiking)',
        equation: `
            <div class="eq-stack">
                <div class="eq-row">
                    <span class="var">v'</span>
                    <span class="op">=</span>
                    0.04<span class="var">v</span><sup>2</sup> <span class="op">+</span> 5<span class="var">v</span> <span class="op">+</span> 140 <span class="op">−</span> <span class="var">u</span> <span class="op">+</span> <span class="var">I</span>
                </div>
                <div class="eq-row">
                    <span class="var">u'</span>
                    <span class="op">=</span>
                    <span class="var">a</span>(<span class="var">b</span><span class="var">v</span> <span class="op">−</span> <span class="var">u</span>)
                </div>
                <div class="eq-note">
                    Spike reset: <span class="var">v</span> ← <span class="var">c</span>, <span class="var">u</span> ← <span class="var">u</span> + <span class="var">d</span>
                </div>
            </div>
        `,
        parameters: [
            { id: 'I', label: 'Input Current', min: 0, max: 25, step: 0.5, value: 10 },
            { id: 'a', label: 'a (Time Scale)', min: 0.01, max: 0.1, step: 0.01, value: 0.02 },
            { id: 'b', label: 'b (Sensitivity)', min: 0.1, max: 0.3, step: 0.05, value: 0.2 },
            { id: 'c', label: 'c (Reset V)', min: -75, max: -50, step: 1, value: -65 },
            { id: 'd', label: 'd (Reset u)', min: 0, max: 12, step: 0.5, value: 8 }
        ],
        initialState: { x: -65, y: -13, z: 0, t: 0 },
        simulate: (params, state, dt) => {
            const [I, a, b, c, d] = params;
            let v = state.x;
            let u = state.y;

            if (v >= 30) { v = c; u = u + d; }

            const dv = 0.04 * v * v + 5 * v + 140 - u + I;
            const du = a * (b * v - u);

            let newV = v + dt * dv;
            if (newV >= 30) newV = 30;

            return { x: newV, y: u + dt * du, t: state.t + dt };
        },
        plotConfig: {
            title: 'Izhikevich Phase Space',
            yaxis: { title: 'Voltage (mV)', range: [-80, 40] }
        }
    },
    
    hodgkin_huxley: {
        name: 'Hodgkin–Huxley (Biophysical)',
        equation: `
            <div class="eq-stack">
                <div class="eq-row">
                    <span class="var">C<sub>m</sub></span><span class="var">V'</span>
                    <span class="op">=</span>
                    <span class="var">I</span> 
                    <span class="op">−</span> <span class="var">g<sub>Na</sub></span><span class="var">m</span><sup>3</sup><span class="var">h</span>(<span class="var">V</span><span class="op">−</span><span class="var">E<sub>Na</sub></span>)
                </div>
                <div class="eq-row indent">
                    <span class="op">−</span> <span class="var">g<sub>K</sub></span><span class="var">n</span><sup>4</sup>(<span class="var">V</span><span class="op">−</span><span class="var">E<sub>K</sub></span>)
                    <span class="op">−</span> <span class="var">g<sub>L</sub></span>(<span class="var">V</span><span class="op">−</span><span class="var">E<sub>L</sub></span>)
                </div>
            </div>
        `,
        parameters: [
            { id: 'I_ext', label: 'Input Current (µA)', min: 0, max: 20, step: 0.5, value: 10 },
            { id: 'gNa', label: 'gNa (mS/cm²)', min: 0, max: 200, step: 10, value: 120 },
            { id: 'gK', label: 'gK (mS/cm²)', min: 0, max: 50, step: 5, value: 36 },
            { id: 'gL', label: 'gL (mS/cm²)', min: 0, max: 1.0, step: 0.1, value: 0.3 },
        ],
        // n is initialized dynamically
        initialState: { x: -65, y: 0.05, z: 0.6, t: 0 },
        simulate: (params, state, dt) => {
            const [I_ext, gNaMax, gKMax, gL] = params;
            
            // Standard HH Constants
            const ENa = 50;
            const EK = -77;
            const EL = -54.4;
            const Cm = 1.0;
            
            // Unpack State (x=V, y=m, z=h)
            let V = state.x;
            let m = state.y;
            let h = state.z;
            let n = state.n !== undefined ? state.n : 0.32;

            // --- SAFE MATH HELPERS ---
            // These prevent division by zero when V is exactly at singularity points
            
            // Alpha n: Singularity at -55
            const alpha_n = (Math.abs(V + 55) < 1e-5) 
                ? 0.1 
                : (0.01 * (V + 55)) / (1 - Math.exp(-(V + 55) / 10));
            const beta_n = 0.125 * Math.exp(-(V + 65) / 80);

            // Alpha m: Singularity at -40
            const alpha_m = (Math.abs(V + 40) < 1e-5) 
                ? 1.0 
                : (0.1 * (V + 40)) / (1 - Math.exp(-(V + 40) / 10));
            const beta_m = 4 * Math.exp(-(V + 65) / 18);

            // h (no singularities)
            const alpha_h = 0.07 * Math.exp(-(V + 65) / 20);
            const beta_h = 1 / (1 + Math.exp(-(V + 35) / 10));

            // Currents
            const INa = gNaMax * (m * m * m) * h * (V - ENa);
            const IK  = gKMax * (n * n * n * n) * (V - EK);
            const IL  = gL * (V - EL);

            // Derivatives
            const dV = (I_ext - INa - IK - IL) / Cm;
            const dm = alpha_m * (1 - m) - beta_m * m;
            const dh = alpha_h * (1 - h) - beta_h * h;
            const dn = alpha_n * (1 - n) - beta_n * n;

            return {
                x: V + dt * dV,
                y: m + dt * dm,
                z: h + dt * dh,
                n: n + dt * dn, // Save n for next step
                t: state.t + dt
            };
        },
        plotConfig: {
            title: 'Hodgkin-Huxley Dynamics',
            yaxis: { title: 'Voltage (mV)', range: [-90, 50] }
        }
    }
};