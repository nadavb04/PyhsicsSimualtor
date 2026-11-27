# Project Specification: Physics Intuition Simulator

## 1. Project Vision & Core Objective

Build an interactive, mobile-first web application that helps students taking their first steps in physics develop **physical intuition** rather than relying on algebraic plug-and-chug calculations. Students learn by **predicting outcomes**, **manipulating physical parameters**, and **observing visual cues** (motion trails, vectors, ghosted comparison runs) in real time.

---

## 2. Technical Architecture & Infrastructure Decisions

### Hosting & Scale

- **Platform:** Static Web Application hosted on **GitHub Pages** (or Vercel/Netlify).
- **Scale & Concurrency:** Designed for ~10 concurrent student users. Client-side simulation execution ensures zero backend bottlenecks and instant load times.
- **No In-App LLM at Launch:** Do **not** integrate a live LLM API inside the student-facing app. All feedback, hints, and conceptual debriefs must be pre-authored in structured data files to guarantee zero network lag, zero API key exposure on static hosting, and 100% physics accuracy.
- **PWA Readiness:** Include a clean `manifest.json` so mobile users can optionally add the web app to their home screen.

### Recommended Tech Stack

- **Framework:** React + Vite + TypeScript (or clean modular vanilla JS/TS if preferred for minimal overhead).
- **Styling:** Tailwind CSS (configured with a strict mobile-first approach).
- **Simulation & Rendering:** Lightweight HTML5 2D `<canvas>` or `<svg>` using clean, transparent numerical integration (Euler / Velocity Verlet) with capped `dt` steps for smooth 60fps performance and low battery usage on mobile browsers.
- **State & Progress Persistence:** Store student points, topic completion, and streaks in `localStorage` so progress persists across mobile browser sessions without requiring user authentication or a database.

---

## 3. Mobile-First UX & UI Requirements

1. **Portrait-First Layout:**
   - Top/Upper Viewport (~45–50% height): Interactive Physics Simulation Stage + live visual overlays (velocity/acceleration arrows, strobe motion trails, ghosted previous runs, live mini-graphs where applicable).
   - Lower Viewport: Compact, thumb-reachable control panel containing parameter sliders, playback controls (`Play`, `Pause`, `Reset`, `Step`), and the active prediction card.
2. **Touch-Friendly Controls:**
   - Minimum 44x44px touch targets for all buttons and multiple-choice options.
   - Custom-styled, wide-track range sliders with clear qualitative/numeric labels and step increments that are easy to drag with a thumb without triggering accidental page scrolling (`touch-action: none` on active canvas/sliders).
3. **Intuition Over Equations:**
   - Avoid cluttering the UI with algebraic formulas during exploration. Emphasize visual cause-and-effect: color-coded vectors (e.g., green for velocity, orange/red for acceleration), strobe dots at equal time intervals, and ghost overlays comparing parameter changes.

---

## 4. Pedagogical Loop & Gamification System

### The Prediction-First Learning Loop

Each question (and its sub-questions) must follow this interactive flow:

1. **Explore Setup:** Present the scenario and allow the student to inspect or adjust allowed system parameters.
2. **Predict:** Present a qualitative multiple-choice prediction question _before_ revealing the full outcome (or lock the "Test Prediction" confirmation before scoring).
3. **Observe & Verify:** Run the simulation so the student watches the physical behavior unfold visually alongside visual cues (trails, vectors, turning-point markers).
4. **Debrief:**
   - **On Correct Prediction:** Display randomized **Physics-Hero Praise** (e.g., _"Sharp intuition like Galileo!"_, _"You're thinking like Einstein!"_, _"Feynman-level curiosity!"_, _"Newton would approve!"_) + a concise conceptual takeaway.
   - **On Incorrect Prediction:** Display a non-punitive, misconception-targeted hint pointing directly to what happened visually in the simulation, and allow the student to tweak parameters and retry.

### Points & Progress Aggregation

- Award points for correct predictions (e.g., higher points on first try, partial points on retry, bonus points for experimenting with parameter sliders).
- Aggregate and display scores:
  - **Per Question / Sub-question**
  - **Per Topic** (e.g., _1D Kinematics: 120 / 200 pts_)
  - **Overall Total Score & Streak** in a compact top header bar.

---

## 5. Data-Driven Content Architecture (Incremental Updates)

The codebase **must strictly separate simulation engines from curriculum content** so new topics and questions can be added incrementally by editing JSON/TypeScript data files without modifying UI or engine code.

### Suggested Data Schema (`src/data/topics.ts` or `.json`)

```typescript
export interface SliderParam {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  lockedDuringPrediction?: boolean;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string; // Tailored to the specific misconception or physics insight
}

export interface SubQuestion {
  id: string;
  prompt: string;
  options: ChoiceOption[];
  visualFocusCue?: string; // e.g., "highlight_turning_point", "show_velocity_vector"
  presetOverrides?: Record<string, number>; // Optional parameter lock/preset for this sub-question
}

export interface PhysicsQuestion {
  id: string;
  title: string;
  scenarioDescription: string;
  simulationTemplate:
    | 'vertical-throw'
    | 'two-cars-chase'
    | 'cart-1d-vectors'
    | 'strobe-runner'
    | 'free-fall-pair'
    | 'vacuum-tube-drag'
    | 'glider-vt-graph'
    | 'valley-track-race';
  parameters: SliderParam[];
  visualOverlays: {
    showVelocityVector?: boolean;
    showAccelerationVector?: boolean;
    showStrobeDots?: boolean;
    showGhostComparison?: boolean;
    showLiveVTGraph?: boolean;
  };
  subQuestions: SubQuestion[];
}

export interface PhysicsTopic {
  id: string;
  title: string;
  description: string;
  questions: PhysicsQuestion[];
}
```

