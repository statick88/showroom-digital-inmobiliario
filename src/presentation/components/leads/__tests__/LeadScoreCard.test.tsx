import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeadScoreCard } from "../LeadScoreCard";

describe("LeadScoreCard (PR-3) — score display", () => {
  const baseBreakdown = { views: 3, clicks: 2, time: 60, repeats: 1 };

  it("renders the numeric score", () => {
    render(<LeadScoreCard score={75} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("renders 'Alto' label for score 61-100 (green)", () => {
    render(<LeadScoreCard score={85} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Alto")).toBeInTheDocument();
  });

  it("renders 'Medio' label for score 31-60 (yellow)", () => {
    render(<LeadScoreCard score={45} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("renders 'Bajo' label for score 0-30 (red)", () => {
    render(<LeadScoreCard score={20} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Bajo")).toBeInTheDocument();
  });

  it("renders breakdown details: views, clicks, time, repeats", () => {
    render(<LeadScoreCard score={50} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("3")).toBeInTheDocument(); // views
    expect(screen.getByText("2")).toBeInTheDocument(); // clicks
    expect(screen.getByText("60s")).toBeInTheDocument(); // time
    expect(screen.getByText("1")).toBeInTheDocument(); // repeats
  });

  it("renders score of 0 as 'Bajo'", () => {
    render(<LeadScoreCard score={0} breakdown={{ views: 0, clicks: 0, time: 0, repeats: 0 }} visitorId="v1" />);
    expect(screen.getByTestId("score-value")).toHaveTextContent("0");
    expect(screen.getByText("Bajo")).toBeInTheDocument();
  });

  it("renders score of 100 as 'Alto'", () => {
    render(<LeadScoreCard score={100} breakdown={{ views: 10, clicks: 4, time: 120, repeats: 3 }} visitorId="v1" />);
    expect(screen.getByTestId("score-value")).toHaveTextContent("100");
    expect(screen.getByText("Alto")).toBeInTheDocument();
  });

  it("renders boundary score 30 as 'Bajo'", () => {
    render(<LeadScoreCard score={30} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Bajo")).toBeInTheDocument();
  });

  it("renders boundary score 31 as 'Medio'", () => {
    render(<LeadScoreCard score={31} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("renders boundary score 60 as 'Medio'", () => {
    render(<LeadScoreCard score={60} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Medio")).toBeInTheDocument();
  });

  it("renders boundary score 61 as 'Alto'", () => {
    render(<LeadScoreCard score={61} breakdown={baseBreakdown} visitorId="v1" />);
    expect(screen.getByText("Alto")).toBeInTheDocument();
  });
});
