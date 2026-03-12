import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import PrimaryButton from '../components/PrimaryButton';

// Unmock the component so we can test the real implementation
jest.unmock('../components/PrimaryButton');

describe('PrimaryButton', () => {
    it('renders the title correctly', () => {
        const { getByText } = render(
            <PrimaryButton title="Click Me" onPress={() => { }} />
        );
        expect(getByText('Click Me')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPress = jest.fn();
        const { getByText } = render(
            <PrimaryButton title="Click Me" onPress={onPress} />
        );
        fireEvent.press(getByText('Click Me'));
        expect(onPress).toHaveBeenCalled();
    });

    it('is disabled when the disabled prop is true', () => {
        const onPress = jest.fn();
        const { getByRole } = render(
            <PrimaryButton title="Click Me" onPress={onPress} disabled={true} />
        );
        const button = getByRole('button');
        fireEvent.press(button);
        expect(onPress).not.toHaveBeenCalled();
    });

    it('shows loading indicator and is disabled when loading is true', () => {
        const onPress = jest.fn();
        const { queryByText, getByRole } = render(
            <PrimaryButton title="Click Me" onPress={onPress} loading={true} />
        );

        // Title should not be visible when loading
        expect(queryByText('Click Me')).toBeNull();

        const button = getByRole('button');
        fireEvent.press(button);
        expect(onPress).not.toHaveBeenCalled();
    });
});
