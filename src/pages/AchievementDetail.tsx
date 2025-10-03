import { useParams } from "react-router-dom";

const AchievementDetail = () => {
  const { achievementId } = useParams();

  // In a real application, you would fetch the achievement details based on the ID.
  // For this example, we'll just display the ID.

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Achievement Detail</h1>
      <p>Details for achievement ID: {achievementId}</p>
    </div>
  );
};

export default AchievementDetail;
