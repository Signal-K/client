import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Galaxy Zoo project ID on Zooniverse is 12268 (or similar, we can use a specific subject set)
// For this example, we'll use a known open subject set or a general query
const GALAXY_ZOO_PROJECT_ID = "12268"; 

async function importGalaxyZooSubjects() {
  console.log("🚀 Starting Galaxy Zoo subject import...");

  try {
    // 1. Fetch subjects from Zooniverse Panoptes API
    // We'll get 20 subjects for the prototype
    const response = await axios.get(`https://www.zooniverse.org/api/subjects`, {
      params: {
        project_id: GALAXY_ZOO_PROJECT_ID,
        page_size: 20,
      },
      headers: {
        "Accept": "application/vnd.api+json; version=1",
        "Content-Type": "application/json",
      }
    });

    const subjects = response.data.subjects;
    console.log(`📦 Found ${subjects.length} subjects from Zooniverse.`);

    for (const subject of subjects) {
      const externalId = subject.id;
      // Zooniverse subjects often have multiple locations (images), we take the first one
      const avatarUrl = subject.locations[0]["image/jpeg"] || subject.locations[0]["image/png"];
      
      if (!avatarUrl) continue;

      // 2. Check if already exists to avoid duplicates
      const existing = await prisma.anomaly.findFirst({
        where: {
          ticId: `zooniverse-${externalId}`,
          anomalySet: "telescope-galaxyZoo"
        }
      });

      if (existing) {
        console.log(`⏩ Subject ${externalId} already exists, skipping.`);
        continue;
      }

      // 3. Create anomaly in our database
      await prisma.anomaly.create({
        data: {
          content: `Galaxy ${externalId}`,
          ticId: `zooniverse-${externalId}`,
          anomalySet: "telescope-galaxyZoo",
          avatarUrl: avatarUrl,
          anomalytype: "galaxy",
          type: "Galaxy",
          classificationStatus: "unclassified",
          anomalyConfiguration: {
            zooniverse_id: externalId,
            metadata: subject.metadata,
            source: "Zooniverse Galaxy Zoo"
          }
        }
      });

      console.log(`✅ Imported Galaxy ${externalId}`);
    }

    console.log("✨ Import completed successfully!");
  } catch (error) {
    console.error("❌ Error importing subjects:", error);
  } finally {
    await prisma.$disconnect();
  }
}

importGalaxyZooSubjects();
