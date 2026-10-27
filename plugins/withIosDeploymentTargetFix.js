const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PODFILE_FIX_MARKER = '# [xcode-deployment-target-fix]';

const PODFILE_FIX_SNIPPET = `    ${PODFILE_FIX_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        deployment_target = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if deployment_target && Gem::Version.new(deployment_target) < Gem::Version.new('15.1')
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end`;

module.exports = function withIosDeploymentTargetFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(podfilePath)) {
        let contents = fs.readFileSync(podfilePath, 'utf8');
        if (!contents.includes(PODFILE_FIX_MARKER)) {
          contents = contents.replace(
            /(react_native_post_install\([\s\S]*?\)\n)/,
            `$1${PODFILE_FIX_SNIPPET}\n`
          );
          fs.writeFileSync(podfilePath, contents, 'utf8');
        }
      }
      return modConfig;
    },
  ]);
};
