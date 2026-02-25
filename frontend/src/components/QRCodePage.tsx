import QRCode from "react-qr-code";
import { useState, useEffect } from "react";

export default function generateQRCode({ room }: { room: string }) {
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

    const link = baseURL + `/mobile?q=${encodeURIComponent(room)}`;

    return (
        <QRCode
            value={link}
            size={150}
        />
    );
}