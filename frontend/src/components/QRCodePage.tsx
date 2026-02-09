import QRCode from "react-qr-code";

export default function generateQRCode({ room }: { room: string }) {
    // Use the injected Local IP from .env.local, fallback to hostname
    const host = import.meta.env.VITE_LOCAL_IP || window.location.hostname;
    // Construct the full URL with query param
    const link = `http://${host}:5173/?dest=${encodeURIComponent(room)}`;

    return (
        <div style={{ background: 'white', padding: '10px', display: 'inline-block' }}>
            <QRCode
                value={link}
                size={100}
            />
            <p style={{ fontSize: '10px', marginTop: '5px', textAlign: 'center' }}>Scan for Mobile</p>
        </div>
    )
}