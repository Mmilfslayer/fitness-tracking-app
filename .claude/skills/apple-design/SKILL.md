This skill distills Apple's interface design philosophy from WWDC talks (especially *Designing Fluid Interfaces*, 2018) into web-implementable patterns using CSS, Pointer Events, and spring libraries like Motion/Framer Motion.

**Core principle:** Interfaces feel alive when motion starts from the current on-screen value, inherits user velocity, projects momentum, and stays interruptible at every instant. Springs enable this because they're inherently velocity-aware and interruptible.

**Key techniques covered:**
- **Response:** Feedback on pointer-down, not release; eliminate latency on input path
- **Direct manipulation:** 1:1 pointer tracking with `setPointerCapture`, respecting grab offset
- **Interruptibility:** Animate from presentation value (not target); carry velocity through reversals; decompose 2D into independent X/Y springs
- **Springs:** Think in *damping ratio* (1.0 = critically damped) and *response* (seconds to target), not mass/stiffness/duration
- **Velocity handoff:** Pass release velocity to spring; normalize if API requires relative velocity
- **Momentum projection:** Project resting position using exponential decay (`d ≈ 0.998`), then snap to nearest target
- **Spatial consistency:** Symmetric enter/exit paths; anchor origins to trigger elements
- **Materials:** Translucent layers via `backdrop-filter`; weight encodes hierarchy; vibrancy for legibility
- **Reduced motion:** Cross-fades over slides/springs; respect `prefers-reduced-motion/transparency/contrast`
- **Typography:** Size-specific tracking (negative for display, near-zero for body); leading tracks size inversely; use system fonts

**Eight design foundations:** Purpose, Agency, Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight — with tactical rules for feedback, wayfinding, grouping, and specific labeling.

**Quick reference table** maps common needs to concrete spring values and techniques.