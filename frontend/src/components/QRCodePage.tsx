import QRCode from "react-qr-code";
export default function generateQRCode({room}: { room: string }){
    const baseURL = "https://www.google.com/"
    const link = baseURL + `?q=${room}`;
    return (
        <QRCode
        value = {link} 
        size={100}

        />
    )
}