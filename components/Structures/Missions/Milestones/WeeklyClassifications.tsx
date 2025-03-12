import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { startOfWeek, endOfWeek, format, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Users, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: number;
  created_at: string;
  content: string;
  author: string;
  classification_id: number | null;
  category: string | null;
}

interface Classification {
  id: number;
  created_at: string;
  content: string | null;
  author: string | null;
  classificationtype: string | null;
  comments: Comment[];
}

export default function WeeklyClassifications() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [showCommunity, setShowCommunity] = useState<boolean>(false);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      setError(null);

      const start = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 0 });
      const end = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 0 });

      let query = supabase
        .from("classifications")
        .select("id, created_at, content, author, classificationtype, comments(id, content, created_at, category, author, classification_id)")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (!showCommunity && session?.user?.id) {
        query = query.eq("author", session.user.id);
      }

      const { data, error } = await query;

      if (error) {
        setError("Failed to fetch classifications: " + error.message);
      } else {
        setClassifications(data || []);
      }
      setLoading(false);
    };

    if (session) {
      fetchClassifications();
    }
  }, [session, weekOffset, showCommunity]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
      <Tabs
        defaultValue="individual"
        onValueChange={(value) => setShowCommunity(value === "community")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
            Weekly Classifications
          </h2>
          <TabsList className="bg-[#1e293b] border border-[#6b21a8]">
            <TabsTrigger value="individual" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Yours
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-[#581c87] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <div className="text-lg font-semibold text-[#67e8f9]">
            {format(startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 0 }), 'MMM d')} -{" "}
            {format(endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 0 }), 'MMM d')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <TabsContent value={showCommunity ? "community" : "individual"} className="mt-0">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : classifications.length === 0 ? (
            <p className="text-center">No classifications found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
              {classifications.map((classification) => (
                <Card
                  key={classification.id}
                  className="overflow-hidden bg-[#1e293b] border-[#334155] hover:shadow-[0_0_10px_rgba(124,58,237,0.5)] transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-[#334155] text-[#22d3ee]">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="w-full">
                        <h3 className="font-medium text-white mb-1">{classification.classificationtype || "Unknown"}</h3>
                        <p className="text-sm text-gray-300">{classification.content || "No content"}</p>
                        <div className="text-xs text-gray-500">
                          {format(new Date(classification.created_at), 'PPpp')}
                        </div>

                        {classification.comments.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <h4 className="text-sm font-semibold text-[#d8b4fe]">Comments:</h4>
                            <ul className="space-y-2">
                              {classification.comments.map((comment) => (
                                <li key={comment.id} className="p-2 bg-[#0f172a] rounded">
                                  <p className="text-sm">{comment.content}</p>
                                  <p className="text-xs text-gray-500">
                                    {format(new Date(comment.created_at), 'PPpp')}
                                  </p>
                                  {comment.category && (
                                    <Badge variant="outline" className="mt-1 text-xs border-[#6b21a8] text-[#d8b4fe]">
                                      {comment.category}
                                    </Badge>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};