import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPost } = useBlog();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPost({
      title,
      content,
      tags: tags.split(",").map(tag => tag.trim()),
    });
    navigate("/blog");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-orbitron font-bold mb-8">Create New Post</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-2">
                Post Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title"
                required
                className="bg-card border-border"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-2">
                Post Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post content here..."
                required
                rows={15}
                className="bg-card border-border"
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-muted-foreground mb-2">
                Tags (comma-separated)
              </label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., Rocketry, AI, Events"
                className="bg-card border-border"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="btn-mission">
                Publish Post
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatePost;
