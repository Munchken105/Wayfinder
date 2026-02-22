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
  type: 'room' | 'hallway' | 'computer_area' | 'study_area' | 'entrance' | 'bathroom' | 'elevator' | 'stairs' | 'waypoint' | 'tablet';
  //type: "entrance | room | Stair/Fire_Exit | Tablet | Waypoint | Elevator"
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
  { id: "room_221", name: "Room 221", type: "room", floor: 2, coord:[437, 90] },
  { id: "room_221D", name: "Room 221-D", type: "room", floor: 2, coord:[532, 90]},
  { id: "room_222", name: "Room 222", type: "room", floor: 2, coord:[581, 90] },
  { id: "room_222A", name: "Room 222-A", type: "room", floor: 2, coord:[651, 90] },
  { id: "room_223", name: "Room 223", type: "room", floor: 2, coord:[740, 75]},
  { id: "room_228", name: "Room 228", type: "room", floor: 2, coord:[975, 85] },
  { id: "room_229", name: "Room 229", type: "room", floor: 2, coord:[941, 58] },
  { id: "room_230", name: "Room 230", type: "room", floor: 2, coord:[941, 30] },
  { id: "room_232", name: "Room 232", type: "room", floor: 2, coord:[1005, 58]},
  { id: "bathroom_002", name: "Bathroom", type: "bathroom", floor: 2, coord:[870, 85]},

  // Entrances of the Second Floor
  { id: "main_entrance", name: "main entrance", type: "entrance", floor: 2, coord:[532, 612]},

  // Elevators
  { id: "elevator_001", name: "the elevator", type: "elevator", floor: 2, coord:[708, 474]},

  // Tablet Location
  { id: "main_entrance", name: "Wayfinder tablet", type: "tablet", floor: 2, coord:[624, 593]},

  // Stairs / Fire Exit
  { id: "floor_1_stairs", name: "stairs to 1st Floor", type: "stairs", floor: 2, coord:[480, 525]},
  { id: "floor_1_stairs", name: "Fire Exit 1", type: "stairs", floor: 2, coord:[681, 503]},
  { id: "floor_1_stairs", name: "Fire Exit 2", type: "stairs", floor: 2, coord:[761, 80]},

  // Waypoint (nodes that are used as means to get to the the actual destination)
  { id: "top_comp_area", name: "lower layer 1 computer area", type: "waypoint", floor: 2, coord: [764, 390]},
  { id: "right_comp_area", name: "lower layer 2 computer area", type: "waypoint", floor: 2, coord:[880, 307]},
  { id: "top_comp_area", name: "middle layer 3 computer area", type: "waypoint", floor: 2, coord: [772, 256]},
  { id: "right_comp_area", name: "middle layer 4 computer area", type: "waypoint", floor: 2, coord:[761, 192]},
  { id: "top_comp_area", name: "middle layer 5 computer area", type: "waypoint", floor: 2, coord: [876, 192]},
  
];

// Adjacency list - all connections on the same floor
const graph: { [key: string]: string[] } = {
  // Main entrance and elevator connections (now connect to study areas)
  "room_221": ["left_study_area", "top_comp_area", "right_study_area"],
  "room_221D": ["left_study_area", "top_comp_area", "right_study_area"],
  "room_222": ["left_study_area", "top_comp_area", "right_study_area"],
  "room_222A": ["left_study_area", "top_comp_area", "right_study_area", "room_223"],
  "room_223": ["left_study_area", "top_comp_area", "right_study_area", "room_222A"],
  "room_228": ["left_study_area", "top_comp_area", "right_study_area", "room_229", "room_230", "room_232"],
  "room_229": ["room_228"],
  "room_230": ["room_228"],
  "room_232": ["room_228"],

  // Special areas
  "main_entrance": ["elevator_001", "elevator_002", "floor_1_stairs"],
  "top_comp_area": ["right_study_area", "left_study_area", "room_228", "bathroom_002"],
  "right_comp_area": ["top_comp_area", "left_study_area", "right_study_area", "elevator_001", "elevator_002"],
  "elevator_001": ["right_study_area", "right_comp_area", "top_comp_area", "elevator_002", "main_entrance"],
  "elevator_002": ["right_study_area", "right_comp_area", "top_comp_area", "elevator_001", "main_entrance"],
  "bathroom_002": ["left_study_area", "right_study_area", "top_comp_area"],
  "floor_1_stairs": ["main_entrance", "elevator_001", "elevator_002"],

  // Study area connections (replacing hallways/junctions)
  "left_study_area":["room_221", "room_221D", "room_222", "room_222A", "room_223", "top_comp_area", "right_study_area", "bathroom_002"],
  "right_study_area":["room_228", "top_comp_area", "right_comp_area", "left_study_area", "elevator_001", "elevator_002"]
};

