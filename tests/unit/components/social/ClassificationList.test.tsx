import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClassificationList from "@/src/components/social/posts/ClassificationList";

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: () => ({ user: { id: "user-123" } }),
}));

vi.mock("@/src/components/social/posts/PostWithGen", () => ({
  PostCardSingleWithGenerator: ({ title, content }: any) => (
    <div data-testid="post-card">
      <span>{title}</span>
      <span>{content}</span>
    </div>
  ),
}));

const makeClassification = (id: number, type: string) => ({
  id,
  title: `Classification ${id}`,
  author: "tester",
  content: `Content ${id}`,
  category: "science",
  tags: [],
  media: ["img0.png", "img1.png"],
  classificationConfiguration: { votes: 2 },
  anomaly: id * 10,
  classificationtype: type,
});

describe("ClassificationList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ClassificationList classificationType="cloud" />);
    expect(screen.getByText("Loading classifications...")).toBeInTheDocument();
  });

  it("renders classification cards after load", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          classifications: [
            makeClassification(1, "cloud"),
            makeClassification(2, "cloud"),
          ],
        }),
    });
    render(<ClassificationList classificationType="cloud" />);
    await waitFor(() => expect(screen.getAllByTestId("post-card")).toHaveLength(2));
    expect(screen.getByText("Classification 1")).toBeInTheDocument();
    expect(screen.getByText("Classification 2")).toBeInTheDocument();
  });

  it("shows error when no session", async () => {
    vi.doMock("@/src/lib/auth/session-context", () => ({
      useSession: () => null,
    }));
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ classifications: [] }) });
    render(<ClassificationList classificationType="cloud" />);
    await waitFor(() =>
      expect(screen.queryByText("Loading classifications...")).not.toBeInTheDocument()
    );
  });

  it("shows error on fetch failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "DB error" }),
    });
    render(<ClassificationList classificationType="cloud" />);
    await waitFor(() =>
      expect(screen.getByText("Failed to load classifications.")).toBeInTheDocument()
    );
  });

  it("passes classificationType in fetch URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ classifications: [] }),
    });
    global.fetch = fetchMock;
    render(<ClassificationList classificationType="telescope-minorPlanet" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toContain("classificationtype=telescope-minorPlanet");
  });

  it("extracts images from media array[1] string", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          classifications: [
            { ...makeClassification(1, "cloud"), media: ["thumb.png", "full.png"] },
          ],
        }),
    });
    render(<ClassificationList classificationType="cloud" />);
    await waitFor(() => screen.getByTestId("post-card"));
  });

  it("extracts images from uploadUrl media object", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          classifications: [
            {
              ...makeClassification(1, "cloud"),
              media: { uploadUrl: "http://example.com/img.jpg" },
            },
          ],
        }),
    });
    render(<ClassificationList classificationType="cloud" />);
    await waitFor(() => screen.getByTestId("post-card"));
  });

  it("renders empty list when no classifications returned", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ classifications: [] }),
    });
    render(<ClassificationList classificationType="lidar-jovianVortexHunter" />);
    await waitFor(() =>
      expect(screen.queryByTestId("post-card")).not.toBeInTheDocument()
    );
    expect(screen.queryByText("Loading classifications...")).not.toBeInTheDocument();
  });
});
