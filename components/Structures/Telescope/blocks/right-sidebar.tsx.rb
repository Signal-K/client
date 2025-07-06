export default function TelescopeRightSidebarDesktop() {
    return (
        <div className="hidden lg:flex w-80 h-full bg-[#16213e]/95 border-l border-[#a8d8ea]/20 flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-[#a8d8ea]/20 bg-gradient-to-r from-[#16213e] to-[#1a1a2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#87ceeb] to-[#a8d8ea] rounded-full flex items-center justify-center shadow-lg">
              <Building className="h-5 w-5 text-[#1a1a2e]" />
            </div>
            <div>
              <h1 className="text-[#e8f4f8] font-bold text-lg tracking-wider">STATISTICS</h1>
              <p className="text-[#a8d8ea] text-xs font-mono">DISCOVERY DATA</p>
            </div>
          </div>
        </div>

        {/* Discovery Stats */}
        <div className="p-4 border-b border-[#a8d8ea]/20">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#e8f4f8] font-mono">{classifications.length}</div>
              <div className="text-xs text-[#a8d8ea] font-mono">YOUR FINDS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#a8d8ea] font-mono">{allClassifications.length}</div>
              <div className="text-xs text-[#a8d8ea] font-mono">TOTAL FINDS</div>
            </div>
          </div>
        </div>

        {/* Recent Classifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4 text-[#a8d8ea]" />
            <span className="text-[#e8f4f8] text-sm font-mono">RECENT ACTIVITY</span>
          </div>

          {classifications.slice(0, 8).map((classification) => (
            <Card
              key={classification.id}
              className="bg-[#1a1a2e]/60 border border-[#a8d8ea]/20 hover:border-[#a8d8ea]/40 transition-all cursor-pointer backdrop-blur-sm"
              onClick={() => handleViewClassification(classification)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#e8f4f8] text-sm font-mono">#{classification.id}</div>
                  <Badge className="bg-[#a8d8ea] text-[#1a1a2e] text-xs font-mono">
                    {classification.classificationtype?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#a8d8ea] font-mono">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(classification.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {classifications.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-2 border-dashed border-[#a8d8ea]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-[#a8d8ea]/50" />
              </div>
              <p className="text-[#e8f4f8] text-sm font-mono mb-1">NO CLASSIFICATIONS YET</p>
              <p className="text-[#a8d8ea] text-xs font-mono">Start exploring!</p>
            </div>
          )}
        </div>
      </div>
    );
};