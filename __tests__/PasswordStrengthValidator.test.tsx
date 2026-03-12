import { render } from '@testing-library/react-native';
import React from 'react';
import PasswordStrengthValidator, { validatePassword } from '../components/PasswordStrengthValidator';

// Unmock the component
jest.unmock('../components/PasswordStrengthValidator');

describe('PasswordStrengthValidator Logic', () => {
    it('validates minimum length', () => {
        expect(validatePassword('abc').hasMinLength).toBe(false);
        expect(validatePassword('abcdefgh').hasMinLength).toBe(true);
    });

    it('validates uppercase', () => {
        expect(validatePassword('abc').hasUppercase).toBe(false);
        expect(validatePassword('Abc').hasUppercase).toBe(true);
    });

    it('validates lowercase', () => {
        expect(validatePassword('ABC').hasLowercase).toBe(false);
        expect(validatePassword('aBC').hasLowercase).toBe(true);
    });

    it('validates numbers', () => {
        expect(validatePassword('abc').hasNumber).toBe(false);
        expect(validatePassword('abc1').hasNumber).toBe(true);
    });

    it('validates special characters', () => {
        expect(validatePassword('abc').hasSpecialChar).toBe(false);
        expect(validatePassword('abc!').hasSpecialChar).toBe(true);
    });
});

describe('PasswordStrengthValidator Component', () => {
    it('renders all validation items', () => {
        const { getByText } = render(<PasswordStrengthValidator password="pass" />);
        expect(getByText('Minimum 8 of character long')).toBeTruthy();
        expect(getByText('One uppercase letter')).toBeTruthy();
        expect(getByText('One lowercase letter')).toBeTruthy();
        expect(getByText('One number 0-9')).toBeTruthy();
        expect(getByText('One special charater (!@#$%^&*+-?)')).toBeTruthy();
    });
});
