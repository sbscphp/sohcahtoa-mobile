import { render } from '@testing-library/react-native';
import React from 'react';
import ProgressBar from '../components/ProgressBar';
import { Colors } from '../constants/theme';

// Unmock the component so we can test the real implementation
jest.unmock('../components/ProgressBar');

describe('ProgressBar', () => {
    it('renders the correct number of segments', () => {
        const { getAllByTestId } = render(<ProgressBar totalSteps={5} />);
        expect(getAllByTestId(/progress-segment-/).length).toBe(5);
    });

    it('marks correct segments as active based on step', () => {
        const { getByTestId } = render(<ProgressBar totalSteps={3} step={2} />);

        // Step 2 means index 0 and 1 are active, index 2 is inactive.
        expect(getByTestId('progress-segment-0').props.style).toContainEqual(
            expect.objectContaining({ backgroundColor: Colors.light.primary })
        );
        expect(getByTestId('progress-segment-1').props.style).toContainEqual(
            expect.objectContaining({ backgroundColor: Colors.light.primary })
        );
        expect(getByTestId('progress-segment-2').props.style).toContainEqual(
            expect.objectContaining({ backgroundColor: '#E2E8F0' })
        );
    });
});
