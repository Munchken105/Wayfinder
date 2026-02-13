import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import searchRoutes from "./routes/searchRoutes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/search", searchRoutes);

const PORT = process.env.PORT || 5000;

// Types
interface Node {
  id: string;
  name: string;
  type: 'room' | 'hallway' | 'computer_area' | 'study_area' | 'entrance' | 'bathroom' | 'elevator' | 'stairs';
  floor: number;
  x?: number;
  y?: number;
  coord?: [number, number];
}

interface PathResult {
  path: string[];
  steps: number;
  instructions: string[];
}

// Single floor building graph - all rooms on the same floor
const nodes: Node[] = [
  // All available rooms on the second floors
  { id: "room_221", name: "Room 221", type: "room", floor: 2, coord:[438, 90] },
  { id: "room_221D", name: "Room 221D", type: "room", floor: 2, coord:[530, 90]},
  { id: "room_222", name: "Room 222", type: "room", floor: 2, coord:[580, 90] },
  { id: "room_222A", name: "Room 222A", type: "room", floor: 2, coord:[650, 90] },
  { id: "room_223", name: "Room 223", type: "room", floor: 2, coord:[740, 75] },
  { id: "room_223", name: "Room 223", type: "room", floor: 2, coord:[670, 45]},
  { id: "room_228", name: "Room 228", type: "room", floor: 2, coord:[975, 85] },
  { id: "room_229", name: "Room 229", type: "room", floor: 2, coord:[941, 58] },
  { id: "room_230", name: "Room 230", type: "room", floor: 2, coord:[941, 30] },
  { id: "room_232", name: "Room 232", type: "room", floor: 2, coord:[1005, 58]},

  // Passageways and entrances of the second floor
  { id: "main_entrance", name: "Main Entrance", type: "entrance", floor: 2, coord:[530, 620]},
  { id: "top_comp_area", name: "Computer Area 1", type: "computer_area", floor: 2, coord: [825, 197]},
  { id: "right_comp_area", name: "Computer Area 2", type: "computer_area", floor: 2, coord:[942, 407]},
  { id: "elevator_001", name: "Elevator 1", type: "elevator", floor: 2, coord:[723, 513]},
  { id: "elevator_002", name: "Elevator 2", type: "elevator", floor: 2, coord:[744, 492]},
  { id: "floor_1_stairs", name: "Stairs to Floor 1", type: "stairs", floor: 2, coord:[452, 518]},
  { id: "bathroom_002", name: "Bathroom (2nd Floor)", type: "bathroom", floor: 2, coord:[870, 85]},

  // Study areas (replacing hallways/junctions)
  { id: "left_study_area", name: "Study Area 01", type: "study_area", floor: 2, coord:[560, 208]},
  { id: "right_study_area", name: "Study Area 02", type: "study_area", floor: 2, coord: [974, 215]},
];

// Adjacency list - all connections on the same floor
const graph: { [key: string]: string[] } = {
  // Main entrance and elevator connections (now connect to study areas)
  "room_221": ["left_study_area", "top_comp_area"],
  "room_221D": ["left_study_area", "top_comp_area"],
  "room_222": ["left_study_area", "top_comp_area"],
  "room_222A": ["left_study_area", "top_comp_area", "room_223"],
  "room_223": ["left_study_area", "top_comp_area", "room_222A"],
  "room_228": ["right_study_area"],
  "room_229": ["room_228"],
  "room_230": ["room_228"],
  "room_232": ["room_228"],

  // Special areas
  "main_entrance": ["elevator_001", "elevator_002", "floor_1_stairs"],
  "top_comp_area": ["right_study_area", "left_study_area", "room_228", "bathroom_002"],
  "right_comp_area": ["top_comp_area", "right_study_area", "elevator_001", "elevator_002"],
  "elevator_001": ["right_study_area", "right_comp_area", "top_comp_area", "elevator_002", "main_entrance"],
  "elevator_002": ["right_study_area", "right_comp_area", "top_comp_area", "elevator_001", "main_entrance"],
  "bathroom_002": ["left_study_area", "right_study_area", "top_comp_area"],
  "floor_1_stairs": ["main_entrance"],

  // Study area connections (replacing hallways/junctions)
  "left_study_area":["room_221", "room_221D", "room_222", "room_222A", "room_223", "top_comp_area", "bathroom_002"],
  "right_study_area":["room_228", "top_comp_area", "right_comp_area", "elevator_001", "elevator_002"]
};

