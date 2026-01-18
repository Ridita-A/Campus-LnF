import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, Phone, CheckCircle } from "lucide-react";



export function ItemCard({ report, currentUserId, onMarkResolved, matchedItems }) {
  const isOwner = report.userId === currentUserId;
  const hasMatches = matchedItems && matchedItems.length > 0;

  return (
    <Card className={hasMatches ? "border-green-500 border-2" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{report.itemName}</CardTitle>
              <Badge variant={report.type === "lost" ? "destructive" : "default"}>
                {report.type === "lost" ? "Lost" : "Found"}
              </Badge>
              {report.status === "resolved" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="size-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <CardDescription>{report.category}</CardDescription>
          </div>
          {hasMatches && (
            <Badge className="bg-green-500">
              {matchedItems.length} Match{matchedItems.length > 1 ? "es" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{report.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="size-4" />
          <span>{report.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="size-4" />
          <span>{new Date(report.date).toLocaleDateString()}</span>
        </div>

        {!isOwner && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="size-4" />
            <span>{report.contactInfo}</span>
          </div>
        )}

        {isOwner && report.status === "active" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkResolved && onMarkResolved(report.id)}
            className="w-full mt-2"
          >
            Mark as Resolved
          </Button>
        )}

        {hasMatches && (
          <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">
              Potential Matches Found:
            </p>
            {matchedItems.map((match, index) => (
              <div key={match.id} className="text-sm text-green-700 mb-1">
                {index + 1}. {match.itemName} - {match.location} (
                {new Date(match.date).toLocaleDateString()})
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
