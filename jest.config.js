module.exports = {
    preset: 'jest-expo',
    transformIgnorePatterns: [
        'node_modules/(?!.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|iconsax-react-nativejs|lucide-react-native|@tanstack/react-query)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
