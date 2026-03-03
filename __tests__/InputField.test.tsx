import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import InputField from '../components/InputField';

// Unmock the component so we can test the real implementation
jest.unmock('../components/InputField');

describe('InputField', () => {
    it('renders the label correctly', () => {
        const { getByText } = render(
            <InputField label="Name" value="" onChangeText={() => { }} />
        );
        expect(getByText(/Name/)).toBeTruthy();
    });

    it('shows required asterisk when required is true', () => {
        const { getByText } = render(
            <InputField label="Name" value="" onChangeText={() => { }} required={true} />
        );
        expect(getByText(/\*/)).toBeTruthy();
    });

    it('displays the error message when error prop is provided', () => {
        const { getByText } = render(
            <InputField label="Name" value="" onChangeText={() => { }} error="Invalid name" />
        );
        expect(getByText('Invalid name')).toBeTruthy();
    });

    it('calls onChangeText when the text changes', () => {
        const onChangeText = jest.fn();
        const { getByPlaceholderText } = render(
            <InputField label="Name" placeholder="Enter name" value="" onChangeText={onChangeText} />
        );

        fireEvent.changeText(getByPlaceholderText('Enter name'), 'John Doe');
        expect(onChangeText).toHaveBeenCalledWith('John Doe');
    });

    it('toggles password visibility when isPassword is true', () => {
        const { getByTestId } = render(
            <InputField label="Password" placeholder="Enter password" value="secret" onChangeText={() => { }} isPassword={true} />
        );

        const input = getByTestId('input-field');
        expect(input.props.secureTextEntry).toBe(true);

        fireEvent.press(getByTestId('password-toggle'));
        expect(input.props.secureTextEntry).toBe(false);

        fireEvent.press(getByTestId('password-toggle'));
        expect(input.props.secureTextEntry).toBe(true);
    });
});
