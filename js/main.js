import { NEURON_MODELS } from './models.js'; 
import { Simulator } from './simulator.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    // Instantiate the simulator engine, injecting the defined models and target container
    const app = new Simulator('app-mount', NEURON_MODELS, {
        defaultSystem: 'lif',
        dt: 0.02 // Global time step in ms
    });

    // Expose for debugging if needed
    // window.simulatorApp = app; 
});