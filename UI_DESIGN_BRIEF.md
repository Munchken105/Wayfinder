# UI Design Brief & Style Guide: Wayfinder Proto

**Version:** 1.0  
**Theme:** "The Scientific Journal"  
**Brand Identity:** University at Buffalo (Strict Adherence)

---

## 1. Design Philosophy
The revamped UI adopts an **"Old School Professional"** aesthetic, mimicking the layout and typography of a printed scientific journal or academic paper.

- **The Metaphor**: The user is reading a research paper on a desk.
    - **Background (`body`)**: The "Desk" (Neutral Grey).
    - **Container (`.container`)**: The "Paper" (Bright White, Shadowed).
    - **Map**: A "Figure" embedded in the article (`Fig. 1`).
    - **Directions**: The "Results" or "Methodology" section.
- **Tone**: Authoritative, Academic, Clear, Precise.

---

## 2. Color Palette
We strictly utilize the **University at Buffalo Institutional Brand Colors**.

### Primary Palette
| Color Name | Hex Code | Role in UI |
| :--- | :--- | :--- |
| **UB Blue** | `#005bbb` | Primary headers (`h1`), active states, key links, icons. |
| **Hayes Hall White** | `#ffffff` | Main content background (The "Paper"), high contrast text areas. |

### Secondary & Functional Palette
| Color Name | Hex Code | Role in UI |
| :--- | :--- | :--- |
| **Putnam Gray** | `#666666` | Secondary text, borders, input underlines, captions. |
| **Baird Point** | `#e4e4e4` | App background (The "Desk"), hover states for rows. |
| **Solar Strand** | `#ffc72c` | **Route Highlights** (Gold path on map), focused states. |
| **Letchworth Autumn** | `#e56a54` | Error states, alerts, "System Error" banners. |
| **Lake LaSalle** | `#00a69c` | Success indications, start markers (`Route Start`). |

---

## 3. Typography
Typography is the primary driver of the "Journal" aesthetic.

### Typeface A: Serif (Primary)
- **Font**: `Lora`, `Times New Roman`, serif.
- **Usage**:
    - **Headers**: `h1`, `h2`, `h3` (Titles, Abstracts, Section Headers).
    - **Body**: Standard text, directions, input placeholders.
    - **Buttons**: Navigation links.
- **Style**: Standard sizing (16px base), clean leading (1.6).

### Typeface B: Sans-Serif (Functional)
- **Font**: `Open Sans`, sans-serif.
- **Usage**:
    - **Captions**: "Fig. 1. Spatial representation..."
    - **Labels**: Map control buttons ("Level 1"), "Vol 1.0" metadata.
    - **Step Numbers**: The "1." in directions.
- **Rationale**: Provides technical contrast to the narrative serif text.

---

## 4. UI Components & Layout

### 4.1 The "Paper" Container
The application is wrapped in a central container to simulate a physical document.
- **Width**: Fixed max-width (`1200px`) to maintain readable line lengths.
- **Padding**: Generous (`3rem 4rem`), resizing for mobile.
- **Shadow**: `box-shadow: 0 4px 15px rgba(0,0,0,0.1)` (Lifted paper effect).

### 4.2 Semantic Headers
Instead of "Welcome", we use metadata-style headers.
- **Title**: Uppercase, Serif, UB Blue.
- **Subtitle**: "Current Location: Main Entrance Kiosk" (The "Abstract").
- **Metadata**: "Vol 1.0 • Spatial Navigation System" (Small, italic, gray).

### 4.3 Forms & Inputs ("Parameters")
- **Search Input**: No boxy borders.
    - **Style**: `border-bottom: 1px solid var(--putnam-gray)`.
    - **Interaction**: Blue underline on focus.
    - **Metaphor**: Filling out a line in a form or logbook.

### 4.4 The Map ("Figure 1")
- **Presentation**: Treated as an academic figure.
- **Border**: `1px solid #000` (Stark, high contrast).
- **Caption**: Required below the map (`.map-panel::after`).
    - *Content*: "Fig. 1. Spatial representation of Level [N]..."
- **Controls**: Minimalist utilitarian buttons, grouped like technical instruments.

### 4.5 Directions ("Results")
- **List Style**: Numbered list using CSS counters.
- **Step Items**:
    - **Text**: Serif, clear instruction.
    - **Landmarks**: Boxed in a dotted line (simulating a placeholder for a photo/chart).
    - **Path Highlight**: Uses `Solar Strand` (Gold) dashed lines on the map.

---

## 5. Mobile Experience
- **Responsiveness**: The "Paper" scales down to fill the screen width (`100%`).
- **Stacking**: Columns stack vertically (Controls top, Map bottom).
- **Handoff**: QR Code (`Fig 1a`) is generated for mobile transfer.

---

## 6. Implementation Notes
- **CSS Variables**: All colors are defined in `:root` for easy maintenance.
- **Assets**: Map SVGs (`floor1.svg`) must be capable of scaling within their `overflow: hidden` wrappers.
- **Modules**: Code is split (`search.js`, `map.js`, `utils.js`) to maintain a clean "Project Structure".
