import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import TimePickerField from '../components/TimePickerField';

// Unmock the component
jest.unmock('../components/TimePickerField');

describe('TimePickerField', () => {
    const defaultProps = {
        label: 'Start Time',
        value: '09:00',
        onTimeChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the label and current value', () => {
        const { getByText } = render(<TimePickerField {...defaultProps} />);
        expect(getByText('Start Time')).toBeTruthy();
        expect(getByText('09:00')).toBeTruthy();
    });

    it('opens the picker and calls onTimeChange on Android', async () => {
        Platform.OS = 'android';
        const { getByText, queryByText } = render(<TimePickerField {...defaultProps} />);

        fireEvent.press(getByText('09:00'));

        // Android renders DateTimePicker directly
        // Our mock has a "Change Date" button
        fireEvent.press(getByText('Change Date'));

        expect(defaultProps.onTimeChange).toHaveBeenCalled();
        Platform.OS = 'ios'; // Reset
    });

    it('opens the picker and confirms on iOS', () => {
        Platform.OS = 'ios';
        const { getByText, getAllByText } = render(<TimePickerField {...defaultProps} />);

        fireEvent.press(getByText('09:00'));

        // Modal with title and buttons should be visible
        expect(getAllByText('Start Time').length).toBeGreaterThan(0);
        expect(getByText('Confirm')).toBeTruthy();

        fireEvent.press(getByText('Change Date'));
        fireEvent.press(getByText('Confirm'));

        expect(defaultProps.onTimeChange).toHaveBeenCalled();
    });

    it('closes the picker when cancel is pressed (iOS)', () => {
        Platform.OS = 'ios';
        const { getByText, queryByText } = render(<TimePickerField {...defaultProps} />);
        fireEvent.press(getByText('09:00'));

        fireEvent.press(getByText('Cancel'));
        expect(queryByText('Confirm')).toBeNull();
    });
});
