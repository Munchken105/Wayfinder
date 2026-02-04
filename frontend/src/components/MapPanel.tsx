
import React, { useEffect, useRef, useState } from 'react';
import Panzoom from '@panzoom/panzoom';
import libraryImg from "../assets/Floor2layout.jpg";
import type { NavigationResult } from './WayfinderApp';
import { nodeCoordinates } from '../data/nodeCoordinates';

interface MapPanelProps {
    floor: number;
    route: NavigationResult | null;
    onFloorChange: (floor: number) => void;
}

const MapPanel: React.FC<MapPanelProps> = ({ floor, route, onFloorChange }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapWrapperRef = useRef<HTMLDivElement>(null);
    const [panzoomInstance, setPanzoomInstance] = useState<any>(null);

    useEffect(() => {
        if (mapWrapperRef.current) {
            const pz = Panzoom(mapWrapperRef.current, {
                maxScale: 5,
                minScale: 0.5,
                contain: 'outside',
            });
            setPanzoomInstance(pz);

            // Enable mouse wheel
            mapContainerRef.current?.addEventListener('wheel', pz.zoomWithWheel);

            return () => {
                mapContainerRef.current?.removeEventListener('wheel', pz.zoomWithWheel);
                pz.destroy();
            }
        }
    }, [floor]);

    // Zoom controls
    const handleZoomIn = () => panzoomInstance?.zoomIn();
    const handleZoomOut = () => panzoomInstance?.zoomOut();

    // Generate Path SVG Elements
    const renderPath = () => {
        if (!route || !route.path || route.path.length < 2) return null;

        // Collect coordinates
        const points: { x: number, y: number }[] = [];
        route.path.forEach(node => {
            const coords = nodeCoordinates[node.id];
            // If we don't have coordinates for a node (e.g. unknown hallway), we skip it?
            // Or we try to use the previous/next known one?
            // For now, only include known points. 
            // Better: If we miss a point, the line snaps.
            // Ideally we need coords for everything.
            if (coords) {
                points.push(coords);
            } else {
                // Heuristic: if it's a study area, maybe map to a default?
                // Log missing coords for debugging
                console.warn("Missing coords for", node.id);
            }
        });

        if (points.length < 2) return null;

        // Generate Path String "M x y L x y ..."
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return (
            <svg
                className="map-overlay"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d={d}
                    fill="none"
                    stroke="#ffc72c"
                    strokeWidth="8"
                    strokeDasharray="15,10"
                    strokeLinecap="round"
                    style={{ animation: 'dash 1s linear infinite' }}
                />
                {/* Start Marker */}
                <circle cx={points[0].x} cy={points[0].y} r="10" fill="#005bbb" stroke="white" strokeWidth="2" />
                {/* End Marker */}
                <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="10" fill="#ffc72c" stroke="black" strokeWidth="2" />
            </svg>
        );
    };

    return (
        <section className="map-panel" data-active-floor={floor}>
            {/* Controls */}
            <div className="map-controls">
                <div className="floor-selector">
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', marginRight: '0.5rem', color: '#666' }}>LAYERS:</span>
                    <button className={`floor-btn ${floor === 1 ? 'active' : ''}`} onClick={() => onFloorChange(1)}>Level 1</button>
                    <button className={`floor-btn ${floor === 2 ? 'active' : ''}`} onClick={() => onFloorChange(2)}>Level 2</button>
                </div>

                <div className="zoom-controls">
                    <button className="zoom-btn" onClick={handleZoomIn}>+</button>
                    <button className="zoom-btn" onClick={handleZoomOut}>−</button>
                </div>
            </div>

            {/* Map */}
            <div className="map-container" ref={mapContainerRef} style={{ overflow: 'hidden', position: 'relative' }}>
                <div className="map-wrapper" ref={mapWrapperRef} style={{ position: 'relative' }}>
                    <img
                        src={libraryImg}
                        alt="Floor Map"
                        style={{ display: 'block', maxWidth: 'none' }} // Ensure image flows freely for panzoom
                    />
                    {renderPath()}
                </div>
            </div>
        </section>
    );
};

export default MapPanel;
