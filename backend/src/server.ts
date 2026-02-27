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
  type: 'room' | 'entrance' | 'elevator' | 'stairs' | 'waypoint' | 'tablet' ;
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
  { id: "A1_room221", name: "Room 221", type: "room", floor: 2, coord:[440, 100] },
  { id: "A1_room221D", name: "Room 221-D", type: "room", floor: 2, coord:[535, 100]},
  { id: "A1_room222", name: "Room 222", type: "room", floor: 2, coord:[584, 100] },
  { id: "A1_room222A", name: "Room 222-A", type: "room", floor: 2, coord:[653, 100] },
  { id: "A1_room223", name: "Room 223", type: "room", floor: 2, coord:[740, 75]},
  { id: "B2_room228", name: "Room 228", type: "room", floor: 2, coord:[975, 85] },
  { id: "B2_room229", name: "Room 229", type: "room", floor: 2, coord:[941, 58] },
  { id: "B2_room230", name: "Room 230", type: "room", floor: 2, coord:[941, 30] },
  { id: "B2_room232", name: "Room 232", type: "room", floor: 2, coord:[1005, 58]},
  { id: "B2_bathroom", name: "Bathroom", type: "room", floor: 2, coord:[867, 100]},

  // Entrances of the Second Floor
  { id: "C3_entrance", name: "main entrance", type: "entrance", floor: 2, coord:[532, 612]},

  // Elevators
  { id: "C3_elevator", name: "the elevator", type: "elevator", floor: 2, coord:[708, 474]},

  // Tablet Location
  { id: "C3_tablet", name: "Wayfinder tablet", type: "tablet", floor: 2, coord:[624, 593]},

  // Stairs / Fire Exit
  { id: "C3_floor2stair1", name: "stairs to 1st Floor", type: "stairs", floor: 2, coord:[480, 525]},
  { id: "C3_floor2stair2", name: "Fire Exit 1", type: "stairs", floor: 2, coord:[681, 503]},
  { id: "B2_floor2stair3", name: "Fire Exit 2", type: "stairs", floor: 2, coord:[761, 80]},

  // Waypoint (nodes that are used as means to get to the the actual destination)
  { id: "B2_bottomhalf1", name: "lower layer 1 computer area", type: "waypoint", floor: 2, coord: [764, 390]},
  { id: "B2_bottomhalf2", name: "lower layer 2 computer area", type: "waypoint", floor: 2, coord:[880, 307]},
  { id: "B2_tophalf1", name: "middle layer 3 computer area", type: "waypoint", floor: 2, coord: [772, 256]},
  { id: "B2_tophalf2", name: "middle layer 4 computer area", type: "waypoint", floor: 2, coord:[761, 192]},
  { id: "B2_tophalf3", name: "middle layer 5 computer area", type: "waypoint", floor: 2, coord: [876, 192]},

  { id: "A1_central", name: "In front of Room 223", type: "waypoint", floor: 2, coord: [708, 100]},

  // ------------------------------------------------------------------------------------------------------------------- 
  
  // All available rooms on the first floor
  { id: "room116", name: "Room 116", type: "room", floor: 1, coord:[220, 275]},
  { id: "room117", name: "Room 117", type: "room", floor: 1, coord:[275, 275]},
  { id: "room118", name: "Room 118", type: "room", floor: 1, coord:[325, 275]},
  { id: "room119", name: "Room 119", type: "room", floor: 1, coord:[430, 275]},

  { id: "room105", name: "Room 105", type: "room", floor: 1, coord:[810, 190]},
  { id: "room108A", name: "Room 108A", type: "room", floor: 1, coord:[845, 365]},
  { id: "top_room109", name: "Room 109", type: "room", floor: 1, coord:[810, 415]},
  { id: "bottom_room109", name: "Room 109", type: "room", floor: 1, coord:[810, 490]},
  { id: "room110", name: "Room 110", type: "room", floor: 1, coord:[810, 540]},

  { id: "floor1_bathroom", name: "bathroom", type: "room", floor: 1, coord:[380, 460]},

  // Elevator nodes
  { id: "A1_floor1_elevator", name: "the elevator", type: "elevator", floor: 1, coord:[465, 275]},
  { id: "A2_floor1_elevator", name: "the elevator", type: "elevator", floor: 1, coord:[465, 225]},

  // Stairs nodes / Fire Exit
  { id: "start_floor1_stairs", name: "stairs", type: "stairs", floor: 1, coord:[550, 112]},
  { id: "floor1_fire_exit_1", name: "Fire Exit 1", type: "stairs", floor: 1, coord:[845, 320]},
  { id: "floor1_fire_exit_2", name: "Fire Exit 2", type: "stairs", floor: 1, coord:[315, 515]},

  // Waypoint (nodes that are used as means to get to the the actual destination)

  { id: "floor1_top", name: "group study area", type: "waypoint", floor: 1, coord:[680, 150]},
  { id: "floor1_bookshelf", name: "top bookshelf corridor", type: "waypoint", floor: 1, coord:[550, 275]},
  { id: "floor1_middle", name: "group study area", type: "waypoint", floor: 1, coord:[640, 275]},
  { id: "floor1_middle_bottom", name: "group study area", type: "waypoint", floor: 1, coord:[640, 365]},
  { id: "floor1_bottom", name: "bottom booksheld corridor", type: "waypoint", floor: 1, coord:[640, 460]},

  { id: "floor1_fire_exit_1_node", name: "next to the fire exit 1", type: "waypoint", floor: 1, coord:[810, 320]},
  { id: "floor1_fire_exit_2_node", name: "next to the fire exit 2", type: "waypoint", floor: 1, coord:[315, 460]},
  { id: "floor1_room108A_node", name: "next to room 108A", type: "waypoint", floor: 1, coord:[810, 365]},
];

