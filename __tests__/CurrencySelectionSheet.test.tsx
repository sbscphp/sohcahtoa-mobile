import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CurrencySelectionSheet from '../components/CurrencySelectionSheet';

// Unmock the component
jest.unmock('../components/CurrencySelectionSheet');

describe('CurrencySelectionSheet', () => {
    const defaultProps = {
        visible: true,
        onClose: jest.fn(),
        onSelect: jest.fn(),
        selectedCurrency: 'USD',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders title, search input, and popular currencies when visible', () => {
        const { getAllByText, getByText, getByPlaceholderText } = render(<CurrencySelectionSheet {...defaultProps} />);
        expect(getAllByText('Select Currency').length).toBeGreaterThanOrEqual(2);
        expect(getByText('Select an option below')).toBeTruthy();
        expect(getByPlaceholderText('Enter key word')).toBeTruthy();
        expect(getByText('United States • Dollar')).toBeTruthy();
        expect(getByText('Nigeria • Naira')).toBeTruthy();
    });

    it('filters currencies based on search query', () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<CurrencySelectionSheet {...defaultProps} />);
        const input = getByPlaceholderText('Enter key word');

        fireEvent.changeText(input, 'euro');
        expect(getByText('European Union • Euro')).toBeTruthy();
        expect(queryByText('United States • Dollar')).toBeNull();
    });

    it('calls onSelect and onClose when currency is selected and confirmed', () => {
        const { getByText, getAllByText } = render(<CurrencySelectionSheet {...defaultProps} />);
        fireEvent.press(getByText('Nigeria • Naira'));

        const confirmButtons = getAllByText('Select Currency');
        // The second one is the button (first is the title)
        fireEvent.press(confirmButtons[1]);

        expect(defaultProps.onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ code: 'NGN' })
        );
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when "No, Close" is pressed', () => {
        const { getByText } = render(<CurrencySelectionSheet {...defaultProps} />);
        fireEvent.press(getByText('No, Close'));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
