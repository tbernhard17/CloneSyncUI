
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const StatusCard = () => {
  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Status</CardTitle>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Service Status</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Operational
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Response Time</span>
            <span className="text-sm font-medium">124ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
