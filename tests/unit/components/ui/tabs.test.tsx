import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

describe("Tabs", () => {
  it("renders tabs with trigger and content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Tab One")).toBeInTheDocument();
    expect(screen.getByText("Tab Two")).toBeInTheDocument();
  });

  it("shows the default tab content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Content One")).toBeInTheDocument();
  });

  it("inactive trigger has aria-selected false", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
          <TabsTrigger value="tab2">Tab Two</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
        <TabsContent value="tab2">Content Two</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "Tab Two" })).toHaveAttribute("aria-selected", "false");
  });

  it("applies custom className to TabsList", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList className="custom-list">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A Content</TabsContent>
      </Tabs>
    );
    const list = screen.getByRole("tablist");
    expect(list.className).toContain("custom-list");
  });

  it("active trigger has aria-selected true", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab One</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content One</TabsContent>
      </Tabs>
    );
    expect(screen.getByRole("tab", { name: "Tab One" })).toHaveAttribute("aria-selected", "true");
  });
});
