import fs from 'fs';
import path from 'path';

// Load the base configuration from app.json
const appJson = require('./app.json');

export default ({ config }) => {
  const expoConfig = {
    ...config,
    ...appJson.expo,
  };

  // Handle Android google-services.json from environment variable (Base64)
  if (process.env.GOOGLE_SERVICES_JSON) {
    const androidPath = path.resolve(__dirname, 'google-services.json');
    try {
      fs.writeFileSync(androidPath, Buffer.from(process.env.GOOGLE_SERVICES_JSON, 'base64').toString());
      console.log('Successfully recreated google-services.json from secret.');
      expoConfig.android.googleServicesFile = './google-services.json';
    } catch (error) {
      console.error('Failed to recreate google-services.json:', error);
    }
  }

  // Handle iOS GoogleService-Info.plist from environment variable (Base64)
  if (process.env.GOOGLE_SERVICES_INFO_PLIST) {
    const iosPath = path.resolve(__dirname, 'GoogleService-Info.plist');
    try {
      fs.writeFileSync(iosPath, Buffer.from(process.env.GOOGLE_SERVICES_INFO_PLIST, 'base64').toString());
      console.log('Successfully recreated GoogleService-Info.plist from secret.');
      expoConfig.ios.googleServicesFile = './GoogleService-Info.plist';
    } catch (error) {
      console.error('Failed to recreate GoogleService-Info.plist:', error);
    }
  }

  return expoConfig;
};
