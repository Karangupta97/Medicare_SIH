import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OtpInput from "../OtpInput";

describe("OtpInput countdown + submit behavior", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("counts down to expiry and enables resend only when expired", () => {
    const onResend = vi.fn();
    // 3 seconds from now.
    const expiresAt = Date.now() + 3000;
    render(<OtpInput expiresAt={expiresAt} loading={false} onSubmit={vi.fn()} onResend={onResend} />);

    // Initially shows a countdown and resend is disabled (not expired).
    expect(screen.getByText(/Code expires in/i)).toBeInTheDocument();
    const resendBtn = screen.getByRole("button", { name: /resend/i });
    expect(resendBtn).toBeDisabled();

    // Advance past expiry.
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend otp/i })).toBeEnabled();
  });

  it("submits the 6-digit code then clears it from state", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OtpInput expiresAt={Date.now() + 60000} loading={false} onSubmit={onSubmit} onResend={vi.fn()} />);

    const boxes = screen.getAllByLabelText(/OTP digit/i);
    for (let i = 0; i < 6; i++) {
      await user.type(boxes[i], String(i + 1));
    }
    await user.click(screen.getByRole("button", { name: /verify otp/i }));
    expect(onSubmit).toHaveBeenCalledWith("123456");

    // After submit the boxes are cleared (OTP not retained in state).
    screen.getAllByLabelText(/OTP digit/i).forEach((b) => expect(b.value).toBe(""));
  });

  it("shows attempts-left and a under-process status note when provided", () => {
    render(
      <OtpInput
        expiresAt={Date.now() + 60000}
        attemptsLeft={2}
        loading={false}
        onSubmit={vi.fn()}
        onResend={vi.fn()}
        statusNote="Still processing — you can retry in a moment."
      />
    );
    expect(screen.getByText(/2 attempt\(s\) left/i)).toBeInTheDocument();
    expect(screen.getByText(/still processing/i)).toBeInTheDocument();
  });
});
