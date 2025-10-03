import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Define the Post interface
interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  tags: string[];
  likes: number;
  comments: number;
  trending: boolean;
  image: string;
}

// Define the BlogContextType interface
interface BlogContextType {
  posts: Post[];
  addPost: (post: { title: string; content: string; tags: string[]; image: string }) => void;
  deletePost: (postId: number) => void;
}

// Initial blog posts data
const initialPosts: Post[] = [
  {
    id: 1,
    title: "Breaking the 2km Barrier: Our Record High-Altitude Launch",
    excerpt: "A detailed analysis of our successful 2-kilometer rocket launch, including technical challenges, telemetry data, and lessons learned for future missions.",
    content: "Our recent achievement of reaching 2 kilometers altitude represents a major milestone for SPARC Club...",
    author: "Arjun Patel",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    date: "March 15, 2024",
    readTime: "8 min read",
    tags: ["Rocketry", "Research"],
    likes: 45,
    comments: 12,
    trending: true,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Computer Vision in Aerospace: Building Autonomous Navigation",
    excerpt: "How we developed an AI-powered navigation system for our drones using computer vision and machine learning techniques.",
    content: "The integration of computer vision in aerospace applications has opened new possibilities...",
    author: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    date: "March 10, 2024",
    readTime: "6 min read",
    tags: ["AI/ML", "Research"],
    likes: 38,
    comments: 8,
    trending: true,
    image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=300&fit=crop"
  },
];

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const { user } = useAuth();

  const addPost = (post: { title: string; content: string; tags: string[]; image: string }) => {
    const newPost: Post = {
      id: Date.now(),
      ...post,
      excerpt: post.content.substring(0, 100) + "...",
      author: user?.name || 'Anonymous',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: `${Math.ceil(post.content.split(' ').length / 200)} min read`,
      likes: 0,
      comments: 0,
      trending: false,
    };
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const deletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const value = {
    posts,
    addPost,
    deletePost,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};