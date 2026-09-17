import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PinPad from "../PinPad";

async function enterPin(user, pin) {
  for (const d of pin.split("")) {
    await user.click(screen.getByRole("button", { name: `Digit ${d}` }));
  }
}

describe("PinPad set mode (two-step, UPI-style)", () => {
  it("rejects a weak PIN before advancing to confirm", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PinPad mode="set" onSubmit={onSubmit} />);

    await enterPin(user, "123456"); // sequential → weak
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/sequential/i);
    });
    // Still on the first step, nothing submitted.
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/set your 6-digit pin/i)).toBeInTheDocument();
  });

  it("errors on mismatch at the confirm step and resets", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PinPad mode="set" onSubmit={onSubmit} />);

    await enterPin(user, "428173"); // valid → advances to confirm
    await waitFor(() => expect(screen.getByText(/confirm your pin/i)).toBeInTheDocument());

    await enterPin(user, "428179"); // mismatch
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/don't match/i);
    });
    expect(onSubmit).not.toHaveBeenCalled();
    // Reset back to the first step.
    expect(screen.getByText(/set your 6-digit pin/i)).toBeInTheDocument();
  });

  it("submits when both entries match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PinPad mode="set" onSubmit={onSubmit} />);

    await enterPin(user, "428173");
    await waitFor(() => expect(screen.getByText(/confirm your pin/i)).toBeInTheDocument());
    await enterPin(user, "428173");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("428173"));
  });
});

describe("PinPad physical keyboard / numpad support", () => {
  it("accepts digits typed on the hardware keyboard and submits (enter mode)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PinPad mode="enter" onSubmit={onSubmit} />);

    // Type 6 digits via the keyboard (covers top-row and numpad — same e.key).
    await user.keyboard("428173");
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("428173"));
  });

  it("Backspace deletes the last digit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<PinPad mode="enter" onSubmit={onSubmit} />);

    await user.keyboard("4281");
    await user.keyboard("{Backspace}"); // -> 428
    await user.keyboard("73"); // -> 42873 (5 digits, not yet submitted)
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard("9"); // -> 428739 (6 digits, submits)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("428739"));
  });
});
