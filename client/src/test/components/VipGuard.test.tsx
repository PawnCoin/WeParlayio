import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VipGuard } from '@/components/access/VipGuard';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the TierUpgradePrompt component
vi.mock('@/components/TierUpgradePrompt', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tier-upgrade-prompt">{children}</div>
  ),
}));

describe('VipGuard', () => {
  const mockUseAuth = vi.mocked(require('@/hooks/useAuth').useAuth);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children for users with sufficient tier', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tier: 'silver' },
      isAuthenticated: true,
    });

    render(
      <VipGuard requiredTier="silver">
        <div data-testid="protected-content">Protected Content</div>
      </VipGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('tier-upgrade-prompt')).not.toBeInTheDocument();
  });

  it('shows upgrade prompt for users with insufficient tier', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tier: 'bronze' },
      isAuthenticated: true,
    });

    render(
      <VipGuard requiredTier="silver">
        <div data-testid="protected-content">Protected Content</div>
      </VipGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('tier-upgrade-prompt')).toBeInTheDocument();
  });

  it('shows upgrade prompt for unauthenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(
      <VipGuard requiredTier="silver">
        <div data-testid="protected-content">Protected Content</div>
      </VipGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('tier-upgrade-prompt')).toBeInTheDocument();
  });

  it('handles gold tier requirements correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tier: 'silver' },
      isAuthenticated: true,
    });

    render(
      <VipGuard requiredTier="gold">
        <div data-testid="protected-content">Protected Content</div>
      </VipGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('tier-upgrade-prompt')).toBeInTheDocument();
  });

  it('allows platinum users access to all tiers', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', tier: 'platinum' },
      isAuthenticated: true,
    });

    render(
      <VipGuard requiredTier="gold">
        <div data-testid="protected-content">Protected Content</div>
      </VipGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('tier-upgrade-prompt')).not.toBeInTheDocument();
  });
});