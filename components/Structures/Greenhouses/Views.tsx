import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Card } from "antd";
import { ArrowRight, ChevronLeft, Leaf, MapPin } from "lucide-react";
import { ReactElement, ReactNode } from "react";

interface Project {
  id: number
  station: number
  biome: string
  title: string
  icon: React.ElementType
  completedCount: number
  internalComponent?: React.ElementType
  color: string
  images?: string[]
  stats?: {
    cameras: number
    habitat: string
    temperature: string
    humidity: string
  };
};

interface Animal {
  name: string;
  icon: string;
};

export function MainView({ projects, archiveImages, onProjectClick }: MainViewProps): ReactElement {
    return (
      <div className="flex flex-col gap-4">
        {/* Projects Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Active Projects
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Leaf className="h-4 w-4 mr-1" />3 Stations
            </Badge>
          </div>
  
          <div className="flex flex-col gap-4">
            {projects.map((project: Project) => {
              const Icon = project.icon
              return (
                <BoltedCard key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2 pt-4">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 ${project.color}`} />
                        <span className="ml-2">{project.title}</span>
                        {project.completedCount > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {project.completedCount} completed
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onProjectClick(project.id)}>
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
  
                  <CardContent className="p-4 pt-2">
                    <div className="flex gap-3 justify-start">
                      {project.images?.map((img: string, idx: number) => (
                        <div key={idx} className="w-16 h-16 rounded-sm overflow-hidden bg-muted border border-border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`Capture ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
  
                  <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                    <div className="flex gap-4">
                      <Badge variant="outline" className="text-xs">
                        {project.biome}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Station {project.station}
                      </span>
                    </div>
                  </CardFooter>
                </BoltedCard>
              )
            })}
  
            {/* <Button variant="outline" className="h-20 border-dashed flex flex-col gap-2 text-base">
              <Plus className="h-6 w-6" />
              <span>Load More Projects</span>
            </Button> */}
          </div>
        </div>
  
        {/* Archive Section */}
        {/* <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Archive
            </h2>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <span>142 Items</span>
            </Badge>
          </div>
  
          <BoltedCard>
            <CardContent className="p-4">
              <Tabs defaultValue="studied" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-10 mb-3">
                  <TabsTrigger value="studied" className="text-base">
                    Studied
                  </TabsTrigger>
                  <TabsTrigger value="community" className="text-base">
                    Community
                  </TabsTrigger>
                </TabsList>
  
                {["studied", "community"].map((tab: string) => (
                  <TabsContent key={tab} value={tab} className="mt-0 p-0">
                    <div className="grid grid-cols-5 grid-rows-2 gap-2">
                      {archiveImages.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-sm overflow-hidden bg-muted border border-border">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`${tab} image ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </BoltedCard>
        </div> */}
      </div>
    )
  }
  
  export function ProjectDetailView({ project, onBack }: ProjectDetailViewProps): ReactElement {
    const recentCaptures = Array(8).fill("/placeholder.svg?height=100&width=100")
    const Icon = project.icon
    const InternalComponent = project.internalComponent
  
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold flex items-center">
              <Icon className={`h-5 w-5 ${project.color}`} />
              <span className="ml-2">{project.title}</span>
            </h2>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <span>Station ID: {project.station}</span>
          </Badge>
        </div>
  
        {InternalComponent && <InternalComponent />}
  
        {/* <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Recent Captures</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-4 gap-3">
              {recentCaptures.map((img: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-sm overflow-hidden bg-muted border border-border">
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Capture ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </BoltedCard>
  
        <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Station Metrics</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-base">
              <StatItem label="Cameras" value={project.stats?.cameras || 0} />
              <StatItem label="Habitat Size" value={project.stats?.habitat || "N/A"} />
              <StatItem label="Temperature" value={project.stats?.temperature || "N/A"} />
              <StatItem label="Humidity" value={project.stats?.humidity || "N/A"} />
            </div>
          </CardContent>
        </BoltedCard> */}
  
        {/* <BoltedCard>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg">Biome: {project.biome}</CardTitle>
          </CardHeader>
  
          <CardContent className="p-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-base">
              <StatItem label="Birds" value="24 species" />
              <StatItem label="Mammals" value="12 species" />
              <StatItem label="Insects" value="36 species" />
              <StatItem label="Plants" value="48 species" />
            </div>
          </CardContent>
        </BoltedCard> */}
      </div>
    );
  };
  
  
  // Interface for reusable components
  interface BoltedCardProps {
    children: ReactNode
    className?: string
  };
  
  interface MetricItemProps {
    icon: React.ElementType
    label: string
    value: string
  };
  
  interface StatItemProps {
    label: string
    value: string | number
  };
  
  interface MainViewProps {
    projects: Project[]
    archiveImages?: string[]
    onProjectClick: (id: number) => void
  };
  
  interface ProjectDetailViewProps {
    project: Project
    onBack: () => void
  };
  
  export const Bolt = ({ className = "" }: { className?: string }): ReactElement => (
    <div className={`w-3 h-3 rounded-full bg-muted-foreground/50 border border-muted-foreground/70 ${className}`}></div>
  );
  
  export const BoltedCard = ({ children, className = "" }: BoltedCardProps): ReactElement => (
    <Card className={`relative border-border bg-card bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)]${className}`}>
      <Bolt className="absolute top-3 left-3" />
      <Bolt className="absolute top-3 right-3" />
      <Bolt className="absolute bottom-3 left-3" />
      <Bolt className="absolute bottom-3 right-3" />
      <div className="absolute top-12 left-0 w-full h-[1px] bg-border"></div>
      {children}
    </Card>
  );
  
  export const MetricItem = ({ icon: Icon, label, value }: MetricItemProps): ReactElement => (
    <div className="flex items-center gap-3 p-2 rounded-sm bg-muted">
      <Icon className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  
  export const StatItem = ({ label, value }: StatItemProps): ReactElement => (
    <div className="flex items-center justify-between p-2 rounded-sm bg-muted">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );