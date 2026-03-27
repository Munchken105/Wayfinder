import QRCode from "react-qr-code";
import { useState, useEffect } from "react";

export default function generateQRCode({ room, useElevator }: { room: string; useElevator: boolean }) {
    const [baseURL, setBaseURL] = useState(window.location.origin);

    useEffect(() => {
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            fetch("/api/config", { headers: { "ngrok-skip-browser-warning": "true" } })
                .then((res) => res.json())
                .then((data) => {
                    if (data.publicUrl) {
                        setBaseURL(data.publicUrl);
                    }
                })
                .catch((err) => console.error("Could not fetch ngrok URL", err));
        }
    }, []);

    const mode = useElevator ? "elevator" : "stairs";
    const link = baseURL + `/floors?q=${encodeURIComponent(room)}&mode=${mode}`;

    return (
        <div className="qr-code-block">
            <p className="qr-callout">
                <strong>Continue on your phone</strong>
                Scan to open this route in Wayfinder—take turn-by-turn directions with you while you walk.
            </p>
            <QRCode value={link} size={150} />
        </div>
    );
}