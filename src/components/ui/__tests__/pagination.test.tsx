import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { Pagination } from "@/components/ui/pagination";

vi.mock("@/components/ui/icon", () => ({
  Icon: ({ name }: { name: string }) => <svg data-icon={name} aria-hidden="true" />,
}));

function renderPagination(
  overrides: Partial<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (p: number) => void;
  }> = {},
) {
  const onPageChange = vi.fn();
  const props = {
    currentPage: 1,
    totalPages: 3,
    totalItems: 30,
    pageSize: 10,
    onPageChange,
    ...overrides,
  };
  return { ...render(<Pagination {...props} />), onPageChange, props };
}

describe("components/ui/Pagination — pure presentational component", () => {
  it("(1) renders the from-to / totalItems summary line", () => {
    renderPagination({ currentPage: 1, pageSize: 10, totalItems: 30 });
    // from=1, to=min(1*10,30)=10, totalItems=30
    expect(screen.getByText(/Mostrando 1-10 de 30 propiedades/)).toBeInTheDocument();
  });

  it("(2) shows the correct from-to on the last page (clamped to totalItems)", () => {
    renderPagination({ currentPage: 3, totalPages: 3, pageSize: 10, totalItems: 25 });
    // from=(3-1)*10+1=21, to=min(3*10,25)=25
    expect(screen.getByText(/Mostrando 21-25 de 25 propiedades/)).toBeInTheDocument();
  });

  it("(3) renders one button per totalPage (page numbers)", () => {
    renderPagination({ totalPages: 4 });
    const buttons = screen.getAllByRole("button");
    // 1 prev + 4 page + 1 next = 6
    expect(buttons).toHaveLength(6);
  });

  it("(4) clicking a page-number button invokes onPageChange(page)", () => {
    const { onPageChange } = renderPagination({ currentPage: 1, totalPages: 3 });
    const page2Button = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Button);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("(5) clicking the prev (chevron_left) button invokes onPageChange(currentPage - 1)", () => {
    const { onPageChange } = renderPagination({ currentPage: 2, totalPages: 3 });
    // The first button in the DOM order is the prev (chevron_left)
    const prevBtn = document.querySelectorAll("button")[0]!;
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("(6) clicking the next (chevron_right) button invokes onPageChange(currentPage + 1)", () => {
    const { onPageChange } = renderPagination({ currentPage: 2, totalPages: 3 });
    const buttons = document.querySelectorAll("button");
    // The last button is the next (chevron_right)
    const nextBtn = buttons[buttons.length - 1]!;
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("(7) the prev button is disabled on the first page (currentPage <= 1)", () => {
    renderPagination({ currentPage: 1, totalPages: 3 });
    const prevButton = document.querySelectorAll("button")[0] as HTMLButtonElement;
    expect(prevButton).toBeDisabled();
  });

  it("(8) the next button is disabled on the last page (currentPage >= totalPages)", () => {
    renderPagination({ currentPage: 3, totalPages: 3 });
    const buttons = document.querySelectorAll("button");
    const nextButton = buttons[buttons.length - 1] as HTMLButtonElement;
    expect(nextButton).toBeDisabled();
  });

  it("(9) the current page button has the primary background styling (isPageActive)", () => {
    renderPagination({ currentPage: 2, totalPages: 3 });
    const page2Button = screen.getByRole("button", { name: "2" });
    // Active page: bg-primary text-primary-foreground
    expect(page2Button.className).toContain("bg-primary");
    expect(page2Button.className).toContain("text-primary-foreground");
  });

  it("(10) non-active page buttons do not have the primary background", () => {
    renderPagination({ currentPage: 1, totalPages: 3 });
    const page2Button = screen.getByRole("button", { name: "2" });
    expect(page2Button.className).not.toContain("bg-primary");
  });

  it("(11) renders the chevron_left and chevron_right icons in the prev/next buttons", () => {
    renderPagination({ currentPage: 2, totalPages: 3 });
    expect(document.querySelector('[data-icon="chevron_left"]')).toBeInTheDocument();
    expect(document.querySelector('[data-icon="chevron_right"]')).toBeInTheDocument();
  });
});
