import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DiskDetectiveResults } from "@/src/components/projects/(classifications)/results/DiskDetectiveResults";

const baseClassification = {
  classificationtype: "diskDetective",
  classificationConfiguration: {
    interpretation: {
      category: "Disk Candidate",
      objectType: "Protoplanetary Disk",
      confidence: "High",
      discovery: "You found a disk around a young star.",
      description: "A circumstellar disk of gas and dust.",
      scientificValue: "Helps understand planet formation.",
    },
    selectedOptions: ["Round", "Smooth"],
    comments: "Looks interesting",
    imageCount: 8,
  },
};

describe("DiskDetectiveResults", () => {
  it("returns null when classificationtype is not diskDetective", () => {
    const { container } = render(
      <DiskDetectiveResults classification={{ classificationtype: "planet" }} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when classificationConfiguration is missing", () => {
    const { container } = render(
      <DiskDetectiveResults
        classification={{ classificationtype: "diskDetective" }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders discovery analysis heading", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(screen.getByText("🔍 Discovery Analysis")).toBeInTheDocument();
  });

  it("renders objectType and confidence from interpretation", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(screen.getByText("Protoplanetary Disk")).toBeInTheDocument();
    expect(screen.getByText("Confidence: High")).toBeInTheDocument();
  });

  it("renders discovery and description text", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(
      screen.getByText("You found a disk around a young star.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("A circumstellar disk of gas and dust.")
    ).toBeInTheDocument();
  });

  it("renders scientific value section", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(
      screen.getByText("Helps understand planet formation.")
    ).toBeInTheDocument();
  });

  it("renders selected characteristics in technical details", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(screen.getByText("Round")).toBeInTheDocument();
    expect(screen.getByText("Smooth")).toBeInTheDocument();
  });

  it("renders user comments in technical details", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(screen.getByText(/"Looks interesting"/)).toBeInTheDocument();
  });

  it("renders image count in technical details", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    expect(screen.getByText("Analyzed 8 survey images")).toBeInTheDocument();
  });

  it("applies green styling for Disk Candidate category", () => {
    render(<DiskDetectiveResults classification={baseClassification} />);
    const badge = screen.getByText("Protoplanetary Disk");
    expect(badge.className).toContain("green");
  });

  it("applies gray styling for Unclassified Object category", () => {
    const classification = {
      ...baseClassification,
      classificationConfiguration: {
        ...baseClassification.classificationConfiguration,
        interpretation: {
          ...baseClassification.classificationConfiguration.interpretation,
          category: "Unclassified Object",
        },
      },
    };
    render(<DiskDetectiveResults classification={classification} />);
    const badge = screen.getByText("Protoplanetary Disk");
    expect(badge.className).toContain("gray");
  });

  it("applies blue styling for other categories", () => {
    const classification = {
      ...baseClassification,
      classificationConfiguration: {
        ...baseClassification.classificationConfiguration,
        interpretation: {
          ...baseClassification.classificationConfiguration.interpretation,
          category: "Background Star",
        },
      },
    };
    render(<DiskDetectiveResults classification={classification} />);
    const badge = screen.getByText("Protoplanetary Disk");
    expect(badge.className).toContain("blue");
  });

  it("renders without optional fields (selectedOptions, comments, imageCount)", () => {
    const classification = {
      classificationtype: "diskDetective",
      classificationConfiguration: {
        interpretation: {
          category: "Disk Candidate",
          objectType: "Disk",
          confidence: "Medium",
          discovery: "Something found.",
          description: "A description.",
          scientificValue: "Important.",
        },
      },
    };
    render(<DiskDetectiveResults classification={classification} />);
    expect(screen.getByText("Disk")).toBeInTheDocument();
  });

  it("renders without interpretation", () => {
    const classification = {
      classificationtype: "diskDetective",
      classificationConfiguration: {
        selectedOptions: ["Round"],
      },
    };
    render(<DiskDetectiveResults classification={classification} />);
    expect(screen.getByText("🔍 Discovery Analysis")).toBeInTheDocument();
    expect(screen.queryByText("Confidence:")).not.toBeInTheDocument();
  });
});
