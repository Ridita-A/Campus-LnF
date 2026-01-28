import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card.jsx";
import { Badge } from "@/app/components/ui/badge.jsx";
import { Button } from "@/app/components/ui/button.jsx";
import { MapPin, Calendar, User, Phone, CheckCircle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/app/components/ui/carousel.jsx";

export function ItemCard({ report, currentUserId }) {
  const isOwner = report.userId === currentUserId;

  return (
    <Card className={`overflow-hidden`}>
      {report.imageUrls && report.imageUrls.length > 0 && (
        <div className="relative">
          <Carousel>
            <CarouselContent>
              {report.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video bg-gray-100">
                    <img src={url} alt={`Report image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {report.imageUrls.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{report.itemName}</CardTitle>
              <Badge variant={report.type === "lost" ? "destructive" : "default"}>
                {report.type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
            <CardDescription>{report.category}</CardDescription>
          </div>
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
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="size-4" />
          <span>{report.userName} (ID: {report.userStudentId})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="size-4" />
          <span>{report.userContactNumber}</span>
        </div>
        
      </CardContent>
    </Card>
  );
}
