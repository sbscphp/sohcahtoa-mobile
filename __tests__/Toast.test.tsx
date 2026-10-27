import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Toast from '../components/Toast';

describe('Toast Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders nothing when visible is false', () => {
        const { queryByTestId } = render(
            <Toast visible={false} message="Test Message" />
        );
        expect(queryByTestId('toast-card')).toBeNull();
    });

    it('renders message and default success title when visible is true', () => {
        const { getByText, getByTestId } = render(
            <Toast visible={true} message="Operation completed" type="success" />
        );

        expect(getByTestId('toast-card')).toBeTruthy();
        expect(getByText('Success')).toBeTruthy();
        expect(getByText('Operation completed')).toBeTruthy();
    });

    it('renders custom title when provided', () => {
        const { getByText } = render(
            <Toast
                visible={true}
                title="Custom Title"
                message="Custom message"
                type="warning"
            />
        );

        expect(getByText('Custom Title')).toBeTruthy();
        expect(getByText('Custom message')).toBeTruthy();
    });

    it('renders default Error title for error type', () => {
        const { getByText } = render(
            <Toast visible={true} message="Something failed" type="error" />
        );

        expect(getByText('Error')).toBeTruthy();
        expect(getByText('Something failed')).toBeTruthy();
    });

    it('auto-dismisses after the specified duration when not persistent', () => {
        const onDismiss = jest.fn();
        render(
            <Toast
                visible={true}
                message="Auto dismiss test"
                duration={2000}
                onDismiss={onDismiss}
            />
        );

        expect(onDismiss).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when persistent is true', () => {
        const onDismiss = jest.fn();
        render(
            <Toast
                visible={true}
                message="Persistent notification"
                persistent={true}
                duration={1000}
                onDismiss={onDismiss}
            />
        );

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('calls onDismiss when toast card is pressed, and does not render a close icon', () => {
        const onDismiss = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <Toast
                visible={true}
                message="Click to close"
                onDismiss={onDismiss}
            />
        );

        expect(queryByTestId('toast-dismiss-button')).toBeNull();
        fireEvent.press(getByTestId('toast-card'));
        expect(onDismiss).toHaveBeenCalled();
    });

    it('renders action button and calls callback and onDismiss when pressed', () => {
        const onActionPress = jest.fn();
        const onDismiss = jest.fn();
        const { getByText, getByTestId } = render(
            <Toast
                visible={true}
                message="Post shared to your feed"
                action={{ label: 'Undo', onPress: onActionPress }}
                onDismiss={onDismiss}
            />
        );

        expect(getByText('Undo')).toBeTruthy();
        fireEvent.press(getByTestId('toast-action-button'));
        expect(onActionPress).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalled();
    });

    it('renders at top position by default and respects bottom position', () => {
        const { getByTestId, rerender } = render(
            <Toast visible={true} message="Top Toast" />
        );
        const topOverlay = getByTestId('toast-overlay');
        expect(topOverlay.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ top: expect.any(Number) })])
        );

        rerender(<Toast visible={true} message="Bottom Toast" position="bottom" />);
        const bottomOverlay = getByTestId('toast-overlay');
        expect(bottomOverlay.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ bottom: expect.any(Number) })])
        );
    });

    it('renders with reduced card border radius (12@ms)', () => {
        const { getByTestId } = render(
            <Toast visible={true} message="Radius test" />
        );
        const card = getByTestId('toast-card');
        const flatStyle = Array.isArray(card.props.style)
            ? Object.assign({}, ...card.props.style)
            : card.props.style;
        expect(flatStyle.borderRadius).toBe('12@ms');
    });
});
