#!/bin/bash

# Update imports script for the new file structure

echo "Updating import paths to use new file structure..."

# Update context imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/ActivePlanet"|from "@/src/core/context/ActivePlanet"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/InventoryContext"|from "@/src/core/context/InventoryContext"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/UserAnomalies"|from "@/src/core/context/UserAnomalies"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/MissionContext"|from "@/src/core/context/MissionContext"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/TravelContext"|from "@/src/core/context/TravelContext"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/context/UserProfile"|from "@/src/core/context/UserProfile"|g'

# Update database imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/db"|from "@/src/core/database"|g'

# Update utils imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/utils"|from "@/src/shared/utils"|g'

# Update helper imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/lib/helper/|from "@/src/shared/helpers/|g'

# Update hooks imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/hooks/|from "@/src/shared/hooks/|g'

# Update constants imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/constants/backgrounds"|from "@/src/shared/constants/backgrounds"|g'

# Update data imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/projects"|from "@/src/shared/data/projects"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/roverList"|from "@/src/shared/data/rovers"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/missions"|from "@/src/features/missions/data"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/telescope/projects"|from "@/src/features/telescope/data/telescope/projects"|g'

# Update planet-related imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/planet-physics"|from "@/src/features/planets/physics"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/atmospheric-layers"|from "@/src/features/planets/atmospheric-layers"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/landmark-types"|from "@/src/features/planets/landmark-types"|g'

# Update weather-related imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/biome-data"|from "@/src/features/weather/biomes"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/data/cloud-compositions"|from "@/src/features/weather/cloud-compositions"|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/cloud-types"|from "@/src/features/weather/cloud-types"|g'

# Update generator imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/Generators/PH/|from "@/src/shared/utils/generators/PH/|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/Generators/P4/|from "@/src/shared/utils/generators/P4/|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/noise"|from "@/src/shared/utils/noise"|g'

# Update telescope-related imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/Structures/Telescope/|from "@/src/features/telescope/utils/|g'

# Update research imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/research/|from "@/src/features/research/|g'

# Update structures imports
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/constants/Structures/|from "@/src/features/structures/constants/|g'
find ./src/components ./src/app ./content -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/utils/Structures/|from "@/src/features/structures/utils/|g'

echo "Import paths updated successfully!"
