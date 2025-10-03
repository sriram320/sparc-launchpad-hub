import { createContext, useContext, useState, ReactNode } from "react";
import { TeamMemberImages } from "@/assets/team-member-images";

// Define team member type
export interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  image: keyof typeof TeamMemberImages;
  profileLink?: string;
  bio?: string;
}

interface TeamContextType {
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, "id">) => void;
  updateTeamMember: (id: number, updatedMember: Partial<TeamMember>) => void;
  deleteTeamMember: (id: number) => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

// Create a hook to use the team context


// Sample initial team members data
const initialTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Arjun Patel",
    role: "President",
    department: "Aerospace Engineering",
    image: "member1",
    profileLink: "/team/arjun-patel",
    bio: "Ph.D. candidate specializing in spacecraft propulsion systems with 5+ years of research experience."
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "AI Lead",
    department: "Computer Science",
    image: "member2",
    profileLink: "/team/priya-sharma",
    bio: "Machine learning specialist focused on autonomous navigation systems for aerial vehicles."
  },
  {
    id: 3,
    name: "Rahul Kapoor",
    role: "Propulsion Lead",
    department: "Mechanical Engineering",
    image: "member3",
    profileLink: "/team/rahul-kapoor",
    bio: "Expert in rocket engine design with experience at ISRO's propulsion systems division."
  },
  {
    id: 4,
    name: "Anjali Mehta",
    role: "Electronics Lead",
    department: "Electrical Engineering",
    image: "member4",
    profileLink: "/team/anjali-mehta",
    bio: "Specializes in avionics and embedded systems design for aerospace applications."
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Structures Lead",
    department: "Civil Engineering",
    image: "member5",
    profileLink: "/team/vikram-singh",
    bio: "Focuses on lightweight material development and structural analysis for aerospace vehicles."
  }
];

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  const addTeamMember = (member: Omit<TeamMember, "id">) => {
    const newMember = {
      ...member,
      id: Date.now(),
    };
    
    setTeamMembers([...teamMembers, newMember]);
  };

  const updateTeamMember = (id: number, updatedMember: Partial<TeamMember>) => {
    setTeamMembers(
      teamMembers.map(member => 
        member.id === id ? { ...member, ...updatedMember } : member
      )
    );
  };

  const deleteTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
  };

  return (
    <TeamContext.Provider value={{ teamMembers, addTeamMember, updateTeamMember, deleteTeamMember }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  
  return context;
};