// ! BFS algorithm for shortest path (fewest steps)
function findShortestPathBFS(startNodeId: string, endNodeId: string): PathResult | null {
  if (startNodeId === endNodeId) {
    const node = nodes.find(n => n.id === startNodeId);
    return {
      path: [startNodeId],
      steps: 0,
      instructions: [`You are already at ${node?.name || 'your location'}`]
    };
  }

  const visited = new Set<string>();
  const queue: { node: string; path: string[] }[] = [];
  
  // Start BFS
  queue.push({ node: startNodeId, path: [startNodeId] });
  visited.add(startNodeId);

  while (queue.length > 0) {
    const currentItem = queue.shift();
    if (!currentItem) break;

    const { node, path } = currentItem;

    // Check all neighbors
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const newPath = [...path, neighbor];
        
        // Found destination
        if (neighbor === endNodeId) {
          const instructions = generateInstructions(newPath);
          return {
            path: newPath,
            steps: newPath.length - 1,
            instructions
          };
        }

        // Continue BFS
        visited.add(neighbor);
        queue.push({ node: neighbor, path: newPath });
      }
    }
  }

  return null; // No path found
}

// Generate human-readable instructions from path
function generateInstructions(path: string[]): string[] {
  const instructions: string[] = [];
  
  const startNode = nodes.find(n => n.id === path[0]);
  instructions.push(`Start at ${startNode?.name || 'starting point'}`);

  for (let i = 0; i < path.length - 1; i++) {
    const currentId = path[i];
    const nextId = path[i + 1];
    const currentNode = nodes.find(n => n.id === currentId);
    const nextNode = nodes.find(n => n.id === nextId);

    if (!currentNode || !nextNode) continue;

    let instruction = "";

    // All navigation is on the same floor
    if (currentNode.type === 'room' && nextNode.type === 'hallway') {
      instruction = `Exit ${currentNode.name} and turn into the hallway`;
    } else if (currentNode.type === 'hallway' && nextNode.type === 'room') {
      instruction = `Enter ${nextNode.name}`;
    } else if (currentNode.type === 'hallway' && nextNode.type === 'study_area') {
      instruction = `Continue to ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'hallway') {
      instruction = `Take the hallway toward ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'study_area') {
      instruction = `Continue through ${nextNode.name}`;
    } else if (currentNode.type === 'hallway' && nextNode.type === 'hallway') {
      instruction = `Continue down the hallway`;
    } else if (currentNode.type === 'entrance' && nextNode.type === 'hallway') {
      instruction = `From entrance, proceed to ${nextNode.name}`;
    } else {
      instruction = `Go to ${nextNode.name}`;
    }

    if (instruction) {
      instructions.push(instruction);
    }
  }

  const endNode = nodes.find(n => n.id === path[path.length - 1]);
  instructions.push(`Arrive at ${endNode?.name || 'destination'}`);
  
  return instructions;
}

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Single Floor Navigation Backend (BFS) - Use /api/navigation/from/:start/to/:end");
});

// Get all nodes
app.get("/api/nodes", (req: Request, res: Response) => {
  res.json({
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      floor: node.floor
    }))
  });
});

