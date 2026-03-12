import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SelectionCard from '../components/SelectionCard';

// Unmock the component so we can test the real implementation
jest.unmock('../components/SelectionCard');

describe('SelectionCard', () => {
    const defaultProps = {
        title: 'Test Title',
        description: 'Test Description',
        iconSource: { uri: 'https://example.com/icon.png' },
        selected: false,
        onPress: jest.fn(),
    };

    it('renders the title and description correctly', () => {
        const { getByText } = render(<SelectionCard {...defaultProps} />);
        expect(getByText('Test Title')).toBeTruthy();
        expect(getByText('Test Description')).toBeTruthy();
    });

    it('calls onPress when the card is pressed', () => {
        const { getByRole } = render(<SelectionCard {...defaultProps} />);
        fireEvent.press(getByRole('button'));
        expect(defaultProps.onPress).toHaveBeenCalled();
    });

    it('renders selected style correctly', () => {
        const { getByRole } = render(<SelectionCard {...defaultProps} selected={true} />);
        const card = getByRole('button');
        // Check for accessibility state
        expect(card.props.accessibilityState.selected).toBe(true);
    });

    it('renders the icon correctly when it is a source object', () => {
        const { getByRole } = render(<SelectionCard {...defaultProps} />);
        // Basically checking it doesn't crash and renders the Image mock
    });

    it('renders the icon correctly when it is an SVG component', () => {
        const MockSvg = () => <React.Fragment />;
        MockSvg.$$typeof = Symbol.for('react.element'); // Shallow check for component

        const { render: renderLocal } = require('@testing-library/react-native');
        const { } = renderLocal(<SelectionCard {...defaultProps} iconSource={MockSvg} />);
    });
});
