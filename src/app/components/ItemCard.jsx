import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, CheckCircle, Tag } from "lucide-react";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback.jsx";

export function ItemCard({ report, currentUserId }) {
  const isOwner = report.userId === currentUserId;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image Section */}
      {report.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={report.imageUrl}
            alt={report.itemName}
            className="h-full w-full object-cover"
          />
          {report.status === "resolved" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                <CheckCircle className="size-3 mr-1" />
                Resolved
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{report.itemName}</CardTitle>
            <CardDescription className="mt-1">{report.category}</CardDescription>
          </div>
          <Badge variant={report.type === "lost" ? "destructive" : "default"} className="shrink-0">
            {report.type === "lost" ? "Lost" : "Found"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-3">{report.description}</p>

        {/* User Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="size-4 shrink-0" />
          <span className="truncate font-medium">{report.userName}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="size-4 shrink-0" />
          <span className="truncate">{report.location}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="size-4 shrink-0" />
          <span>{new Date(report.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t">
            <Tag className="size-4 shrink-0 mt-0.5 text-gray-600" />
            <div className="flex flex-wrap gap-1">
              {report.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
