
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="mr-4 rounded-lg bg-blue-100 p-2">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-xl font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
