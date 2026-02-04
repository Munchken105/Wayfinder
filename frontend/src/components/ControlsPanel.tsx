
import React, { useState, useMemo } from 'react';
import type { Node, NavigationResult } from './WayfinderApp';
import { QRCodeCanvas } from 'qrcode.react';

interface ControlsPanelProps {
    rooms: Node[];
    onSearch: (startId: string, endId: string) => void;
    route: NavigationResult | null;
    onClear: () => void;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({ rooms, onSearch, route, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Kiosk ID is hardcoded for now
    const KIOSK_ID = "C235";

    // Filter suggestions
    const suggestions = useMemo(() => {
        if (!searchTerm) return [];
        return rooms.filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 6);
    }, [searchTerm, rooms]);

    const handleSelectRoom = (room: Node) => {
        setSearchTerm(room.name);
        setShowSuggestions(false);
        onSearch(KIOSK_ID, room.id);
    };

    const handleCategoryClick = (category: string) => {
        // Simple heuristic for categories based on Main's data
        // Main has "room", "entrance", "junction".
        // Proto categories: Restroom, Study, Computer.
        // We can search by name keywords.
        const keywords: Record<string, string[]> = {
            'restroom': ['restroom', 'bathroom', 'toilet'],
            'study': ['study', 'group'],
            'computer': ['computer', 'lab']
        };

        const targetKeywords = keywords[category] || [];
        const matches = rooms.filter(r => targetKeywords.some(k => r.name.toLowerCase().includes(k)));

        if (matches.length > 0) {
            // Just pick the first one for now, or show suggestions
            if (matches.length === 1) {
                handleSelectRoom(matches[0]);
            } else {
                setSearchTerm(category); // Populate search to trigger suggestions?
                // Or just show these specific matches
                // For now, let's just alert strictly or auto-pick nearest (backend handles logic?)
                // Let's just set search term and show suggestions for them
                setSearchTerm(category); // "study"
                setShowSuggestions(true);
            }
        } else {
            alert(`No locations found for ${category}`);
        }
    };

    if (route) {
        // Navigation View
        return (
            <section className="controls-panel" id="controlsPanel">
                <div className="directions-view" style={{ display: 'block' }}>
                    <button className="back-button" onClick={() => { onClear(); setSearchTerm(''); }}>
                        ← Return to Parameters
                    </button>

                    <div className="route-info">
                        <div className="route-text">
                            <h2 className="route-title">3. Navigation Analysis</h2>
                            <p className="route-description" style={{ fontStyle: 'italic', color: '#666' }}>
                                From Kiosk (Main Entrance) to {route.end}
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className="qr-compact">
                            <div style={{ background: 'white', padding: '10px', display: 'inline-block' }}>
                                <QRCodeCanvas
                                    value={`http://${import.meta.env.VITE_LOCAL_IP || window.location.hostname}:5173?dest=${route.path[route.path.length - 1].id}`}
                                    size={100}
                                />
                            </div>
                            <p className="qr-compact-text">Fig 1a. Mobile Data Transfer</p>
                        </div>
                    </div>

                    <div className="directions-list">
                        {route.instructions.map((instr, idx) => (
                            <div className="direction-step" key={idx}>
                                <div className="step-number">{idx + 1}</div>
                                <div className="step-content">
                                    <div className="step-instruction">{instr}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Selection View
    return (
        <section className="controls-panel" id="controlsPanel">
            <div className="selection-view">
                <h3 className="section-title">1. Search Parameters</h3>
                <div className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter destination keyword..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        <button className="search-button">
                            <span className="search-icon">🔍</span>
                        </button>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="autocomplete-suggestions">
                                {suggestions.map(s => (
                                    <div className="suggestion-item" key={s.id} onClick={() => handleSelectRoom(s)}>
                                        <div className="suggestion-content">
                                            <div className="suggestion-name">{s.name}</div>
                                            <div className="suggestion-meta"><span className="suggestion-type">Floor {s.floor}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="section-title">2. Categorical filters</h3>
                <div className="categories-section">
                    <div className="category-buttons">
                        <button className="category-btn" onClick={() => handleCategoryClick('restroom')}>
                            <span className="category-icon">🚻</span>
                            Sanitatary Facilities (Restrooms)
                        </button>
                        <button className="category-btn" onClick={() => handleCategoryClick('study')}>
                            <span className="category-icon">📚</span>
                            Individual Study Areas
                        </button>
                        <button className="category-btn" onClick={() => handleCategoryClick('computer')}>
                            <span className="category-icon">💻</span>
                            Computation Labs
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ControlsPanel;