// Adjacency list - all connections on the same floor
const graph: { [key: string]: string[] } = {
  // Floor 2 Room Node Connections 

  "C3_entrance": ["C3_tablet", "C3_floor2stair1"],

  "C3_tablet": ["C3_floor2stair2", "C3_floor2stair1"], // Our starting node

  "C3_elevator": ["B2_bottomhalf1"],

  "C3_floor2stair2":["C3_elevator"],

  "B2_bottomhalf1": ["B2_tophalf1", "B2_bottomhalf2"],

  "B2_bottomhalf2": ["B2_tophalf3"],

  "B2_tophalf1": ["B2_tophalf2"],

  "B2_tophalf2": ["A1_central", "A1_room223", "B2_floor2stair3"],

  "B2_tophalf3": ["B2_bathroom"],

  "B2_bathroom": ["B2_room228"],

  "B2_room228" : ["B2_room232","B2_room230","B2_room229"],

  //This is the main point for all the left room
  "A1_central": ["A1_room221","A1_room221D","A1_room222","A1_room222A"],
  
  //This is left as empty because it's a destination
  "A1_room221": [],

  // -------------------------------------------------------------------------------------------------------------------

  // Connecting nodes from floor 2 to floor 1

  "C3_floor2stair1": ["start_floor1_stairs"],

  // Floor 1 Node Connections

  "start_floor1_stairs": ["A2_floor1_elevator", "floor1_bookshelf", "floor1_top", "floor1_middle"],
  "floor1_bookshelf": ["A1_floor1_elevator", "room119", "room118", "room117", "room116"],

  "floor1_top": ["room105", "floor1_fire_exit_1_node"],
  "floor1_middle": ["floor1_middle_bottom", "floor1_room108A_node"],
  "floor1_middle_bottom": ["floor1_bottom", "top_room109", "bottom_room109", "room110"],

  "floor1_fire_exit_1_node": ["floor1_fire_exit_1"],
  "floor1_room108A_node": ["room108A"],

  "floor1_bottom": ["floor1_bathroom"],
  "floor1_bathroom": ["floor1_fire_exit_2_node"],
  "floor1_fire_exit_2_node": ["floor1_fire_exit_2"],
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
    const nodeA = nodes.find(n => n.id === aId);
   const nodeB = nodes.find(n => n.id === bId);

  // If coordinates are missing for any reason, give it a high cost 
  // to tell Dijkstra this is a "difficult" or "broken" path.
    if (!nodeA?.coord || !nodeB?.coord) return 1000;

    const [x1, y1] = nodeA.coord;
    const [x2, y2] = nodeB.coord;

    const dx = x1 - x2;
    const dy = y1 - y2;
  
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
  
  // 1. Handle the starting point
  const startNode = nodes.find(n => n.id === path[0]);
  instructions.push(`Start at ${startNode?.name || 'starting point'}`);

  // 2. Loop through the path to create step-by-step directions
  for (let i = 0; i < path.length - 1; i++) {
    const currentId = path[i];
    const nextId = path[i + 1];
    
    const currentNode = nodes.find(n => n.id === currentId);
    const nextNode = nodes.find(n => n.id === nextId);

    if (!currentNode || !nextNode) continue;

    let instruction = "";

    // 3. Logic based on node types to make it human-readable
    if (currentNode.type === 'elevator') {
      instruction = `Exit the elevator and head toward ${nextNode.name}`;
    } 
    else if (nextNode.type === 'waypoint') {
      instruction = `Walk past the ${nextNode.name}`;
    } 
    else if (nextNode.type === 'room') {
      instruction = `Go to the entrance of ${nextNode.name}`;
    } 
    else {
      // Default fallback for entrances, tablets, etc.
      instruction = `Proceed to ${nextNode.name}`;
    }

    if (instruction) {
      instructions.push(instruction);
    }
  }

  // 4. Handle the arrival point
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
    node.type === 'tablet' ||
    node.type === 'elevator' ||
    node.type === 'waypoint' ||
    node.type === 'stairs'
  );

  // Sort locations by type and name for better organization in dropdown
  const sortedLocations = locations.sort((a, b) => {
    // First sort by type
    if (a.type !== b.type) {
      const typeOrder: { [key: string]: number } = { 
        entrance: 1, 
        room: 2, 
        elevator: 3,
        stairs: 4,
        waypoint: 5
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

  const startNode = nodes.find(n => n.id === "C3_tablet");
  
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
        floor: node?.floor || 2,
        coord: node?.coord,
        x: node?.coord ? node.coord[0] : undefined,
        y: node?.coord ? node.coord[1] : undefined
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
        floor: node?.floor || 2,
        coord: node?.coord
        
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

// Get public URL configuration (e.g. from ngrok) to help frontend generate QR codes
app.get("/api/config", async (req: Request, res: Response) => {
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels");
    if (response.ok) {
      const data: any = await response.json();
      const httpsTunnel = data.tunnels?.find((t: any) => t.public_url.startsWith("https://"));
      if (httpsTunnel) {
        return res.json({ publicUrl: httpsTunnel.public_url });
      }
    }
  } catch (e) {
    console.warn("Could not fetch ngrok tunnels. Fallback will be used.", e);
  }
  return res.json({ publicUrl: "" });
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
      elevators: floor2All.filter(n => n.type === 'elevator').length,
      stairs: floor2All.filter(n => n.type === 'stairs').length,
      entrances: floor2All.filter(n => n.type === 'entrance').length,
      tablets: floor2All.filter(n => n.type === 'tablet').length,
      waypoints: floor2All.filter(n => n.type === 'waypoint').length
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