import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ControlledDatePicker from '../components/ControlledDatePicker';

// Unmock the component
jest.unmock('../components/ControlledDatePicker');

let mockOnChange = jest.fn();

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
    Controller: ({ render, name, control }: any) => {
        const field = {
            onChange: mockOnChange,
            value: '',
        };
        const fieldState = { error: null };
        return render({ field, fieldState });
    },
}));

// Mock DatePickerField
jest.mock('../components/DatePickerField', () => {
    const { Text, TouchableOpacity } = require('react-native');
    return ({ label, onDateChange }: any) => (
        <TouchableOpacity onPress={() => onDateChange('2025-01-01')}>
            <Text>{label}</Text>
        </TouchableOpacity>
    );
});

describe('ControlledDatePicker', () => {
    const defaultProps = {
        name: 'dob',
        control: {} as any,
        label: 'Date of Birth',
    };

    it('renders the DatePickerField with correct label', () => {
        const { getByText } = render(<ControlledDatePicker {...defaultProps} />);
        expect(getByText('Date of Birth')).toBeTruthy();
    });

    it('calls onChange from react-hook-form when date is changed', () => {
        const { getByText } = render(<ControlledDatePicker {...defaultProps} />);
        fireEvent.press(getByText('Date of Birth'));
        expect(mockOnChange).toHaveBeenCalledWith('2025-01-01');
    });
});
