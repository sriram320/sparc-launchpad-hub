import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [branch, setBranch] = useState(user?.branch || "");
  const [semester, setSemester] = useState(user?.semester || "");
  const [year, setYear] = useState(user?.year || "");
  const [college, setCollege] = useState(user?.college || "TOB");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (user) {
      updateUserProfile({
        name,
        branch,
        semester,
        year,
        college,
      });
      alert("Profile updated successfully!");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (user) {
          updateUserProfile({ profilePicture: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold mb-8">Edit Profile</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <Button onClick={handleAvatarClick} className="btn-ai">
                Change Avatar
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-card border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Branch</label>
              <Input value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g., Computer Science" className="bg-card border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Semester</label>
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g., 6th" className="bg-card border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Year</label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g., 3rd" className="bg-card border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">College</label>
              <Input value={college} onChange={(e) => setCollege(e.target.value)} className="bg-card border-border" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} className="btn-mission">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