// ! Dijkstra algorithm for shortest path (weighted by Euclidean distance between node coordinates)
function findShortestPathDijkstra(startNodeId: string, endNodeId: string): PathResult | null {
  if (startNodeId === endNodeId) {
    const node = nodes.find(n => n.id === startNodeId);
    return {
      path: [startNodeId],
      steps: 0,
      instructions: [`You are already at ${node?.name || 'your location'}`]
    };
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  // Helper to compute Euclidean distance between two nodes (fallback to 1 if coords missing)
  const coordOf = (id: string): [number, number] | null => {
    const n = nodes.find(x => x.id === id);
    return n && n.coord && n.coord.length === 2 ? n.coord : null;
  };

  const euclidean = (aId: string, bId: string) => {
    const a = coordOf(aId);
    const b = coordOf(bId);
    if (!a || !b) return 1; // fallback weight
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Initialize distances
  for (const n of nodes) {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
  }
  dist.set(startNodeId, 0);


  // Simple priority queue using array (small graph so acceptable)
  const compare = (a: [string, number], b: [string, number]) => a[1] - b[1];
  const pq: Array<[string, number]> = [[startNodeId, 0]];

  while (pq.length > 0) {
    // pop smallest
    pq.sort(compare);
    const [u] = pq.shift()!;
    
    if (visited.has(u)) continue;
    visited.add(u);

    if (u === endNodeId) break;

    const neighbors = graph[u] || [];
    for (const v of neighbors) {
      if (visited.has(v)) continue;
      const weight = euclidean(u, v);
      const alt = (dist.get(u) ?? Infinity) + weight;
      
      if (alt < (dist.get(v) ?? Infinity)) {
        dist.set(v, alt);
        prev.set(v, u);
        pq.push([v, alt]);
      }
    }
    // pq snapshot logging removed
  }

  if ((dist.get(endNodeId) ?? Infinity) === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  let cur: string | null = endNodeId;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) || null;
  }

  const instructions = generateInstructions(path);
  const totalDistance = dist.get(endNodeId) || 0;
  return {
    path,
    steps: Number(totalDistance.toFixed(2)),
    instructions
  };
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

    // Room exits and entries
    if (currentNode.type === 'room' && nextNode.type === 'study_area') {
      instruction = `Exit ${currentNode.name} and head to ${nextNode.name}`;
    } else if (currentNode.type === 'room' && nextNode.type === 'computer_area') {
      instruction = `Exit ${currentNode.name} and navigate to ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'room') {
      instruction = `Enter ${nextNode.name}`;
    } else if (currentNode.type === 'computer_area' && nextNode.type === 'room') {
      instruction = `Go to ${nextNode.name}`;
    }
    // Study area transitions
    else if (currentNode.type === 'study_area' && nextNode.type === 'study_area') {
      instruction = `Move to ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'computer_area') {
      instruction = `Head toward ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'bathroom') {
      instruction = `Navigate to ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'elevator') {
      instruction = `Move to ${nextNode.name}`;
    } else if (currentNode.type === 'study_area' && nextNode.type === 'stairs') {
      instruction = `Head to ${nextNode.name}`;
    }
    // Computer area transitions
    else if (currentNode.type === 'computer_area' && nextNode.type === 'study_area') {
      instruction = `Move to ${nextNode.name}`;
    } else if (currentNode.type === 'computer_area' && nextNode.type === 'computer_area') {
      instruction = `Continue to ${nextNode.name}`;
    } else if (currentNode.type === 'computer_area' && nextNode.type === 'elevator') {
      instruction = `Proceed to ${nextNode.name}`;
    } else if (currentNode.type === 'computer_area' && nextNode.type === 'bathroom') {
      instruction = `Navigate to ${nextNode.name}`;
    }
    // Elevator transitions
    else if (currentNode.type === 'elevator' && nextNode.type === 'study_area') {
      instruction = `Exit the elevator and head to ${nextNode.name}`;
    } else if (currentNode.type === 'elevator' && nextNode.type === 'computer_area') {
      instruction = `Exit the elevator and go to ${nextNode.name}`;
    } else if (currentNode.type === 'elevator' && nextNode.type === 'entrance') {
      instruction = `Exit the elevator toward ${nextNode.name}`;
    } else if (currentNode.type === 'elevator' && nextNode.type === 'elevator') {
      instruction = `Move to ${nextNode.name}`;
    }
    // Bathroom transitions
    else if (currentNode.type === 'bathroom' && nextNode.type === 'study_area') {
      instruction = `Exit bathroom and move to ${nextNode.name}`;
    } else if (currentNode.type === 'bathroom' && nextNode.type === 'computer_area') {
      instruction = `Exit bathroom and go to ${nextNode.name}`;
    }
    // Stairs transitions
    else if (currentNode.type === 'stairs' && nextNode.type === 'entrance') {
      instruction = `From stairs, proceed to ${nextNode.name}`;
    } else if (currentNode.type === 'stairs' && nextNode.type === 'study_area') {
      instruction = `From stairs, head to ${nextNode.name}`;
    }
    // Entrance transitions
    else if (currentNode.type === 'entrance' && nextNode.type === 'elevator') {
      instruction = `From the main entrance, proceed to ${nextNode.name}`;
    } else if (currentNode.type === 'entrance' && nextNode.type === 'stairs') {
      instruction = `From the main entrance, head to ${nextNode.name}`;
    } else if (currentNode.type === 'entrance' && nextNode.type === 'study_area') {
      instruction = `From the main entrance, proceed to ${nextNode.name}`;
    }
    // Default fallback
    else {
      instruction = `Continue to ${nextNode.name}`;
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
  res.send("Single Floor Navigation Backend (Dijkstra) - Use /api/navigation/from/:start/to/:end");
});

// Get all nodes
app.get("/api/nodes", (req: Request, res: Response) => {
  res.json({
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      floor: node.floor,
      coord: node.coord
    }))
  });
});

// Get all locations
app.get("/api/rooms", (req: Request, res: Response) => {
  // Include all location types: rooms, entrances, bathrooms, elevators, stairs, and areas
  const locations = nodes.filter(node => 
    node.type === 'room' || 
    node.type === 'entrance' || 
    node.type === 'computer_area' ||
    node.type === 'study_area' ||
    node.type === 'bathroom' ||
    node.type === 'elevator' ||
    node.type === 'stairs'
  );
  
  // Sort locations by type and name for better organization in dropdown
  const sortedLocations = locations.sort((a, b) => {
    // First sort by type
    if (a.type !== b.type) {
      const typeOrder: { [key: string]: number } = { 
        entrance: 1, 
        room: 2, 
        bathroom: 3,
        elevator: 4,
        stairs: 5,
        computer_area: 6,
        study_area: 7
      };
      return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  res.json({ rooms: sortedLocations });
});

// Find shortest path using Dijkstra algorithm
app.get("/api/navigation/from/:start/to/:end", (req: Request, res: Response) => {
  const start = req.params.start;
  const end = req.params.end;

  // Detailed request logging removed

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
    console.warn(`Start node not found for provided param: '${start}'`);
    return res.status(404).json({ 
      error: `Start location '${start}' not found`,
      availableRooms: nodes.filter(n => n.type === 'room').map(n => ({ id: n.id, name: n.name, floor: n.floor }))
    });
  }

  if (!endNode) {
    console.warn(`End node not found for provided param: '${end}'`);
    return res.status(404).json({ 
      error: `End location '${end}' not found`,
      availableRooms: nodes.filter(n => n.type === 'room').map(n => ({ id: n.id, name: n.name, floor: n.floor }))
    });
  }

  // Check if both locations are on the same floor
  if (startNode.floor !== endNode.floor) {
    return res.status(400).json({ 
      error: "Multi-floor navigation not supported",
      message: "This building only has single-floor navigation. Both locations must be on the same floor.",
      startFloor: `${startNode.floor}F`,
      endFloor: `${endNode.floor}F`
    });
  }

  // Use Dijkstra to find the shortest path
  const pathResult = findShortestPathDijkstra(startNode.id, endNode.id);

  if (!pathResult) {
    console.warn(`No path found between '${startNode.name}' and '${endNode.name}'`);

    // Deep debug: print node ids, graph keys, and run a BFS to show reachability
    try {
      // reachability debug logging removed
      const hasStartKey = Object.prototype.hasOwnProperty.call(graph, startNode.id);
      const hasEndKey = Object.prototype.hasOwnProperty.call(graph, endNode.id);

      // BFS reachability trace
      const visitedOrder: string[] = [];
      const q: string[] = [startNode.id];
      const seen = new Set<string>([startNode.id]);
      let reachable = false;

      while (q.length > 0) {
        const cur = q.shift()!;
        visitedOrder.push(cur);
        const neigh = graph[cur] || [];
        for (const nb of neigh) {
          if (!seen.has(nb)) {
            seen.add(nb);
            q.push(nb);
            if (nb === endNode.id) reachable = true;
          }
        }
      }

      // BFS debug logging removed
    } catch (derr) {
      console.error('Error during reachability debug:', derr);
    }

    return res.status(404).json({ 
      error: "No path found between the specified locations",
      start: startNode.name,
      end: endNode.name,
      availableLocations: nodes.filter(n => n.floor === startNode.floor).map(n => ({ id: n.id, name: n.name, type: n.type }))
    });
  }

  // Log the computed Dijkstra result to the server terminal for debugging
  try {
    // result logging removed
  } catch (err) {
    console.error('Error logging Dijkstra result:', err);
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
  const pathResult = findShortestPathDijkstra("223", "classroom_b20");
  
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
  const floor2All = nodes.filter(n => n.floor === 2);
  
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    algorithm: "Dijkstra (Weighted - Euclidean distance)",
    navigationType: "Single Floor Only",
    currentFloor: "2F",
    availableRooms: floor2Rooms.length,
    totalLocations: floor2All.length,
    locationTypes: {
      rooms: floor2All.filter(n => n.type === 'room').length,
      bathrooms: floor2All.filter(n => n.type === 'bathroom').length,
      elevators: floor2All.filter(n => n.type === 'elevator').length,
      stairs: floor2All.filter(n => n.type === 'stairs').length,
      computerAreas: floor2All.filter(n => n.type === 'computer_area').length,
      studyAreas: floor2All.filter(n => n.type === 'study_area').length,
      entrances: floor2All.filter(n => n.type === 'entrance').length
    },
    totalNodes: nodes.length,
    sampleRoutes: [
      "/api/navigation/from/main_entrance/to/room_221",
      "/api/navigation/from/room_221/to/bathroom_002",
      "/api/navigation/from/room_228/to/elevator_001"
    ]
  });
});

// Catch-all 404 route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  const floor2Rooms = nodes.filter(n => n.type === 'room' && n.floor === 2);
  const floor2All = nodes.filter(n => n.floor === 2);
  
  // Startup logs removed
});