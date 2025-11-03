import { useEffect, useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface EmailValidationProps {
    email: string;
}

export const EmailValidation = ({ email }: EmailValidationProps) => {
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!email) {
            setStatus('idle');
            setMessage('');
            return;
        }

        // Simple email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('invalid');
            setMessage('Please enter a valid email address');
            return;
        }

        const timer = setTimeout(async () => {
            setStatus('checking');
            try {
                const response = await fetch('http://localhost:5000/api/auth/check-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response.ok) {
                    setStatus('available');
                    setMessage('Email is available');
                } else {
                    setStatus('taken');
                    setMessage('This email is already registered');
                }
            } catch (error) {
                console.error('Error checking email:', error);
                setStatus('idle');
                setMessage('Could not verify email');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [email]);

    if (status === 'idle') {
        return null;
    }

    const statusColors = {
        idle: 'text-muted-foreground',
        checking: 'text-blue-600',
        available: 'text-green-600',
        taken: 'text-red-600',
        invalid: 'text-orange-600'
    };

    const statusIcons = {
        idle: null,
        checking: <Loader2 className="w-4 h-4 animate-spin" />,
        available: <Check className="w-4 h-4" />,
        taken: <AlertCircle className="w-4 h-4" />,
        invalid: <AlertCircle className="w-4 h-4" />
    };

    return (
        <div className={`flex items-center gap-2 text-sm mt-1 ${statusColors[status]}`}>
            {statusIcons[status]}
            <span>{message}</span>
        </div>
    );
};
