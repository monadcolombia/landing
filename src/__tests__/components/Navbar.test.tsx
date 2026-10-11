import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

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

  it("renders register button", () => {
    render(<Navbar />);

    const registerButtons = screen.getAllByText("Regístrate");
    expect(registerButtons.length).toBeGreaterThan(0);
  });
});
