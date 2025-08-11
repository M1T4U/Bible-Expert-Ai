import React from 'react';
import { Info, CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'info' | 'success' | 'error';
}

const ICONS = {
    info: <Info className="w-6 h-6" />,
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
};

const COLORS = {
    info: 'bg-blue-500/80',
    success: 'bg-gospel-cyan-600/80',
    error: 'bg-red-600/80',
};

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1000] animate-fade-in-down">
            <div className={`flex items-center gap-4 text-white font-semibold px-6 py-3 rounded-lg shadow-lg backdrop-blur-md ${COLORS[type]}`}>
                {ICONS[type]}
                <p>{message}</p>
            </div>
        </div>
    );
};

export default Notification;
