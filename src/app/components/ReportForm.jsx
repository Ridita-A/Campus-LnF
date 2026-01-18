import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar } from "lucide-react";



const categories = [
  "Electronics",
  "Clothing",
  "Books & Stationery",
  "Bags & Backpacks",
  "Keys",
  "Wallets & Purses",
  "Jewelry & Accessories",
  "Sports Equipment",
  "ID Cards & Documents",
  "Other",
];

const locations = [
  "Library",
  "Student Center",
  "Cafeteria",
  "Gym",
  "Parking Lot",
  "Lecture Hall A",
  "Lecture Hall B",
  "Lab Building",
  "Dormitory",
  "Sports Field",
  "Other",
];

export function ReportForm({ type, userId, onSubmit, onCancel }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const report = {
      id: Date.now().toString(),
      type,
      itemName,
      category,
      description,
      location,
      date,
      contactInfo,
      userId,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    onSubmit(report);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "lost" ? "Report Lost Item" : "Report Found Item"}
        </CardTitle>
        <CardDescription>
          {type === "lost"
            ? "Help us find your lost item by providing details"
            : "Help reunite someone with their lost item"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              type="text"
              placeholder="e.g., Black iPhone 13"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description (color, brand, unique features, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              {type === "lost" ? "Last Seen Location" : "Found Location"}
            </Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              {type === "lost" ? "Date Lost" : "Date Found"}
            </Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Input
              id="contact"
              type="text"
              placeholder="Phone number or additional contact info"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Submit Report
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
