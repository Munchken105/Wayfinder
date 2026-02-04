
import React, { useState, useEffect } from 'react';
import ControlsPanel from './ControlsPanel';
import MapPanel from './MapPanel';
import '../index.css'; // Ensure Proto styles are loaded

export interface Node {
    id: string;
    name: string;
    type: string;
    floor: number;
}

export interface NavigationResult {
    start: string;
    end: string;
    totalSteps: number;
    floor: string;
    path: Array<{ id: string; name: string; type: string; floor: number }>;
    instructions: string[];
}

const WayfinderApp: React.FC = () => {
    const [rooms, setRooms] = useState<Node[]>([]);
    const [currentRoute, setCurrentRoute] = useState<NavigationResult | null>(null);
    const [activeFloor, setActiveFloor] = useState(2);
    const [loading, setLoading] = useState(true);

    // Determine API Base URL dynamically
    const getApiBase = () => {
        const hostname = window.location.hostname;
        // Assume backend is on same host, port 5000
        return `http://${hostname}:5000`;
    };

    useEffect(() => {
        // Fetch rooms on load
        fetch(`${getApiBase()}/api/rooms`)
            .then(res => res.json())
            .then(data => {
                setRooms(data.rooms);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch rooms", err);
                setLoading(false);
            });
    }, []);

    // Handle URL "Handoff" (e.g., ?dest=221)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const destId = params.get('dest');
        if (destId) {
            // Wait slightly for rooms to load or just fire blindly (backend handles validation)
            // Kiosk ID is C235
            handleSearch("C235", destId);
        }
    }, [rooms]); // Run when rooms change (loaded) to ensure we have context if needed, or just once. 
    // Ideally we want to ensure handleSearch works. It fetches from backend so it doesn't strictly need `rooms` loaded, 
    // but running it after rooms load ensures validation if we add it later. 
    // Actually, running it once on mount is enough if handleSearch is independent. 
    // Let's add it as a separate effect dependent on nothing, or maybe just `rooms` length > 0 to be safe.

    useEffect(() => {
        if (rooms.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const destId = params.get('dest');
            if (destId) {
                handleSearch("C235", destId);
                // Clear param to avoid re-triggering? optional.
            }
        }
    }, [rooms]);

    const handleSearch = async (startId: string, endId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiBase()}/api/navigation/from/${startId}/to/${endId}`);
            const data = await res.json();
            if (res.ok) {
                setCurrentRoute(data);
            } else {
                alert(data.error || "Navigation failed");
            }
        } catch (e) {
            console.error(e);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setCurrentRoute(null);
    };

    return (
        <div className="container">
            <header className="panel-header">
                <h1 className="app-title">Lockwood Library Wayfinder</h1>
                <div className="current-location">
                    <span className="location-icon">📍</span>
                    Current Location: <strong>Kiosk (Floor 2)</strong>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', fontStyle: 'normal' }}>
                    <em>University at Buffalo Libraries • Spatial Navigation System • v1.0</em>
                </div>
            </header>

            <main className="app-main">
                <ControlsPanel
                    rooms={rooms}
                    onSearch={handleSearch}
                    route={currentRoute}
                    onClear={handleClear}
                />
                <MapPanel
                    floor={activeFloor}
                    route={currentRoute}
                    onFloorChange={setActiveFloor}
                />
            </main>

            {loading && (
                <div className="loading-screen" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="loading-spinner" style={{
                            border: '2px solid #f3f3f3', borderTop: '2px solid #005bbb',
                            borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite'
                        }}></div>
                        <p>Retrieving Spatial Data...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WayfinderApp;
