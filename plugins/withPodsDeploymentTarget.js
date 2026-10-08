const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# [withPodsDeploymentTarget]';

/**
 * Xcode 27 refuses to build pod targets whose IPHONEOS_DEPLOYMENT_TARGET is below iOS 15
 * (e.g. the resource bundles of RNCAsyncStorage, SDWebImage and RNSVG still declare 9.0-13.4).
 * This raises every pod target to at least `minVersion` inside the Podfile's post_install hook.
 */
module.exports = function withPodsDeploymentTarget(config, { minVersion = '15.1' } = {}) {
    return withDangerousMod(config, [
        'ios',
        (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            let contents = fs.readFileSync(podfilePath, 'utf8');
            if (!contents.includes(MARKER)) {
                const snippet = [
                    `    ${MARKER}`,
                    '    installer.pods_project.targets.each do |target|',
                    '      target.build_configurations.each do |build_config|',
                    "        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']",
                    `        if current.nil? || current.to_f < ${minVersion}`,
                    `          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${minVersion}'`,
                    '        end',
                    '      end',
                    '    end',
                    '',
                ].join('\n');
                contents = contents.replace(/post_install do \|installer\|\n/, (match) => match + snippet);
                fs.writeFileSync(podfilePath, contents);
            }
            return config;
        },
    ]);
};