// Get all locations
app.get("/api/rooms", (req: Request, res: Response) => {
  // Include all location types: rooms, entrances, elevators, and junctions
  const locations = nodes.filter(node => 
    node.type === 'room' || 
    node.type === 'entrance' || 
    node.type === 'computer_area' ||
    node.type === 'study_area'
  );
  
  // Sort locations by type and name for better organization in dropdown
  const sortedLocations = locations.sort((a, b) => {
    // First sort by type
    if (a.type !== b.type) {
      const typeOrder: { [key: string]: number } = { entrance: 1, room: 2, junction: 3 };
      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  res.json({ rooms: sortedLocations });
});

// Find shortest path using BFS
app.get("/api/navigation/from/:start/to/:end", (req: Request, res: Response) => {
  const start = req.params.start;
  const end = req.params.end;

  // Check if parameters are provided
  if (!start || !end) {
    return res.status(400).json({ 
      error: "Both start and end parameters are required",
      example: "/api/navigation/from/223/to/classroom_b20"
    });
  }

  const startNode = nodes.find(n => 
    n.id === start || 
    n.name.toLowerCase().includes(start.toLowerCase()) ||
    n.id.toLowerCase().includes(start.toLowerCase())
  );
  
  const endNode = nodes.find(n => 
    n.id === end || 
    n.name.toLowerCase().includes(end.toLowerCase()) ||
    n.id.toLowerCase().includes(end.toLowerCase())
  );

  if (!startNode) {
    return res.status(404).json({ 
      error: `Start location '${start}' not found`,
      availableRooms: nodes.filter(n => n.type === 'room').map(n => ({ id: n.id, name: n.name, floor: n.floor }))
    });
  }

  if (!endNode) {
    return res.status(404).json({ 
      error: `End location '${end}' not found`,
      availableRooms: nodes.filter(n => n.type === 'room').map(n => ({ id: n.id, name: n.name, floor: n.floor }))
    });
  }

  // Check if both rooms are on the same floor
  if (startNode.floor !== endNode.floor) {
    return res.status(400).json({ 
      error: "Multi-floor navigation not supported",
      message: "This building only has single-floor navigation. Both rooms must be on the same floor.",
      startFloor: `${startNode.floor}F`,
      endFloor: `${endNode.floor}F`
    });
  }

  // Special routing rule: if destination is a study area, route must go via the nearest elevator first
  const isStudyTarget = endNode.id.startsWith("study") || endNode.name.toLowerCase().includes("study") || endNode.id === "221" || endNode.id === "233H";

  // If the user starts at the main entrance, prefer the path Main Entrance -> Reception Desk (235A) -> Elevator -> Study Area
  if (startNode.id === "C235" && isStudyTarget) {
    const reception = nodes.find(n => n.id === "235A");
    if (reception) {
      const pathToReception = findShortestPathBFS(startNode.id, reception.id);
      if (pathToReception) {
        // Find elevator reachable from reception that can reach destination
        const elevators = nodes.filter(n => n.type === 'entrance' && /^E\d+/.test(n.id));
        let chosenElev: Node | null = null;
        let bestScore = Infinity;
        let pathReceptionToElev: PathResult | null = null;
        let pathElevToDest: PathResult | null = null;

        for (const el of elevators) {
          const p1 = findShortestPathBFS(reception.id, el.id);
          const p2 = findShortestPathBFS(el.id, endNode.id);
          if (p1 && p2) {
            const score = p1.steps + p2.steps;
            if (score < bestScore) {
              bestScore = score;
              chosenElev = el;
              pathReceptionToElev = p1;
              pathElevToDest = p2;
            }
          }
        }

        if (chosenElev && pathReceptionToElev && pathElevToDest) {
          const leg1 = pathToReception.path; // start -> reception
          const leg2 = pathReceptionToElev.path; // reception -> elevator
          const leg3 = pathElevToDest.path; // elevator -> dest

          // combine without duplicating nodes at joins
          const combinedPath = [...leg1, ...leg2.slice(1), ...leg3.slice(1)];

          const instr1 = generateInstructions(leg1);
          const instr2 = generateInstructions(leg2);
          const instr3 = generateInstructions(leg3);

          const finalInstructions = [
            ...instr1,
            `Check in at the Reception Desk (${reception.name})`,
            ...instr2.slice(1),
            `Take the elevator at ${chosenElev.name} to continue to ${endNode.name}`,
            ...instr3.slice(1)
          ];

          return res.json({
            start: startNode.name,
            end: endNode.name,
            totalSteps: combinedPath.length - 1,
            floor: `${startNode.floor}F`,
            path: combinedPath.map(nodeId => {
              const node = nodes.find(n => n.id === nodeId);
              return {
                id: nodeId,
                name: node?.name || 'Unknown',
                type: node?.type || 'unknown',
                floor: node?.floor || 2
              };
            }),
            instructions: finalInstructions
          });
        }
      }
    }
    // fall through to generic study routing if receptionist-based route not possible
  }

  if (isStudyTarget) {
    // Find elevator nodes available in this floor
    const elevators = nodes.filter(n => n.type === 'entrance' && /^E\d+/.test(n.id));

    // Pick the elevator with shortest path to the destination
    let bestElevator: Node | null = null;
    let bestDist = Infinity;
    let bestElevatorPath: PathResult | null = null;

    for (const el of elevators) {
      const p = findShortestPathBFS(el.id, endNode.id);
      if (p && p.steps < bestDist) {
        bestDist = p.steps;
        bestElevator = el;
        bestElevatorPath = p;
      }
    }

    // If we found an elevator that reaches the study area, build composite route start -> elevator -> destination
    if (bestElevator && bestElevatorPath) {
      const pathToElevator = findShortestPathBFS(startNode.id, bestElevator.id);

      // If either leg is missing, fall back to direct path
      if (!pathToElevator) {
        // fallback to direct
      } else {
        const leg1 = pathToElevator.path; // start -> elevator
        const leg2 = bestElevatorPath.path; // elevator -> dest

        // combine without duplicating elevator
        const combinedPath = [...leg1, ...leg2.slice(1)];

        // Build instructions: instr1 + explicit elevator instruction + instr2 (without its start line)
        const instr1 = generateInstructions(leg1);
        const instr2 = generateInstructions(leg2);

        // Compose final instructions
        const finalInstructions = [
          ...instr1,
          `Take the elevator at ${bestElevator.name} to continue to ${endNode.name}`,
          ...instr2.slice(1) // remove 'Start at ...' from second leg
        ];

        return res.json({
          start: startNode.name,
          end: endNode.name,
          totalSteps: combinedPath.length - 1,
          floor: `${startNode.floor}F`,
          path: combinedPath.map(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            return {
              id: nodeId,
              name: node?.name || 'Unknown',
              type: node?.type || 'unknown',
              floor: node?.floor || 2
            };
          }),
          instructions: finalInstructions
        });
      }
    }
    // else fall through to direct path if no elevator route found
  }

  const pathResult = findShortestPathBFS(startNode.id, endNode.id);

  if (!pathResult) {
    return res.status(404).json({ error: "No path found between the specified locations" });
  }

  res.json({
    start: startNode.name,
    end: endNode.name,
    totalSteps: pathResult.steps,
    floor: `${startNode.floor}F`,
    path: pathResult.path.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      return {
        id: nodeId,
        name: node?.name || 'Unknown',
        type: node?.type || 'unknown',
        floor: node?.floor || 2
      };
    }),
    instructions: pathResult.instructions
  });
});

