import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import TransactionViewLayout from '../components/transaction-flow/TransactionViewLayout';

describe('TransactionViewLayout', () => {
    const defaultProps = {
        title: 'View Title',
        tabs: [
            { key: 'tab1', label: 'Tab 1' },
            { key: 'tab2', label: 'Tab 2' },
        ],
        activeTab: 'tab1',
        onTabChange: jest.fn(),
        onBack: jest.fn(),
    };

    it('renders tabs correctly', () => {
        const { getByText } = render(
            <TransactionViewLayout {...defaultProps}>
                <Text>Tab 1 Content</Text>
            </TransactionViewLayout>
        );

        expect(getByText('Tab 1')).toBeTruthy();
        expect(getByText('Tab 2')).toBeTruthy();
        expect(getByText('Tab 1 Content')).toBeTruthy();
    });

    it('calls onTabChange when a tab is pressed', () => {
        const { getByText } = render(
            <TransactionViewLayout {...defaultProps}>
                <Text>Content</Text>
            </TransactionViewLayout>
        );

        fireEvent.press(getByText('Tab 2'));
        expect(defaultProps.onTabChange).toHaveBeenCalledWith('tab2');
    });

    it('renders action button when showActionButton is true', () => {
        const { getByText } = render(
            <TransactionViewLayout {...defaultProps} actionButtonTitle="Action" showActionButton={true}>
                <Text>Content</Text>
            </TransactionViewLayout>
        );

        expect(getByText('Action')).toBeTruthy();
    });

    it('calls onActionPress when action button is pressed', () => {
        const onActionPress = jest.fn();
        const { getByText } = render(
            <TransactionViewLayout {...defaultProps} actionButtonTitle="Action" onActionPress={onActionPress}>
                <Text>Content</Text>
            </TransactionViewLayout>
        );

        fireEvent.press(getByText('Action'));
        expect(onActionPress).toHaveBeenCalled();
    });
});
