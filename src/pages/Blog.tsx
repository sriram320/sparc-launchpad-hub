import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Plus, ThumbsUp, MessageCircle, Calendar, User, Tag, Search, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { posts, deletePost } = useBlog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const tags = ["All", "Rocketry", "AI/ML", "Embedded Systems", "Research", "Events", "Tutorials"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleNewPostClick = () => {
    if (isAuthenticated) {
      navigate("/blog/new");
    } else {
      navigate("/login?redirect=/blog/new");
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="starfield absolute inset-0"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 hero-glow">
            Community <span className="text-primary">Hub</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Share knowledge, discuss innovations, and connect with fellow aerospace enthusiasts.
          </p>
          <Button onClick={handleNewPostClick} className="btn-mission flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </Button>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <div key={post.id} className="cosmic-card flex flex-col">
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-orbitron font-semibold text-foreground mb-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground text-sm mt-auto">
                    <div className="flex items-center">
                      <img src={post.authorAvatar} alt={post.author} className="w-6 h-6 rounded-full mr-2" />
                      <span>{post.author}</span>
                    </div>
                    {isAuthenticated && user?.name === post.author && (
                      <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;