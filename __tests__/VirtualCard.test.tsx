import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VirtualCard from '../components/VirtualCard';

describe('VirtualCard Component', () => {
    it('renders card details unhidden by default and toggles visibility on eye icon press', () => {
        const { getByText, getAllByText, queryByText, getByLabelText } = render(
            <VirtualCard
                name="John Doe"
                balance="$5,000.00"
                last4Digits="7093"
                expiry="08/27"
            />
        );

        // Initially unhidden
        expect(getByText('7093')).toBeTruthy();
        expect(getByText('$5,000.00')).toBeTruthy();
        expect(getByText('08/27')).toBeTruthy();

        // Tap eye toggle to hide
        const eyeBtn = getByLabelText('Hide card details');
        fireEvent.press(eyeBtn);

        // Should now be masked
        expect(queryByText('7093')).toBeNull();
        expect(queryByText('$5,000.00')).toBeNull();
        expect(queryByText('08/27')).toBeNull();
        expect(getAllByText('••••')).toHaveLength(2);
        expect(getByText('••/••')).toBeTruthy();

        // Tap eye toggle to show again
        const showBtn = getByLabelText('Show card details');
        fireEvent.press(showBtn);

        expect(getByText('7093')).toBeTruthy();
        expect(getByText('$5,000.00')).toBeTruthy();
        expect(getByText('08/27')).toBeTruthy();
    });
});
