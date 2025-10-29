import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Request, Response } from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Types
interface Node {
  id: string;
  name: string;
  type: 'room' | 'hallway' | 'junction' | 'entrance';
  floor: number;
  x?: number;
  y?: number;
}

interface PathResult {
  path: string[];
  steps: number;
  instructions: string[];
}

// Single floor building graph - all rooms on the same floor
const nodes: Node[] = [
  // Rooms
  { id: "room_202", name: "Room 202", type: "room", floor: 2 },
  { id: "classroom_b20", name: "Classroom B20", type: "room", floor: 2 },
  { id: "room_201", name: "Room 201", type: "room", floor: 2 },
  { id: "room_203", name: "Room 203", type: "room", floor: 2 },
  { id: "room_204", name: "Room 204", type: "room", floor: 2 },
  { id: "lab_a1", name: "Lab A1", type: "room", floor: 2 },
  { id: "office_b", name: "Office B", type: "room", floor: 2 },
  
  // Hallways and junctions
  { id: "hall_main", name: "Main Hallway", type: "hallway", floor: 2 },
  { id: "hall_north", name: "North Hallway", type: "hallway", floor: 2 },
  { id: "hall_south", name: "South Hallway", type: "hallway", floor: 2 },
  { id: "junction_center", name: "Central Junction", type: "junction", floor: 2 },
  { id: "junction_north", name: "North Junction", type: "junction", floor: 2 },
  { id: "entrance_main", name: "Main Entrance", type: "entrance", floor: 2 },
];

// Adjacency list - all connections on the same floor
const graph: { [key: string]: string[] } = {
  // Room connections to hallways
  "room_202": ["hall_north"],
  "room_201": ["hall_north"],
  "room_203": ["hall_north"],
  "classroom_b20": ["hall_south"],
  "room_204": ["hall_south"],
  "lab_a1": ["hall_south"],
  "office_b": ["hall_main"],
  
  // Hallway connections
  "hall_north": ["room_202", "room_201", "room_203", "junction_north"],
  "hall_south": ["classroom_b20", "room_204", "lab_a1", "junction_center"],
  "hall_main": ["office_b", "entrance_main", "junction_center"],
  
  // Junction connections
  "junction_north": ["hall_north", "junction_center"],
  "junction_center": ["hall_south", "hall_main", "junction_north"],
  
  // Entrance
  "entrance_main": ["hall_main"],
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
    } else if (currentNode.type === 'hallway' && nextNode.type === 'junction') {
      instruction = `Continue to ${nextNode.name}`;
    } else if (currentNode.type === 'junction' && nextNode.type === 'hallway') {
      instruction = `Take the hallway toward ${nextNode.name}`;
    } else if (currentNode.type === 'junction' && nextNode.type === 'junction') {
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

// Get all rooms
app.get("/api/rooms", (req: Request, res: Response) => {
  const rooms = nodes.filter(node => node.type === 'room');
  res.json({ rooms });
});

// Find shortest path using BFS
app.get("/api/navigation/from/:start/to/:end", (req: Request, res: Response) => {
  const start = req.params.start;
  const end = req.params.end;

  // Check if parameters are provided
  if (!start || !end) {
    return res.status(400).json({ 
      error: "Both start and end parameters are required",
      example: "/api/navigation/from/room_202/to/classroom_b20"
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
  const pathResult = findShortestPathBFS("room_202", "classroom_b20");
  
  if (!pathResult) {
    return res.status(404).json({ error: "No path found from Room 202 to Classroom B20" });
  }

  const startNode = nodes.find(n => n.id === "room_202");
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

app.listen(PORT, () => {
  const floor2Rooms = nodes.filter(n => n.type === 'room' && n.floor === 2);
  
  console.log(`Single Floor Navigation server running on port ${PORT}`);
  console.log(`Algorithm: BFS (Breadth-First Search)`);
  console.log(`Navigation Type: Single Floor Only (Floor 2)`);
  console.log(`Available rooms on Floor 2: ${floor2Rooms.map(n => n.name).join(', ')}`);
  console.log(`Sample route: GET /api/navigation/room202-to-b20`);
});