/**
 * Created by PhpStorm.
 * User: user
 * Date: 24.05.2024
 * Time: 12:53
 */

/**
 * @USE:
 * 1) add file to Your CORDOVA project:  hooks/fixIosIconAndSplash.js
 * 2) Add string to config.xml Your Cordova project, in <platform name="ios">:
 *         <hook type="after_build" src="hooks/fixIosIconAndSplash.js" />
 * 3) add ICON file (without transparent, PNG, 1024x1024px) to Root Cordova
 * 4) add string to Your config:  <icon src="icon-1024.png" />
 * 5) add Splashscreen file (without transparent, PNG, 2400x2400px) to Root Cordova
 * 6) add string to Your config: <splash src="SplashScreen_2400px.png" />
 *
 *
 */


/**
 * @TODO:
 * 1) определить пути к файлам
 * 2) найти значение для ICON и для SPLASH в config.xml
 * 3) Найти эти картинки
 * 4) удалить и создать новые директории
 * ios/{PROJECT_NAME}/Assets.xcassets/AppIcon.appiconset/
 * ios/{PROJECT_NAME}/Assets.xcassets/LaunchStoryboard.imageset/
 * 5) скопировать файлы картинок
 * 6) создать JSON файлы с правильным контентом
 * ios/{PROJECT_NAME}/Assets.xcassets/AppIcon.appiconset/Contents.json
 {
  "images" : [
    {
      "filename" : "icon_Full_1024_bg_2024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}


 * ios/{PROJECT_NAME}/Assets.xcassets/LaunchStoryboard.imageset/Contents.json
 {
  "images" : [
    {
      "filename" : "SplashScreen_2400px.png",
      "idiom" : "universal"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}


 */



/**
 * @HELP: https://cordova.apache.org/docs/en/12.x/guide/appdev/hooks/
 */

const fse = require('fs-extra')

const fs = require('fs');
const util = require('util');
const stat = util.promisify(fs.stat);
const Path = require('path')
const xml2js = require('xml2js');

var projectRoot;


let iconJSON =  {
    "images" : [
        {
            "filename" : "icon_Full_1024_bg_2024.png",
            "idiom" : "universal",
            "platform" : "ios",
            "size" : "1024x1024"
        }
    ],
    "info" : {
        "author" : "xcode",
        "version" : 1
    }
};
let splashJSON = {
    "images" : [
        {
            "filename" : "SplashScreen_2400px.png",
            "idiom" : "universal"
        }
    ],
    "info" : {
        "author" : "xcode",
        "version" : 1
    }
};


// @EXAMPLE: https://cordova.apache.org/docs/en/12.x/guide/appdev/hooks/
// @EXAMPLE CONFIG: https://gist.github.com/lucianomlima/ac7a0fbc34f56002f3a423979001e5ea

// Функция для удаления директории
function deleteDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.rmSync(directoryPath, { recursive: true, force: true });
        console.log(`Directory ${directoryPath} deleted.`);
    } else {
        console.log(`Directory ${directoryPath} does not exist.`);
    }
}

// Функция для создания директории и записи файла
function createDirectoryAndWriteFile(directoryPath, filePath, data) {
    fs.mkdirSync(directoryPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`File ${filePath} has been written with data: ${JSON.stringify(data)}`);
}

function copyFile(sourcePath, destinationPath){
    try {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log('File copied successfully');
    } catch (err) {
        console.error('Error copying the file:', err);
    }
}

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
    console.log('IS android: ', context.opts.platforms.includes('ios'));
    if (!context.opts.platforms.includes('ios')) return;


    projectRoot = Path.resolve(Path.dirname(context.scriptLocation), '..')
    console.log('Project root directory:', projectRoot)


    const platformRoot = Path.join(context.opts.projectRoot, 'platforms/ios');







    var config = fs.readFileSync('config.xml').toString();
    var appName = config.match(new RegExp('<' + 'name' + '(.*?)>(.*?)</' + 'name' + '>', 'i'))[2];
    console.log('appName: ', appName);

    var dirIcon = Path.join(platformRoot, appName+'/Assets.xcassets/AppIcon.appiconset/');
    var filePathIcon = Path.join(dirIcon, 'Contents.json');
    var dirSplash = Path.join(platformRoot, appName+'/Assets.xcassets/LaunchStoryboard.imageset/');
    var filePathSplash = Path.join(dirSplash, 'Contents.json');

    console.log('dirIcon: ', dirIcon);
    console.log('filePathIcon: ', filePathIcon);
    console.log('dirSplash: ', dirSplash);
    console.log('filePathSplash: ', filePathSplash);




    var rawConfig = fs.readFileSync("config.xml", 'ascii');
    var match = /^<widget.+version="([\d\.]+)".+?>$/gm.exec(rawConfig);
    // console.log('match: ', match);

    if(!match || match.length != 2)
        throw new Error("version parse failed");

    var appVersion = match[1];
    // fileStringReplace("www/index.html", "%%VERSION%%", version);
    console.log("appVersion:", appVersion);


    // const regex = /<icon\s+src="([^"]+)"(\s+[^>]*)?>/g;
    var rawConfig = fs.readFileSync("config.xml", 'ascii');
    // var match = /^<icon src="(.*?)".+?>$/gm.exec(rawConfig);
    var match = /<icon src="(.*?)".+?\/>/gm.exec(rawConfig);
    // console.log('match ICON: ', match);
    if(!match || match.length != 2)
        throw new Error("ICON parse failed");
    var iconFile = match[1];
    console.log("iconFile:", iconFile);


    var rawConfig = fs.readFileSync("config.xml", 'ascii');
    var match = /<splash src="(.*?)".+?\/>/gm.exec(rawConfig);
    if(!match || match.length != 2)
        throw new Error("SPLASH parse failed");
    var splashFile = match[1];
    console.log("splashFile:", splashFile);




    var newApkFileLocation = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_'+appVersion+'.apk');
    if(releaseApp){
        newApkFileLocation = Path.join(context.opts.projectRoot, '../APPs/'+appName+'_'+appVersion+'.aab');
    }
    console.log('newApkFileLocation: ', newApkFileLocation);

    deleteDirectory(dirIcon);
    iconJSON.images[0].filename = iconFile;
    createDirectoryAndWriteFile(dirIcon, filePathIcon, iconJSON);
    copyFile(context.opts.projectRoot + '/' +iconFile, dirIcon + ''+iconFile)


    deleteDirectory(dirSplash);
    splashJSON.images[0].filename = splashFile;
    createDirectoryAndWriteFile(dirSplash, filePathSplash, splashJSON);
    copyFile(context.opts.projectRoot + '/' +splashFile, dirSplash + ''+splashFile)




};

