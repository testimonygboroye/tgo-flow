import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';

vi.mock('../services/auth.service', () => ({
  loginRequest: vi.fn(() =>
    Promise.resolve({ status: 'success', user: { id: '1', name: 'Test', email: 'test@example.com' }, accessToken: 'fake-token' })
  ),
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe('Login page', () => {
  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('requires email and password before submission', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('allows typing into the email and password fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'MyPassword123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('MyPassword123');
  });

  it('shows a "Forgot password?" link', () => {
    renderLogin();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });
});