---

## 6. Initial Curriculum: Topic 1 — 1D Kinematics (10 Questions)

Implement **Topic 1: 1D Kinematics** with the following 10 questions (inspired by _Thinking Physics_, _Conceptual Physics_, _The Flying Circus of Physics_, and Physics Education Research misconceptions):

1. **Stone Thrown Upward from a Building (Symmetry & Turning Points)**
   - _Params:_ Launch Speed, Building Height, Air Drag (Off/On).
   - _Sub-questions:_ (a) Does the stone pass the same height above the ledge twice? (b) How does downward speed compare to upward speed at that height (drag off)? (c) What are velocity and acceleration at the very peak?
2. **Two Cars Passing Each Other (Position vs. Velocity Trap)**
   - _Params:_ Car A Constant Speed, Car B Acceleration (from rest behind A).
   - _Sub-questions:_ (a) At the exact instant Car B passes Car A, do they have the same speed? (b) When _did_ they have the exact same speed?
3. **Speeding Up vs. Slowing Down (Sign Confusion)**
   - _Params:_ Initial Velocity (negative/left to positive/right), Constant Acceleration (negative to positive).
   - _Sub-questions:_ (a) If acceleration is negative, must the cart always be slowing down? (b) When moving right with leftward acceleration, what happens after it momentarily stops?
4. **Motion Trail Dot-Spacing (Strobe / Ticker-Tape Intuition)**
   - _Params:_ Initial Speed, Acceleration, Strobe Interval.
   - _Sub-questions:_ (a) If strobe dots get closer together from left to right, what is the runner doing? (b) If constant speed is doubled, how does the dot spacing change?
5. **Dropped vs. Thrown Downward (Constant Acceleration)**
   - _Params:_ Ball B Downward Launch Speed (Ball A starts at 0), Tower Height.
   - _Sub-questions:_ (a) Once released (no air), which ball has greater downward acceleration? (b) Does the vertical gap between them stay constant, shrink, or grow as they fall?
6. **Doubling Launch Speed Upward (Quadratic Height Scaling)**
   - _Params:_ Launch Speed ($1\times$ vs. $2\times$ ghost comparison), Gravity.
   - _Sub-questions:_ (a) Doubling launch speed changes hang time by what factor? ($2\times$) (b) Doubling launch speed changes maximum height by what factor? ($4\times$)
7. **Chasing a Departing Bus (Closing the Gap)**
   - _Params:_ Runner Constant Speed, Bus Acceleration, Initial Gap.
   - _Sub-questions:_ (a) If the runner barely misses the bus, at what exact instant are they closest to the door? (When speeds match.) (b) How does increasing the initial gap affect the speed needed to catch it?
8. **Heavy vs. Light in Free Fall — With and Without Air**
   - _Params:_ Air Density (0 = Vacuum to Thick Air), Object Mass (Bowling Ball vs. Beach Ball of equal size).
   - _Sub-questions:_ (a) In a vacuum, which lands first? (b) With air density turned up, why does the lighter ball fall behind?
9. **Reading a Velocity-vs-Time Line (Direction vs. Slope)**
   - _Params:_ Starting Velocity, Acceleration (Slope) with live synchronized $v(t)$ graph.
   - _Sub-questions:_ (a) What is the glider physically doing when a downward-sloping $v(t)$ line crosses $v = 0$? (b) At what point on the graph is the glider farthest from its starting position?
10. **Two Paths, Same Distance (The Valley Track Race)**
    - _Params:_ Initial Roll Speed, Valley Depth (Track A is flat; Track B dips into a smooth valley and returns to original height).
    - _Sub-questions:_ (a) Assuming negligible friction, how do their speeds compare after Track B exits the valley? (b) Which marble reaches the finish line first, and why?

---

## 7. Implementation Milestones for the Coding Agent

1. **Scaffold App & Mobile Shell:** Set up Vite + React + TypeScript + Tailwind CSS with a mobile-first viewport layout, top score/topic navigation bar, and `localStorage` progress store.
2. **Build Reusable Simulation Stage & Controls:** Create the responsive `<canvas>` wrapper with `Play/Pause/Reset`, touch-friendly parameter sliders, vector/strobe/ghost rendering utilities, and the Prediction-First Q&A card.
3. **Implement 1D Kinematics Simulation Templates:** Build the physics step logic for the 1D templates (`vertical-throw`, `two-cars-chase`, `cart-1d-vectors`, `strobe-runner`, `free-fall-pair`, `vacuum-tube-drag`, `glider-vt-graph`, `valley-track-race`).
4. **Populate Topic 1 Content & Hero Feedback:** Add all 10 1D Kinematics questions, sub-questions, misconception-targeted feedback messages, and randomized Physics-Hero praise lines.
5. **Verify Mobile UX & Static Build:** Ensure smooth 60fps performance on mobile viewports (375px–430px width), zero horizontal overflow, and clean static build output ready for GitHub Pages deployment.
