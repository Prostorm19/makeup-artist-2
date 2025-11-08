import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Camera, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

interface PhotoUploadProps {
    currentImage?: string;
    userName?: string;
    userEmail?: string;
    onSuccess?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const PhotoUpload = ({ currentImage, userName, userEmail, onSuccess }: PhotoUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [displayImage, setDisplayImage] = useState<string | null>(currentImage || null);
    const { uploadProfileImage, deleteProfileImage, user, error: authError } = useAuth();

    // Update display image when user profileImage changes
    useEffect(() => {
        console.log('PhotoUpload effect triggered - user profileImage:', user?.profileImage, 'currentImage:', currentImage);
        setDisplayImage(user?.profileImage || currentImage || null);
    }, [user?.profileImage, currentImage]);

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return email ? email[0].toUpperCase() : '?';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!fileInputRef.current?.files?.[0]) {
            setError('Please select an image first');
            return;
        }

        const file = fileInputRef.current.files[0];
        setIsLoading(true);
        setError(null);

        try {
            const success = await uploadProfileImage(file);
            if (success) {
                // displayImage will update automatically via the useEffect watching user?.profileImage
                setPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                onSuccess?.();
            } else {
                setError(authError || 'Failed to upload image');
            }
        } catch (err) {
            setError('An error occurred during upload');
            console.error('Upload error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
    };

    const handleDeleteImage = async () => {
        if (!displayImage) return;

        setIsLoading(true);
        setError(null);

        try {
            const success = await deleteProfileImage();
            if (success) {
                setDisplayImage(null);
                onSuccess?.();
            } else {
                setError(authError || 'Failed to delete image');
            }
        } catch (err) {
            setError('An error occurred while deleting the image');
            console.error('Delete error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage
                        src={preview || displayImage || user?.profileImage}
                        alt={userName || user?.name}
                        onLoad={() => console.log('Image loaded:', preview || displayImage || user?.profileImage)}
                    />
                    <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                        {getUserInitials(userName || user?.name, userEmail || user?.email)}
                    </AvatarFallback>
                </Avatar>
                <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-accent/10 hover:bg-accent/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Camera className="w-4 h-4" />
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isLoading}
                />
            </div>

            {error && (
                <Alert variant="destructive" className="max-w-xs">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {preview && (
                <div className="flex gap-2">
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Photo'
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {displayImage && !preview && (
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteImage}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Photo
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};
