/* ===================================================================
   INVENTORY & RESOURCE CARGO INITIAL DATA SCHEMAS
   =================================================================== */

export const DEFAULT_CARGO = {
    eezo: 120,    // Element Zero
    plat: 450,    // Platinum
    palla: 380,   // Palladium
    iri: 210      // Iridium
};

export const INITIAL_PROBES_COUNT = 15;

export const RESOURCE_TYPES = {
    eezo: { name: 'Element Zero (Eezo)', icon: 'fa-atom', color: 'purple' },
    plat: { name: 'Platinum Ore', icon: 'fa-gem', color: 'slate' },
    palla: { name: 'Palladium Node', icon: 'fa-cubes', color: 'amber' },
    iri: { name: 'Iridium Crystal', icon: 'fa-shield-halved', color: 'cyan' }
};
