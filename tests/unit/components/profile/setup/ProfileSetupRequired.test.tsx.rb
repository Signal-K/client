import { vi, describe, it, expect } from 'vitest'
import { render } from '../../../../utils/test-utils'
import { screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import ProfileSetupRequired from '@/src/components/profile/setup/ProfileSetupRequired'

describe('ProfileSetupRequired', () => {
  it('renders setup required message', () => {
    const mockOnOpen = vi.fn()
    
    render(<ProfileSetupRequired onOpenProfileModal={mockOnOpen} />)
    
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument()
  })

  it('calls onOpenProfileModal when setup button clicked', () => {
    const mockOnOpen = vi.fn()
    
    render(<ProfileSetupRequired onOpenProfileModal={mockOnOpen} />)
    
    const setupButton = screen.getByRole('button', { name: /set up profile/i })
    fireEvent.click(setupButton)
    
    expect(mockOnOpen).toHaveBeenCalledTimes(1)
  })
})