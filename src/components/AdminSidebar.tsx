import { useState } from "react";
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckSquare, 
  Upload, 
  PenTool, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const adminTools = [
    { id: 'create-event', icon: Plus, label: 'Create Event', color: 'primary', path: '/host-dashboard/create-event' },
    { id: 'manage-events', icon: Calendar, label: 'Manage Events', color: 'secondary', path: '/host-dashboard/manage-events' },
    { id: 'view-participants', icon: Users, label: 'View Participants', color: 'accent', path: '/host-dashboard/view-participants' },
    { id: 'attendance-manager', icon: CheckSquare, label: 'Attendance Manager', color: 'primary', path: '/attendance-manager' },
    { id: 'mark-attendance', icon: CheckSquare, label: 'Mark Attendance (Legacy)', color: 'secondary', path: '/host-dashboard/mark-attendance' },
    { id: 'upload-gallery', icon: Upload, label: 'Upload Gallery', color: 'secondary', path: '/host-dashboard/upload-gallery' },
    { id: 'post-blog', icon: PenTool, label: 'Post Blog Update', color: 'accent', path: '/blog/new' },
    { id: 'analytics', icon: BarChart, label: 'View Analytics', color: 'primary', path: null },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'secondary', path: null }
  ];

  const handleToolClick = (toolId: string) => {
    const tool = adminTools.find(t => t.id === toolId);
    
    // If the tool has a path, navigate to it
    if (tool && tool.path) {
      navigate(tool.path);
      return;
    }

    // For tools without paths yet, open modals (temporary)
    setActiveModal(toolId);
    console.log(`Opening ${toolId} modal`);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-card/50 backdrop-blur-md border-r border-border z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Toggle Button */}
        <div className="flex justify-end p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-card/50"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="px-4 pb-4 space-y-4">
          {!isCollapsed && (
            <div className="mb-6">
              <h2 className="text-xl font-orbitron font-bold text-foreground mb-2">
                Host <span className="text-primary">Dashboard</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage SPARC Club events and content
              </p>
            </div>
          )}

          {/* Admin Tools */}
          <div className="space-y-2">
            {adminTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant="ghost"
                  onClick={() => handleToolClick(tool.id)}
                  className={`w-full justify-start hover:bg-card/50 ${
                    isCollapsed ? 'px-2' : 'px-4'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${
                    tool.color === 'primary' ? 'text-primary' : 
                    tool.color === 'secondary' ? 'text-secondary' : 'text-accent'
                  }`} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm">{tool.label}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Overlays - Placeholder implementations */}
      {activeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="cosmic-card w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{adminTools.find(t => t.id === activeModal)?.label}</span>
                <Button variant="ghost" size="sm" onClick={closeModal}>×</Button>
              </CardTitle>
              <CardDescription>
                This feature will be implemented with backend integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Feature coming soon! This will include:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {activeModal === 'create-event' && (
                    <>
                      <li>Event title, description, date/time inputs</li>
                      <li>Venue and capacity settings</li>
                      <li>Paid/Free toggle with price settings</li>
                      <li>Cover image upload</li>
                      <li>Session code generation</li>
                    </>
                  )}
                  {activeModal === 'manage-events' && (
                    <>
                      <li>Edit existing events</li>
                      <li>Toggle event lock/unlock status</li>
                      <li>Delete events with confirmation</li>
                      <li>View event statistics</li>
                    </>
                  )}
                  {activeModal === 'view-participants' && (
                    <>
                      <li>List of all registered participants</li>
                      <li>Export participant data to CSV</li>
                      <li>Filter by event or date</li>
                      <li>Contact information access</li>
                    </>
                  )}
                  {activeModal === 'mark-attendance' && (
                    <>
                      <li>QR code scanner for check-in</li>
                      <li>Manual attendance marking</li>
                      <li>Session start/end tracking</li>
                      <li>Attendance reports generation</li>
                    </>
                  )}
                  {activeModal === 'upload-gallery' && (
                    <>
                      <li>Drag-and-drop image upload</li>
                      <li>Batch image processing</li>
                      <li>Image categorization</li>
                      <li>Auto-resize and optimization</li>
                    </>
                  )}
                  {activeModal === 'post-blog' && (
                    <>
                      <li>Rich text editor</li>
                      <li>Image embedding</li>
                      <li>Post scheduling</li>
                      <li>Tag management</li>
                    </>
                  )}
                </ul>
                <Button onClick={closeModal} className="w-full btn-mission">
                  Got it!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;