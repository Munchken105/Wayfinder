import QRCode from "react-qr-code";
export default function generateQRCode({ room }: { room: string }) {
    const baseURL = window.location.origin;
    const link = baseURL + `/mobile?q=${encodeURIComponent(room)}`;
    return (
        <QRCode
            value={link}
            size={150}

        />
    )
}