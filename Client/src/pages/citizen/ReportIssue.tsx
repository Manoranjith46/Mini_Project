import { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ArrowLeft, MapPin, Upload, Send, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapComponent from "../components/MapBox";
import { toast } from "sonner";


const ReportIssue = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/citizen");
    }
  };
  const [formData, setFormData] = useState({
    title: "",
    issueDescription: "",
    issueLocation: "",
    issueType: "Road Infrastructure",
    location: {
      address: "",
      latitude: null as number | null,
      longitude: null as number | null,
    },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      setFormData((prev) => ({
        ...prev,
        location: {
          address,
          latitude: lat,
          longitude: lng,
        },
        issueLocation: address, // also update address string if you use it
      }));
    },
    []
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  // Geocode location from search query
  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a city or location name");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setSearchLocation({ lat, lng });
        toast.success(`Found: ${result.display_name}`);
      } else {
        toast.error("Location not found. Please try a different search.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Failed to search location");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLocationSearch();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.issueDescription ||
      !formData.location.address
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.issueDescription);
      data.append("issueType", formData.issueType);
      data.append("location", JSON.stringify(formData.location)); // ✅ Location as JSON

      if (selectedFile) {
        data.append("files", selectedFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/citizen/create-issue`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json();
      if (response.ok) {
        toast.success("Issue reported successfully!");
        handleBack();
      } else {
        toast.error(result.message || "Failed to report issue");
      }
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    { value: "Road Infrastructure", label: "Road Infrastructure" },
    { value: "Waste Management", label: "Waste Management" },
    { value: "Environmental Issues", label: "Environmental Issues" },
    {
      value: "Utilities & Infrastructure",
      label: "Utilities & Infrastructure",
    },
    { value: "Public Safety", label: "Public Safety" },
    { value: "Other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-[#f3f6f8]">
      {/* Header */}
      <header className="w-full border-b bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center space-x-2 text-slate-500"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-600" />
                  <span>Back to Dashboard</span>
                </Button>
            </div>
            <div>
              <h1 className="text-xl font-bold text-cyan-600">
                Report New Issue
              </h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <Card className="h-fit shadow-lg bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2  text-slate-600">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Select Issue Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Field */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search city or location (e.g., Delhi, Mumbai)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 shadow-sm"
                />
                <Button
                  onClick={handleLocationSearch}
                  className="px-4 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-96 rounded-lg overflow-hidden border">
                <MapComponent
                  onLocationSelect={handleLocationSelect}
                  searchLocation={searchLocation}
                />
              </div>
              {formData.location.latitude && formData.location.longitude && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Location:</p>
                  <p className="text-xs text-muted-foreground">
                    Lat: {formData.location.latitude.toFixed(6)}, Lng:{" "}
                    {formData.location.longitude.toFixed(6)}
                  </p>
                  {formData.location.address && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.location.address}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card className="shadow-lg bg-white/80  text-slate-600">
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter your issue title"
                      required
                      className="shadow-sm"
                    />
                  </div>
                </div>

                {/* Issue Information */}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Issue Information</h3>

                  <div className="space-y-2">
                    <Label>Issue Type *</Label>
                    <RadioGroup
                      value={formData.issueType}
                      onValueChange={(value) =>
                        handleInputChange("issueType", value)
                      }
                      className="grid grid-cols-2 gap-4"
                    >
                      {issueTypes.map((type) => (
                        <div
                          key={type.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label htmlFor={type.value} className="text-sm">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueLocation">
                      Issue Location Address
                    </Label>
                    <Input
                      id="issueLocation"
                      type="text"
                      value={formData.issueLocation}
                      onChange={(e) =>
                        handleInputChange("issueLocation", e.target.value)
                      }
                      placeholder="Enter or select location on map"
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueDescription">
                      Issue Description *
                    </Label>
                    <Textarea
                      id="issueDescription"
                      value={formData.issueDescription}
                      onChange={(e) =>
                        handleInputChange("issueDescription", e.target.value)
                      }
                      placeholder="Describe the issue in detail..."
                      className="min-h-24 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* File Upload */}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Upload Media</h3>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Image/Video</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="file"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} (
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}

                <Button
                  type="submit"
                  className="w-full civic-gradient border-0 text-white hover:opacity-70"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" /> Submit Issue
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;
