import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminSidebar from "@/components/AdminSidebar";
import { Upload, X, Image, FileImage, Trash2, Eye, Share2, Filter } from "lucide-react";
import { useEvents } from "@/contexts/EventContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Mock gallery data
const mockGalleryImages = [
  {
    id: 1,
    eventId: 1,
    title: "Opening Ceremony",
    src: "🖼️",
    date: "2024-09-20",
    featured: true
  },
  {
    id: 2,
    eventId: 1,
    title: "Workshop Session",
    src: "🖼️",
    date: "2024-09-20",
    featured: false
  },
  {
    id: 3,
    eventId: 1,
    title: "Panel Discussion",
    src: "🖼️",
    date: "2024-09-21",
    featured: true
  },
  {
    id: 4,
    eventId: 2,
    title: "Hackathon Kickoff",
    src: "🖼️",
    date: "2024-09-22",
    featured: false
  },
  {
    id: 5,
    eventId: 2,
    title: "Team Presentations",
    src: "🖼️",
    date: "2024-09-23",
    featured: true
  },
  {
    id: 6,
    eventId: 3,
    title: "Award Ceremony",
    src: "🖼️",
    date: "2024-09-24",
    featured: false
  }
];

const UploadGallery = () => {
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [activeTab, setActiveTab] = useState("all");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<{open: boolean, src: string, title: string}>({
    open: false,
    src: "",
    title: ""
  });
  
  // Filter images based on selected event and active tab
  const filteredImages = mockGalleryImages.filter(image => {
    // Event filter
    const matchesEvent = 
      selectedEvent === "all" || 
      image.eventId === Number(selectedEvent);
    
    // Tab filter
    if (activeTab === "featured" && !image.featured) {
      return false;
    }
    
    return matchesEvent;
  });

  // Handle drag events for file upload
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process selected files
  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // Remove a file from uploaded files
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload all files (simulated)
  const uploadFiles = () => {
    alert(`${uploadedFiles.length} images uploaded successfully!`);
    setUploadedFiles([]);
  };

  // Open image preview
  const openPreview = (src: string, title: string) => {
    setPreviewImage({
      open: true,
      src,
      title
    });
  };

  // Close image preview
  const closePreview = () => {
    setPreviewImage({
      open: false,
      src: "",
      title: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        {/* Main content with left margin to account for sidebar */}
        <main className="flex-1 ml-80 p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-orbitron font-bold mb-6">Gallery Management</h1>
            
            {/* Upload Section */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <Image className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Upload Images to Gallery</h2>
              <p className="text-muted-foreground mb-4">Drag and drop image files here, or click to browse</p>
              
              <div className="flex justify-center">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('gallery-upload')?.click()}
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Files</span>
                </Button>
                <input
                  id="gallery-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Files to Upload ({uploadedFiles.length})</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setUploadedFiles([])}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span>Clear All</span>
                    </Button>
                    <Button onClick={uploadFiles}>
                      <Upload className="w-4 h-4 mr-2" />
                      <span>Upload All</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="relative overflow-hidden group">
                      <CardContent className="p-2">
                        <div className="relative aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                          <FileImage className="w-10 h-10 text-muted-foreground absolute" />
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover z-10"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="rounded-full bg-white text-black hover:bg-white/90"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Event Selection */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-muted-foreground">Add to event:</span>
                  <select
                    value={selectedEvent.toString()}
                    onChange={(e) => setSelectedEvent(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                  >
                    <option value="" disabled>Select Event</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id.toString()}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* Gallery Section */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium">Existing Gallery</h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedEvent.toString()}
                  onChange={(e) => setSelectedEvent(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
                >
                  <option value="all">All Events</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id.toString()}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Images</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {filteredImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => {
                      const event = events.find(e => e.id === image.eventId);
                      
                      return (
                        <Card key={image.id} className="relative overflow-hidden group">
                          <CardContent className="p-2">
                            <div className="relative aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                              {image.featured && (
                                <span className="absolute top-2 right-2 z-30 bg-primary text-primary-foreground text-xs py-1 px-2 rounded">
                                  Featured
                                </span>
                              )}
                              <div className="text-6xl">{image.src}</div>
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="rounded-full bg-white text-black hover:bg-white/90"
                                  onClick={() => openPreview(image.src, image.title)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="rounded-full bg-white text-black hover:bg-white/90"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="rounded-full bg-white text-black hover:bg-white/90"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="mt-2 text-sm font-medium">{image.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {event?.title} • {image.date}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Image className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No images found</h3>
                    <p className="text-muted-foreground">Upload some images or select a different event</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />

      {/* Image Preview Dialog */}
      <Dialog open={previewImage.open} onOpenChange={closePreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{previewImage.title}</DialogTitle>
            <DialogDescription>
              Image preview
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="text-8xl">{previewImage.src}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            <Button className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadGallery;