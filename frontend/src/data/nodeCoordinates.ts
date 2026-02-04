
// Mapping of Node IDs (from backend) to [x, y] coordinates on the Floor2layout.jpg
// x is Left, y is Top
export const nodeCoordinates: Record<string, { x: number; y: number }> = {
    // Extracted from Floor2Page.tsx
    "221": { x: 376, y: 6 }, // "Room 221" (It was a hotspot, assumes center is roughly here)
    "221D": { x: 485, y: 6 },
    "222": { x: 537, y: 6 },
    "222A": { x: 601, y: 6 },
    "223": { x: 648, y: 8 },
    "230": { x: 872, y: 7 },
    "229": { x: 872, y: 43 },
    "228": { x: 904, y: 6 },
    "232": { x: 964, y: 3 },

    // Estimated positions for other rooms based on the image layout (assuming linear hallway)
    // Left side rooms?
    "C201": { x: 100, y: 100 }, // Placeholder

    // Hallway/Hub Nodes (Estimated positions to create a connected graph visualization)
    "study_main_ns": { x: 650, y: 150 }, // Central North-South hub (Main Corridor)
    "study_main_ew": { x: 800, y: 250 }, // East-West corridor
    "study_235": { x: 300, y: 150 },     // West corridor (near 235 rooms)
    "study_233": { x: 900, y: 300 },     // Near Auditorium

    // Key Points
    "C235": { x: 100, y: 400 }, // Main Entrance (Estimated bottom-left)
    "235A": { x: 250, y: 350 }, // Reception Desk
    "E240": { x: 500, y: 300 }, // Elevator
    "E239": { x: 550, y: 300 }, // Elevator

    // More Rooms (approximate positions for demo)
    "224A": { x: 700, y: 100 },
    "233": { x: 950, y: 350 },
    "234": { x: 150, y: 150 },
};
