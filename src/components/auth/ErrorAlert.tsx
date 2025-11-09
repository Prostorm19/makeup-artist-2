import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorAlertProps {
    title?: string;
    error: string | null;
    details?: string[] | null;
    onDismiss?: () => void;
}

export const ErrorAlert = ({
    title = "Error",
    error,
    details,
    onDismiss
}: ErrorAlertProps) => {
    if (!error) {
        return null;
    }

    return (
        <Alert variant="destructive" className="border-red-500/50 bg-red-50 dark:bg-red-950/30 overflow-hidden">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <AlertTitle className="text-red-900 dark:text-red-300">{title}</AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    <p>{error}</p>
                    {details && details.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {details.map((detail, idx) => (
                                <li key={idx} className="ml-2">
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="mt-3 text-sm font-medium underline hover:no-underline"
                    >
                        Dismiss
                    </button>
                )}
            </AlertDescription>
        </Alert>
    );
};
