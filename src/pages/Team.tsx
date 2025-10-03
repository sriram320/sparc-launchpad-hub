import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "SRIRAM KUNDAPUR",
    role: "CO-ORDINATOR",
    avatar: "/placeholder.svg",
  },
  {
    name: "RISHI TEJAS",
    role: "TECHNICAL HEAD",
    avatar: "/placeholder.svg",
  },
  {
    name: "SHIVA U",
    role: "TECHNICAL LEAD",
    avatar: "/placeholder.svg",
  },
  {
    name: "ROUNAK",
    role: "TECHNICAL LEAD",
    avatar: "/placeholder.svg",
  },
];

const Team = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Our Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {teamMembers.map((member) => (
          <Card key={member.name}>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{member.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;