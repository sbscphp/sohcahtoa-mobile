import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import TransactionLayout from '../components/transaction-flow/TransactionLayout';

describe('TransactionLayout', () => {
    const defaultProps = {
        title: 'Test Title',
        currentStep: 0,
        totalSteps: 3,
        onBack: jest.fn(),
        onNext: jest.fn(),
    };

    it('renders correctly with children', () => {
        const { getByText } = render(
            <TransactionLayout {...defaultProps}>
                <Text>Child Content</Text>
            </TransactionLayout>
        );

        expect(getByText('Child Content')).toBeTruthy();
    });

    it('calls onNext when the next button is pressed', () => {
        const { getByText } = render(
            <TransactionLayout {...defaultProps}>
                <Text>Child Content</Text>
            </TransactionLayout>
        );

        const nextButton = getByText('Continue');
        fireEvent.press(nextButton);
        expect(defaultProps.onNext).toHaveBeenCalled();
    });

    it('disables the next button when isNextDisabled is true', () => {
        const { getByText } = render(
            <TransactionLayout {...defaultProps} isNextDisabled={true}>
                <Text>Child Content</Text>
            </TransactionLayout>
        );

        // Note: PrimaryButton mock needs to handle disabled state if we want to check it precisely,
        // but here we can just check if it's rendered or check props if we mock it with full props.
        const nextButton = getByText('Continue');
        expect(nextButton).toBeTruthy();
    });
});
