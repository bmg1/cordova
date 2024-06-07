/**
 * Created by PhpStorm.
 * User: user
 * Date: 16.04.2024
 * Time: 20:21
 */

/**
 * @USE:
 * 1) add file to Your CORDOVA project:  hooks/copyAPK.js
 * 2) Add string to config.xml Your Cordova project, in <platform name="android">:
 *         <hook type="after_build" src="hooks/copyAPK.js" />
 * 3) create folder: APPS over Your Cordova project
 *
 *
 *
 */


/**
 * @HELP: https://cordova.apache.org/docs/en/12.x/guide/appdev/hooks/
 */

const fse = require('fs-extra')

const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const Path = require('path')

var projectRoot;


// @EXAMPLE: https://cordova.apache.org/docs/en/12.x/guide/appdev/hooks/
// @EXAMPLE CONFIG: https://gist.github.com/lucianomlima/ac7a0fbc34f56002f3a423979001e5ea

function fileStringReplace(filename, search, replace) {
    var content = fs.readFileSync(filename, 'utf8');
    content = content.replace(new RegExp(search, "g"), replace);
    console.log('fileStringReplace: ', content);

    // fs.writeFileSync(filename, content, 'utf8');
}

module.exports = function(context) {
    console.log("\r\n\r\n");
    console.log(context.hook, context.scriptLocation.split('\\').reverse()[0])
    // console.log('context: ', context)
    // console.log('scriptLocation2: ', context.scriptLocation.split('\\').reverse()[0])
    console.log('context.opts.cordova.platforms: ', context.opts.cordova.platforms)


    var buildType = 'debug';
    var releaseApp = false;
        var buildOptions = context.opts.options || {};
    // console.log('buildOptions: ', buildOptions);
    if (buildOptions.hasOwnProperty('release')) {
        buildType = 'release';
        releaseApp = true;
    };
    console.log('buildType: ', buildType);
    console.log('releaseApp: ', releaseApp);


    const date = new Date();
    // const formatter = new Intl.DateTimeFormat('en', {
    const formatter = new Intl.DateTimeFormat('lv', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, hourCycle: 'h23'
    });
    const formattedDate = formatter.format(date);
    const formattedDate2 = formattedDate.toString().replaceAll('/', '_').replaceAll('.', '_').replaceAll(':', '_').replaceAll(', ', '-').replaceAll(' ', '-');
    console.log('formattedDate; ', formattedDate);
    console.log('formattedDate2; ', formattedDate2);


    // Make sure android platform is part of build
    console.log('Start HOOK after BUILD: ', 'OK!');
    console.log('context.opts.platforms: ', context.opts.platforms);
    console.log('IS android: ', context.opts.platforms.includes('android'));
    if (!context.opts.platforms.includes('android')) return;


    projectRoot = Path.resolve(Path.dirname(context.scriptLocation), '..')
    console.log('Project root directory:', projectRoot)


    const platformRoot = Path.join(context.opts.projectRoot, 'platforms/android');

    var apkFileLocation = Path.join(platformRoot, 'app/build/outputs/apk/debug/app-debug.apk');
    if(releaseApp){
        apkFileLocation = Path.join(platformRoot, 'app/build/outputs/bundle/release/app-release.aab');
    }



    var config = fs.readFileSync('config.xml').toString();
    var appName = config.match(new RegExp('<' + 'name' + '(.*?)>(.*?)</' + 'name' + '>', 'i'))[2];
    console.log('appName: ', appName);



    var rawConfig = fs.readFileSync("config.xml", 'ascii');
    var match = /^<widget.+version="([\d\.]+)".+?>$/gm.exec(rawConfig);
    // console.log('match: ', match);

    if(!match || match.length != 2)
        throw new Error("version parse failed");

    var appVersion = match[1];
    // fileStringReplace("www/index.html", "%%VERSION%%", version);
    console.log("appVersion:", appVersion);

    var newApkFileLocation = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_'+appVersion+'.apk');
    if(releaseApp){
        newApkFileLocation = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_'+appVersion+'.aab');
    }
    console.log('newApkFileLocation: ', newApkFileLocation);


    return stat(apkFileLocation).then(stats => {
        const startDate = new Date();
        console.log('FINISH: ', startDate);

        console.log(`Size of ${apkFileLocation} is ${stats.size} bytes`);


        // let timestamp = Date.now();
        let timestamp = Math.floor(Date.now()/1000);

        var newApkFileLocation2 = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_v'+appVersion+'_('+formattedDate2+').apk');
        if(releaseApp){
            newApkFileLocation2 = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_v'+appVersion+'_('+formattedDate2+').aab');
        }
        fse.copySync(apkFileLocation, newApkFileLocation2);
        console.log('FILE COPY: ', newApkFileLocation2);


        fs.unlink(apkFileLocation, (err) => {
            if (err) {
                console.error('delete ERROR: ', err);
            } else {
                console.log('File is deleted:', apkFileLocation);
            }
        });



    });
};

