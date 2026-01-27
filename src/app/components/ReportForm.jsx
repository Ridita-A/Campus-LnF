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
      if (error) {
        console.error('Error fetching locations:', error);
      } else {
        setLocations(data);
      }
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.rpc('get_tags');
      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setTags(data);
      }
    };

    fetchLocations();
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrls = [];
    for (const file of imageFiles) {
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("report-images")
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(fileName);
      imageUrls.push(publicUrl);
    }

    const report = {
      p_creator_id: userId,
      p_last_location_id: parseInt(location),
      p_title: itemName,
      p_description: description,
      p_lost_at: date,
      p_tags: [parseInt(category)],
      p_image_urls: imageUrls,
    };

    if (type === 'lost') {
      const { data, error } = await supabase.rpc('create_lost_report', report);
      if (error) {
        console.error("Error creating lost report:", error);
      } else {
        onSubmit(data);
      }
    }
    // else if (type === 'found') {
    //   const { data, error } = await supabase.rpc('create_found_report', report);
    //   if (error) {
    //     console.error("Error creating found report:", error);
    //   } else {
    //     onSubmit(data);
    //   }
    // }
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
            <Label htmlFor="location">
              {type === "lost" ? "Last Seen Location" : "Found Location"}
            </Label>
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
            <Label htmlFor="images">Images</Label>
            <Input
              id="images"
              type="file"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
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
