import { isUrlAllowed, extractCodeAndState, ALLOWED_WEBVIEW_ORIGINS } from '@/components/NibssIgreeWebViewModal';

describe('WebView & In-App Browser Security (MASVS-PLATFORM)', () => {
    describe('isUrlAllowed origin and protocol validation', () => {
        it('allows legitimate NIBSS domains over HTTPS', () => {
            expect(isUrlAllowed('https://nibss-plc.com.ng')).toBe(true);
            expect(isUrlAllowed('https://portal.nibss-plc.com.ng/consent?sessionId=123')).toBe(true);
            expect(isUrlAllowed('https://auth.nibss-plc.com.ng/oauth/authorize')).toBe(true);
        });

        it('allows official SohCahToa backend domains over HTTPS', () => {
            expect(isUrlAllowed('https://clocksurewise.com')).toBe(true);
            expect(isUrlAllowed('https://sohcahtoa-dev.clocksurewise.com/api/callback')).toBe(true);
        });

        it('allows native deep links and internal blank navigation', () => {
            expect(isUrlAllowed('sohcahtoa://auth/callback?code=xyz')).toBe(true);
            expect(isUrlAllowed('about:blank')).toBe(true);
        });

        it('rejects unencrypted cleartext HTTP connections', () => {
            expect(isUrlAllowed('http://nibss-plc.com.ng')).toBe(false);
            expect(isUrlAllowed('http://portal.nibss-plc.com.ng')).toBe(false);
            expect(isUrlAllowed('http://sohcahtoa-dev.clocksurewise.com')).toBe(false);
        });

        it('blocks unauthorized external domains and phishing lookalikes', () => {
            expect(isUrlAllowed('https://evil.com')).toBe(false);
            expect(isUrlAllowed('https://nibss-plc.com.ng.attacker.io')).toBe(false);
            expect(isUrlAllowed('https://phishing-clocksurewise.com')).toBe(false);
            expect(isUrlAllowed('https://google.com')).toBe(false);
        });

        it('blocks dangerous protocol schemes', () => {
            expect(isUrlAllowed('javascript:alert(document.cookie)')).toBe(false);
            expect(isUrlAllowed('intent://com.attacker/payload')).toBe(false);
            expect(isUrlAllowed('file:///etc/passwd')).toBe(false);
            expect(isUrlAllowed('data:text/html,<script>alert(1)</script>')).toBe(false);
        });

        it('handles malformed, empty or non-string inputs safely', () => {
            expect(isUrlAllowed('')).toBe(false);
            expect(isUrlAllowed('not-a-valid-url')).toBe(false);
            expect(isUrlAllowed(null as any)).toBe(false);
            expect(isUrlAllowed(undefined as any)).toBe(false);
        });

        it('verifies originWhitelist contains restrictive whitelist rather than wildcard', () => {
            expect(ALLOWED_WEBVIEW_ORIGINS).not.toContain('*');
            expect(ALLOWED_WEBVIEW_ORIGINS.some((origin) => origin.includes('nibss-plc.com.ng'))).toBe(true);
        });
    });

    describe('extractCodeAndState callback extraction', () => {
        it('extracts valid code and state from deep link', () => {
            const url = 'sohcahtoa://callback?code=auth_code_999&state=sess_state_abc';
            const { code, state } = extractCodeAndState(url);
            expect(code).toBe('auth_code_999');
            expect(state).toBe('sess_state_abc');
        });

        it('extracts code and state from standard web HTTPS query string', () => {
            const url = 'https://portal.nibss-plc.com.ng/igree?code=NIBSS_XYZ&state=STATE_123';
            const { code, state } = extractCodeAndState(url);
            expect(code).toBe('NIBSS_XYZ');
            expect(state).toBe('STATE_123');
        });

        it('returns empty strings gracefully when parameters are missing or URL is invalid', () => {
            expect(extractCodeAndState('https://example.com/no-params')).toEqual({ code: '', state: '' });
            expect(extractCodeAndState('')).toEqual({ code: '', state: '' });
            expect(extractCodeAndState('invalid:::url')).toEqual({ code: '', state: '' });
        });
    });
});
