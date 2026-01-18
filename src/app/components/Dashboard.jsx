import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select.jsx";
import { ItemCard } from "@/app/components/ItemCard.jsx";
import { ReportForm } from "@/app/components/ReportForm.jsx";
import { AuthForm } from "@/app/components/AuthForm.jsx";
import { PlusCircle, Search, LogOut, Package } from "lucide-react";
import { toast } from "sonner";



export function Dashboard({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [showReportForm, setShowReportForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Load reports from localStorage
  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem("reports") || "[]");
    setReports(storedReports);
  }, []);

  // Save reports to localStorage
  const saveReports = (newReports) => {
    localStorage.setItem("reports", JSON.stringify(newReports));
    setReports(newReports);
  };

  // Find matching items
  const findMatches = (report) => {
    const oppositeType = report.type === "lost" ? "found" : "lost";
    return reports.filter((r) => {
      if (r.type !== oppositeType || r.status !== "active") return false;

      // Check if items match based on name, category, location, and date proximity
      const nameMatch = r.itemName.toLowerCase().includes(report.itemName.toLowerCase()) ||
        report.itemName.toLowerCase().includes(r.itemName.toLowerCase());
      const categoryMatch = r.category === report.category;
      const locationMatch = r.location === report.location;

      // Check if dates are within 7 days of each other
      const date1 = new Date(r.date).getTime();
      const date2 = new Date(report.date).getTime();
      const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
      const dateProximity = daysDiff <= 7;

      return (nameMatch && categoryMatch) || (categoryMatch && locationMatch && dateProximity);
    });
  };

  const handleSubmitReport = (report) => {
    const newReports = [...reports, report];
    saveReports(newReports);
    setShowReportForm(null);

    // Check for matches
    const matches = findMatches(report);
    if (matches.length > 0) {
      toast.success(`Report submitted! Found ${matches.length} potential match(es).`);
    } else {
      toast.success("Report submitted successfully!");
    }
  };

  const handleMarkResolved = (id) => {
    const newReports = reports.map((r) =>
      r.id === id ? { ...r, status: "resolved" } : r
    );
    saveReports(newReports);
    toast.success("Item marked as resolved!");
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || report.category === filterCategory;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my-reports" && report.userId === user.id) ||
      (activeTab === "lost" && report.type === "lost") ||
      (activeTab === "found" && report.type === "found");

    return matchesSearch && matchesCategory && matchesTab;
  });

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

  if (showReportForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto py-8">
          <ReportForm
            type={showReportForm}
            userId={user.id}
            onSubmit={handleSubmitReport}
            onCancel={() => setShowReportForm(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="size-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold">Campus Lost & Found</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="size-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => setShowReportForm("lost")} className="flex-1 sm:flex-none">
            <PlusCircle className="size-4 mr-2" />
            Report Lost Item
          </Button>
          <Button onClick={() => setShowReportForm("found")} className="flex-1 sm:flex-none" variant="outline">
            <PlusCircle className="size-4 mr-2" />
            Report Found Item
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
            <TabsTrigger value="found">Found</TabsTrigger>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Package className="size-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                  <ItemCard
                    key={report.id}
                    report={report}
                    currentUserId={user.id}
                    onMarkResolved={handleMarkResolved}
                    matchedItems={findMatches(report)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
