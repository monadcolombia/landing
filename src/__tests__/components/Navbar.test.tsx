import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import { primaryCta } from "@/lib/constants";

describe("Navbar", () => {
  it("renders the Monad logo and text", () => {
    render(<Navbar />);

    expect(screen.getByText("MONAD")).toBeInTheDocument();
    expect(screen.getByText("TOUR")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Navbar />);

    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByText("Explorar")).toBeInTheDocument();
    expect(screen.getByText("Aliados")).toBeInTheDocument();
  });

  it("renders the primary call to action", () => {
    render(<Navbar />);

    const { label, href } = primaryCta();
    const buttons = screen.getAllByText(label);
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0].closest("a")?.getAttribute("href")).toBe(href);
  });
});
