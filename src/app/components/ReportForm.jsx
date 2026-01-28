import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Calendar } from "lucide-react";
import { supabase } from "../../supabase";

export function ReportForm({ type, userId, onSubmit, onCancel }) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.rpc('get_locations');
      if (error) console.error('Error fetching locations:', error);
      else setLocations(data);
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.rpc('get_tags');
      if (error) console.error('Error fetching tags:', error);
      else setTags(data);
    };

    fetchLocations();
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload images and get public URLs
    const imageUrls = [];
    for (const file of imageFiles) {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      try {
        const { error: uploadError } = await supabase.storage
          .from("lnf-images")
          .upload(fileName, file);
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          continue;
        }

        const { data } = supabase.storage.from("lnf-images").getPublicUrl(fileName);
        if (data?.publicUrl) imageUrls.push(data.publicUrl);
      } catch (err) {
        console.error("Unexpected upload error:", err);
      }
    }

    // 2. Create report object
    const report = {
      id: Date.now(), // unique ID for frontend & React keys
      creator_id: userId,
      last_location_id: parseInt(location),
      title: itemName,
      description,
      lost_at: new Date(date).toISOString(),
      tags: [parseInt(category)],
      image_urls: imageUrls,
    };

    // 3. Send to backend API
    try {
      if (type === 'lost') {
        const response = await fetch('http://localhost:3000/api/lost/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Error creating lost report:', data.error);
        } else {
          onSubmit(report); // use frontend report with generated ID
        }
      }
      // handle 'found' reports here if needed
    } catch (err) {
      console.error('Network or API error:', err);
    }
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
                {tags.map((tag) => (
                  <SelectItem key={tag.tag_id} value={tag.tag_id.toString()}>
                    {tag.name}
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
            <Label htmlFor="location">{type === "lost" ? "Last Seen Location" : "Found Location"}</Label>
            <Select value={location} onValueChange={setLocation} required>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.location_id} value={loc.location_id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{type === "lost" ? "Date Lost" : "Date Found"}</Label>
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
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Submit Report</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