// Specific route for Room 202 to Classroom B20 (same floor)
app.get("/api/navigation/room202-to-b20", (req: Request, res: Response) => {
  const pathResult = findShortestPathBFS("223", "classroom_b20");
  
  if (!pathResult) {
    return res.status(404).json({ error: "No path found from Room 202 to Classroom B20" });
  }

  const startNode = nodes.find(n => n.id === "223");
  const endNode = nodes.find(n => n.id === "classroom_b20");

  res.json({
    start: startNode?.name || "Room 202",
    end: endNode?.name || "Classroom B20",
    totalSteps: pathResult.steps,
    floor: "2F",
    path: pathResult.path.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      return {
        id: nodeId,
        name: node?.name || 'Unknown',
        type: node?.type || 'unknown',
        floor: node?.floor || 2
      };
    }),
    instructions: pathResult.instructions
  });
});

// Get available routes on this floor
app.get("/api/floor/:floorNumber/routes", (req: Request, res: Response) => {
  const floorNumber = req.params.floorNumber;
  
  if (!floorNumber) {
    return res.status(400).json({ error: "Floor number is required" });
  }

  const floorRooms = nodes.filter(node => 
    node.type === 'room' && node.floor.toString() === floorNumber
  );
  
  res.json({
    floor: `${floorNumber}F`,
    availableRooms: floorRooms.map(room => ({
      id: room.id,
      name: room.name
    })),
    totalRooms: floorRooms.length
  });
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  const floor2Rooms = nodes.filter(n => n.type === 'room' && n.floor === 2);
  
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    algorithm: "BFS (Breadth-First Search)",
    navigationType: "Single Floor Only",
    currentFloor: "2F",
    availableRooms: floor2Rooms.length,
    totalNodes: nodes.length,
    sampleRoutes: [
      "/api/navigation/room202-to-b20",
      "/api/navigation/from/room_201/to/classroom_b20",
      "/api/navigation/from/202/to/b20"
    ]
  });
});
// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Catch-all 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  const floor2Rooms = nodes.filter(n => n.type === 'room' && n.floor === 2);
  
  console.log(`Single Floor Navigation server running on port ${PORT}`);
  console.log(`Algorithm: BFS (Breadth-First Search)`);
  console.log(`Navigation Type: Single Floor Only (Floor 2)`);
  console.log(`Available rooms on Floor 2: ${floor2Rooms.map(n => n.name).join(', ')}`);
  console.log(`Sample route: GET /api/navigation/room202-to-b20`);
});