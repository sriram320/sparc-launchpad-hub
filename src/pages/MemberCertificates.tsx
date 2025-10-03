import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const MemberCertificates = () => {
  // Mock data for certificates
  const certificates = [
    {
      id: 1,
      title: "Certificate of Participation",
      event: "Rocketry Bootcamp 2024",
      date: "December 17, 2024",
      fileUrl: "/certificates/rocketry-bootcamp-2024.pdf",
    },
    {
      id: 2,
      title: "Certificate of Completion",
      event: "Embedded Systems Workshop",
      date: "November 28, 2024",
      fileUrl: "/certificates/embedded-systems-workshop.pdf",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold mb-8">My Certificates</h1>
      {certificates.length > 0 ? (
        <div className="space-y-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="cosmic-card p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{cert.title}</h3>
                  <p className="text-muted-foreground text-sm">{cert.event} - {cert.date}</p>
                </div>
              </div>
              <a href={cert.fileUrl} download>
                <Button className="btn-ai flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You have no certificates yet.</p>
      )}
    </div>
  );
};

export default MemberCertificates;
