import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ControlledInput from '../components/ControlledInput';

// Unmock the component
jest.unmock('../components/ControlledInput');
jest.unmock('../components/InputField');

let mockOnChange = jest.fn();

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
    Controller: ({ render, name, control }: any) => {
        const field = {
            onChange: mockOnChange,
            onBlur: jest.fn(),
            value: '',
        };
        const fieldState = { error: null };
        return render({ field, fieldState });
    },
}));

describe('ControlledInput', () => {
    beforeEach(() => {
        mockOnChange.mockClear();
    });

    const defaultProps = {
        name: 'test',
        control: {} as any,
        label: 'Test Label',
        placeholder: 'Enter text',
    };

    it('renders the InputField with correct title', () => {
        const { getByText } = render(<ControlledInput {...defaultProps} />);
        expect(getByText(/Test Label/)).toBeTruthy();
    });

    it('filters numeric input correctly', () => {
        const { getByPlaceholderText } = render(
            <ControlledInput {...defaultProps} filterType="numeric" />
        );

        fireEvent.changeText(getByPlaceholderText('Enter text'), '123abc456');
        expect(mockOnChange).toHaveBeenCalledWith('123456');
    });

    it('filters alphanumeric input correctly', () => {
        const { getByPlaceholderText } = render(
            <ControlledInput {...defaultProps} filterType="alphanumeric" />
        );

        fireEvent.changeText(getByPlaceholderText('Enter text'), 'abc!@#123');
        expect(mockOnChange).toHaveBeenCalledWith('abc123');
    });

    it('does not filter if filterType is none', () => {
        const { getByPlaceholderText } = render(
            <ControlledInput {...defaultProps} filterType="none" />
        );

        fireEvent.changeText(getByPlaceholderText('Enter text'), 'abc!@#123');
        expect(mockOnChange).toHaveBeenCalledWith('abc!@#123');
    });
});
