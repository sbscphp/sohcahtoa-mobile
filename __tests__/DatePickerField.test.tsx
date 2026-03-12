import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import DatePickerField from '../components/DatePickerField';

// Unmock the component
jest.unmock('../components/DatePickerField');

describe('DatePickerField', () => {
    const defaultProps = {
        label: 'Date of Birth',
        value: '01/01/1990',
        onDateChange: jest.fn(),
    };

    it('renders the label and current value', () => {
        const { getByText } = render(<DatePickerField {...defaultProps} />);
        expect(getByText('Date of Birth')).toBeTruthy();
        expect(getByText('01/01/1990')).toBeTruthy();
    });

    it('opens the picker when pressed', () => {
        const { getByText, queryByTestId } = render(<DatePickerField {...defaultProps} />);
        fireEvent.press(getByText('01/01/1990'));

        // On iOS, it should show the Modal with DateTimePicker
        if (Platform.OS === 'ios') {
            expect(getByText('Confirm')).toBeTruthy();
        }
    });

    it('calls onDateChange when a date is selected (Android)', () => {
        Platform.OS = 'android';
        const { getByText } = render(<DatePickerField {...defaultProps} />);
        fireEvent.press(getByText('01/01/1990'));

        // DateTimePicker mock has a "Change Date" button that triggers onChange
        fireEvent.press(getByText('Change Date'));
        expect(defaultProps.onDateChange).toHaveBeenCalled();
        Platform.OS = 'ios'; // Reset
    });
});
