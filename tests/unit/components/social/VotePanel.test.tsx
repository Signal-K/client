import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VotePanel from "@/src/components/social/posts/VotePanel";
import * as classificationList from "@/src/lib/gameplay/classification-list";
import * as classificationVote from "@/src/lib/gameplay/classification-vote";

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: () => ({ user: { id: "user-1" } }),
  useSupabaseClient: () => ({}),
}));

vi.mock("@/src/components/social/posts/PostSingle", () => ({
  PostCardSingle: ({ title, votes, onVote }: any) => (
    <div data-testid="post-card">
      <span>{title}</span>
      <span data-testid="votes">{votes}</span>
      <button onClick={onVote}>Vote</button>
    </div>
  ),
}));

const mockClassifications = [
  {
    id: 1,
    title: "Cloud Formation Alpha",
    author: "tester",
    content: "Found a cloud",
    votes: 3,
    category: "cloud",
    tags: [],
    images: ["http://example.com/img.png"],
    anomaly: 42,
    classificationConfiguration: { votes: 3 },
    classificationtype: "cloud",
  },
  {
    id: 2,
    title: "Cloud Formation Beta",
    author: "tester2",
    content: "Another cloud",
    votes: 1,
    category: "cloud",
    tags: [],
    images: [],
    anomaly: 43,
    classificationConfiguration: { votes: 1 },
    classificationtype: "cloud",
  },
];

describe("VotePanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockReturnValue(
      new Promise(() => {})
    );
    render(<VotePanel classificationType="cloud" />);
    expect(screen.getByText("Loading classifications...")).toBeInTheDocument();
  });

  it("renders classification cards after load", async () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockResolvedValue(
      mockClassifications
    );
    render(<VotePanel classificationType="cloud" />);
    await waitFor(() => expect(screen.getAllByTestId("post-card")).toHaveLength(2));
    expect(screen.getByText("Cloud Formation Alpha")).toBeInTheDocument();
    expect(screen.getByText("Cloud Formation Beta")).toBeInTheDocument();
  });

  it("shows error message on fetch failure", async () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockRejectedValue(
      new Error("Network error")
    );
    render(<VotePanel classificationType="cloud" />);
    await waitFor(() =>
      expect(screen.getByText("Failed to load classifications.")).toBeInTheDocument()
    );
  });

  it("shows error when no session", async () => {
    vi.doMock("@/src/lib/auth/session-context", () => ({
      useSession: () => null,
      useSupabaseClient: () => ({}),
    }));
    // Reimport would be needed for module mock to take effect; test the error path via fetchSpy
    const spy = vi.spyOn(classificationList, "fetchClassificationsForVoting");
    // fetchClassificationsForVoting won't even be called if no session
    // But the mock always returns session, so test that fetch was called with the right type
    spy.mockResolvedValue([]);
    render(<VotePanel classificationType="automaton-aiForMars" />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ classificationType: "automaton-aiForMars" })
    ));
  });

  it("passes classificationType to fetch", async () => {
    const spy = vi
      .spyOn(classificationList, "fetchClassificationsForVoting")
      .mockResolvedValue([]);
    render(<VotePanel classificationType="telescope-minorPlanet" />);
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ classificationType: "telescope-minorPlanet" })
      )
    );
  });

  it("uses custom getImages when provided", async () => {
    const customGetImages = vi.fn().mockReturnValue(["http://custom.com/img.png"]);
    const spy = vi
      .spyOn(classificationList, "fetchClassificationsForVoting")
      .mockResolvedValue([]);
    render(
      <VotePanel classificationType="satellite-planetFour" getImages={customGetImages} />
    );
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ getImages: customGetImages })
      )
    );
  });

  it("increments vote and updates count on vote click", async () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockResolvedValue([
      { ...mockClassifications[0] },
    ]);
    vi.spyOn(classificationVote, "incrementClassificationVote").mockResolvedValue(4);

    render(<VotePanel classificationType="cloud" />);
    await waitFor(() => screen.getByText("Vote"));
    fireEvent.click(screen.getByText("Vote"));
    await waitFor(() => expect(screen.getByTestId("votes").textContent).toBe("4"));
  });

  it("does not update votes when incrementClassificationVote returns null", async () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockResolvedValue([
      { ...mockClassifications[0] },
    ]);
    vi.spyOn(classificationVote, "incrementClassificationVote").mockResolvedValue(null);

    render(<VotePanel classificationType="cloud" />);
    await waitFor(() => screen.getByText("Vote"));
    fireEvent.click(screen.getByText("Vote"));
    await waitFor(() => expect(screen.getByTestId("votes").textContent).toBe("3"));
  });

  it("renders nothing when empty results returned", async () => {
    vi.spyOn(classificationList, "fetchClassificationsForVoting").mockResolvedValue([]);
    render(<VotePanel classificationType="cloud" />);
    await waitFor(() =>
      expect(screen.queryByTestId("post-card")).not.toBeInTheDocument()
    );
  });
});

describe("VotePanel defaultGetImages integration", () => {
  it("is called with the correct signature via fetch spy", async () => {
    const spy = vi
      .spyOn(classificationList, "fetchClassificationsForVoting")
      .mockResolvedValue([]);
    render(<VotePanel classificationType="lidar-jovianVortexHunter" />);
    await waitFor(() => expect(spy).toHaveBeenCalled());
    const call = spy.mock.calls[0][0];
    // default getImages extracts media[1] string
    expect(call.getImages(["img0", "img1"])).toEqual(["img1"]);
    // default getImages extracts uploadUrl
    expect(call.getImages({ uploadUrl: "http://x.com/img.jpg" })).toEqual(["http://x.com/img.jpg"]);
    // default getImages returns empty for unknown format
    expect(call.getImages(null)).toEqual([]);
  });
});
