import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '../components/PasswordInput';

describe('PasswordInput', () => {
  it('renders with type="password" by default', () => {
    render(<PasswordInput id="pw" label="Password" value="" onChange={() => {}} />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('reveals the password when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="pw" label="Password" value="secret123" onChange={() => {}} />);

    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input.type).toBe('password');
    await user.click(toggleButton);
    expect(input.type).toBe('text');

    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await user.click(hideButton);
    expect(input.type).toBe('password');
  });
});
