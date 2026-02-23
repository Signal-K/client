import { describe, it, expect } from "vitest";
import type { RoverMission } from "@/src/types/Structures/Rover";

describe("Rover type shapes", () => {
  it("RoverMission has required fields", () => {
    const mission: RoverMission = {
      id: "rm-1",
      title: "Scan Region Alpha",
      description: "Scan for mineral deposits",
      project: "geological-survey",
      reward: "500 stardust",
      difficulty: "medium",
      completed: false,
      icon: null,
    };
    expect(mission.id).toBe("rm-1");
    expect(mission.difficulty).toBe("medium");
    expect(mission.completed).toBe(false);
  });

  it("RoverMission difficulty can be easy, medium, or hard", () => {
    const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];
    expect(difficulties).toContain("easy");
    expect(difficulties).toContain("hard");
  });

  it("completed RoverMission", () => {
    const mission: RoverMission = {
      id: "rm-2",
      title: "Complete Survey",
      description: "Done",
      project: "mineral-analysis",
      reward: "1000 stardust",
      difficulty: "hard",
      completed: true,
      icon: null,
    };
    expect(mission.completed).toBe(true);
  });
});
