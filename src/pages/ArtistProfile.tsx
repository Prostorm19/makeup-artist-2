import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
    Palette,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Star,
    Edit3,
    Save,
    X,
    ArrowLeft,
    Clock,
    DollarSign,
    Award,
    Users,
    TrendingUp,
    Image as ImageIcon,
    Plus,
    AlertCircle
} from "lucide-react";
import { useEffect } from "react";
import portfolio1 from "@/assets/portfolio-1.jpg";
import portfolio2 from "@/assets/portfolio-2.jpg";
import portfolio3 from "@/assets/portfolio-3.jpg";
import { useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ArtistProfile = () => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
    const [portfolioError, setPortfolioError] = useState<string | null>(null);
    const portfolioInputRef = useRef<HTMLInputElement>(null);
    const [portfolioImages, setPortfolioImages] = useState([
        { id: 1, title: "Bridal Look", image: portfolio1, category: "Bridal" },
        { id: 2, title: "Evening Glam", image: portfolio2, category: "Evening" },
        { id: 3, title: "Natural Beauty", image: portfolio3, category: "Natural" },
        { id: 4, title: "Editorial", image: portfolio1, category: "Fashion" }
    ]);
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        location: "",
        bio: "",
        specialties: "",
        experience: "",
        hourlyRate: "",
        instagram: "",
        website: ""
    });

    // Sync form data when user data changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            name: user?.name || "",
            email: user?.email || ""
        }));
    }, [user?.name, user?.email]);

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            phone: "",
            location: "",
            bio: "",
            specialties: "",
            experience: "",
            hourlyRate: "",
            instagram: "",
            website: ""
        });
        setIsEditing(false);
    };

    const handlePortfolioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setPortfolioError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (10MB limit for portfolio)
        if (file.size > 10 * 1024 * 1024) {
            setPortfolioError('Image size must be less than 10MB');
            return;
        }

        handlePortfolioUpload(file);
    };

    const handlePortfolioUpload = async (file: File) => {
        setIsUploadingPortfolio(true);
        setPortfolioError(null);

        try {
            const formData = new FormData();
            formData.append('portfolioImage', file);
            formData.append('title', `Makeup Look ${portfolioImages.length + 1}`);
            formData.append('category', 'Portfolio');

            const token = localStorage.getItem("makeup-artist-token");
            const response = await fetch(`${API_BASE_URL}/auth/upload-portfolio-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setPortfolioError(data.error || 'Failed to upload portfolio image');
                return;
            }

            // Add new image to portfolio
            const newImage = {
                id: portfolioImages.length + 1,
                title: data.title,
                image: data.imageUrl,
                category: data.category
            };

            setPortfolioImages([...portfolioImages, newImage]);

            // Reset input
            if (portfolioInputRef.current) {
                portfolioInputRef.current.value = '';
            }
        } catch (err) {
            setPortfolioError('An error occurred during upload');
            console.error('Portfolio upload error:', err);
        } finally {
            setIsUploadingPortfolio(false);
        }
    };

    const handleDeletePortfolioImage = (id: number) => {
        setPortfolioImages(portfolioImages.filter(img => img.id !== id));
    };

    const getUserInitials = (name?: string, email?: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return email ? email[0].toUpperCase() : 'A';
    };

    // Mock data for bookings and portfolio
    const upcomingBookings = [
        {
            id: 1,
            client: "Sarah Johnson",
            service: "Bridal Makeup",
            date: "2024-11-25",
            time: "9:00 AM",
            price: "$250",
            status: "confirmed"
        },
        {
            id: 2,
            client: "Emily Davis",
            service: "Photoshoot Glam",
            date: "2024-11-28",
            time: "2:00 PM",
            price: "$180",
            status: "pending"
        }
    ];

    const stats = {
        totalBookings: 127,
        rating: 4.9,
        experience: "5+ years",
        clients: 98
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-b from-background to-background/50 pt-20">
                <div className="container mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link to="/dashboard/artist">
                                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                                <p className="text-muted-foreground">Manage your professional profile</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                            <Palette className="w-3 h-3 mr-1" />
                            Artist
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <Card className="glass border-primary/20">
                                <CardHeader className="text-center">
                                    <div className="relative mx-auto mb-4">
                                        <PhotoUpload
                                            key={user?.id}
                                            currentImage={user?.profileImage}
                                            userName={user?.name}
                                            userEmail={user?.email}
                                        />
                                    </div>
                                    <CardTitle className="text-foreground">{user?.name}</CardTitle>
                                    <CardDescription className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {user?.email}
                                    </CardDescription>
                                    <div className="flex items-center justify-center mt-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <span className="text-sm font-medium ml-1">{stats.rating}</span>
                                        <span className="text-sm text-muted-foreground ml-1">({stats.totalBookings} reviews)</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 mr-2" />
                                        <span>{formData.phone || "Add phone number"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span>{formData.location || "Add location"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        <span>{formData.hourlyRate ? `$${formData.hourlyRate}/hour` : "Set hourly rate"}</span>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-primary">{stats.totalBookings}</p>
                                            <p className="text-sm text-muted-foreground">Bookings</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-accent">{stats.clients}</p>
                                            <p className="text-sm text-muted-foreground">Clients</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card className="glass border-primary/20 mt-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">This Month</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                                            <span className="text-sm">Bookings</span>
                                        </div>
                                        <span className="font-semibold">12</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                            <span className="text-sm">Earnings</span>
                                        </div>
                                        <span className="font-semibold">$2,340</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                                            <span className="text-sm">Growth</span>
                                        </div>
                                        <span className="font-semibold text-green-500">+15%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Tabs defaultValue="info" className="space-y-6">
                                <TabsList className="grid grid-cols-3 w-full glass">
                                    <TabsTrigger value="info">Professional Info</TabsTrigger>
                                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                                </TabsList>

                                {/* Professional Information Tab */}
                                <TabsContent value="info">
                                    <Card className="glass border-primary/20">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Professional Information</CardTitle>
                                                <CardDescription>Update your professional details and specialties</CardDescription>
                                            </div>
                                            {!isEditing ? (
                                                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                                    <Edit3 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <Button onClick={handleSave} size="sm" className="btn-luxury">
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save
                                                    </Button>
                                                    <Button onClick={handleCancel} variant="outline" size="sm">
                                                        <X className="w-4 h-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="location">Location</Label>
                                                    <Input
                                                        id="location"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="City, State"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                                                    <Input
                                                        id="hourlyRate"
                                                        type="number"
                                                        value={formData.hourlyRate}
                                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="experience">Experience</Label>
                                                    <Input
                                                        id="experience"
                                                        value={formData.experience}
                                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="5+ years"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="instagram">Instagram Handle</Label>
                                                    <Input
                                                        id="instagram"
                                                        value={formData.instagram}
                                                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="@yourusername"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="website">Website</Label>
                                                    <Input
                                                        id="website"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        disabled={!isEditing}
                                                        className="glass"
                                                        placeholder="www.yourwebsite.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Professional Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="glass min-h-[100px]"
                                                    placeholder="Tell clients about your experience and approach..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="specialties">Specialties & Services</Label>
                                                <Textarea
                                                    id="specialties"
                                                    value={formData.specialties}
                                                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                                    disabled={!isEditing}
                                                    className="glass min-h-[80px]"
                                                    placeholder="Bridal makeup, photoshoot glam, special effects..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Bookings Tab */}
                                <TabsContent value="bookings">
                                    <Card className="glass border-primary/20">
                                        <CardHeader>
                                            <CardTitle>Upcoming Bookings</CardTitle>
                                            <CardDescription>Manage your scheduled appointments</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {upcomingBookings.map((booking) => (
                                                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                        <div className="flex items-center space-x-4">
                                                            <Avatar className="w-12 h-12">
                                                                <AvatarFallback>{booking.client[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h4 className="font-semibold text-foreground">{booking.service}</h4>
                                                                <p className="text-sm text-muted-foreground">with {booking.client}</p>
                                                                <div className="flex items-center space-x-4 mt-1">
                                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                        {booking.date}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {booking.time}
                                                                    </div>
                                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                                        {booking.price}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge
                                                                variant={booking.status === "confirmed" ? "default" : "secondary"}
                                                                className={booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                                                            >
                                                                {booking.status}
                                                            </Badge>
                                                            <Button variant="outline" size="sm">
                                                                Manage
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Portfolio Tab */}
                                <TabsContent value="portfolio">
                                    <Card className="glass border-primary/20">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Portfolio</CardTitle>
                                                <CardDescription>Showcase your best work</CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => portfolioInputRef.current?.click()}
                                                disabled={isUploadingPortfolio}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {isUploadingPortfolio ? 'Uploading...' : 'Add Photo'}
                                            </Button>
                                            <input
                                                ref={portfolioInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePortfolioFileSelect}
                                                disabled={isUploadingPortfolio}
                                            />
                                        </CardHeader>
                                        <CardContent>
                                            {portfolioError && (
                                                <Alert variant="destructive" className="mb-4">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>{portfolioError}</AlertDescription>
                                                </Alert>
                                            )}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {portfolioImages.map((item) => (
                                                    <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden bg-primary/5 border border-primary/10">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                            <div className="text-center text-white">
                                                                <h4 className="font-semibold">{item.title}</h4>
                                                                <p className="text-sm">{item.category}</p>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="mt-2"
                                                                    onClick={() => handleDeletePortfolioImage(item.id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div
                                                    className="aspect-square rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                                                    onClick={() => portfolioInputRef.current?.click()}
                                                >
                                                    <div className="text-center text-muted-foreground">
                                                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                                        <p className="text-sm">Add Photo</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ArtistProfile;