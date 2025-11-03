import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
    onChange?: (strength: PasswordStrength) => void;
}

export interface PasswordStrength {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    requirements: Requirement[];
}

interface Requirement {
    label: string;
    met: boolean;
}

export const PasswordStrengthMeter = ({ password, onChange }: PasswordStrengthProps) => {
    const [strength, setStrength] = useState<PasswordStrength>({
        isValid: false,
        strength: 'weak',
        score: 0,
        requirements: []
    });

    useEffect(() => {
        const requirements: Requirement[] = [
            {
                label: 'At least 8 characters',
                met: password.length >= 8
            },
            {
                label: 'Contains lowercase letter (a-z)',
                met: /[a-z]/.test(password)
            },
            {
                label: 'Contains uppercase letter (A-Z)',
                met: /[A-Z]/.test(password)
            },
            {
                label: 'Contains number (0-9)',
                met: /\d/.test(password)
            },
            {
                label: 'Contains special character (@$!%*?&)',
                met: /[@$!%*?&]/.test(password)
            }
        ];

        const metRequirements = requirements.filter(req => req.met).length;
        const isValid = metRequirements === requirements.length;

        const strengthLevel = metRequirements <= 1 ? 'weak' :
            metRequirements <= 3 ? 'medium' :
                'strong';

        const newStrength: PasswordStrength = {
            isValid,
            strength: strengthLevel,
            score: metRequirements,
            requirements
        };

        setStrength(newStrength);
        onChange?.(newStrength);
    }, [password, onChange]);

    if (!password) {
        return null;
    }

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500'
    };

    const strengthText = {
        weak: 'Weak',
        medium: 'Medium',
        strong: 'Strong'
    };

    return (
        <div className="space-y-3 mt-3 p-3 bg-muted rounded-lg">
            {/* Strength Meter */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Password Strength</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${strength.strength === 'weak' ? 'bg-red-100 text-red-700' :
                            strength.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                        }`}>
                        {strengthText[strength.strength]} ({strength.score}/5)
                    </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strengthColors[strength.strength]}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements Checklist */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
                <div className="space-y-1">
                    {strength.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                            {req.met ? (
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                                <X className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                                {req.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Message */}
            <div className="text-xs">
                {strength.isValid ? (
                    <p className="text-green-600 font-medium">✓ Password is strong and ready to use!</p>
                ) : (
                    <p className="text-red-600 font-medium">✗ Please meet all requirements above</p>
                )}
            </div>
        </div>
    );
};