/*
   Licensed Materials - Property of IBM

   (C) Copyright 2015, 2016 IBM Corp.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// Public modules
var path = require('path');
var et = require('elementtree');
var strings = require('ibm-strings');
var log = require('npmlog');

// MFP modules
var externalizedStrings = require('./../externalizedStrings');
var hookConsts = require('./../utils/hook-consts');
var Hook = require('./../utils/hook');

/*
This class provides the Android hook script functionality for before plugin
install for Android.

projectDirectory - Path to the project

After the hook is executed, after-plugin-install hook will run.
 */
function AndroidBeforePluginInstall(projectDirectory) {
    var projDir;		// Path to project
    var platformDir;	// Path to platforms
    var that;			// References this

    Hook.apply(this);

    that = this;
    projDir = projectDirectory;
    platformDir = path.join(projectDirectory, 'platforms', hookConsts.ANDROID);

    logSilly('Project directory: ' + projDir);
    logSilly('Platform directory: ' + platformDir);

    /*
    Displays a log silly message. The log level must be set to silly.

    message - The message to log
     */
    function logSilly(message) {
        log.silly(hookConsts.ANDROID_BEFORE_PLUGIN_INSTALL, message);
    }

    /*
    Displays a log verbose message. The log level must be set to verbose.

    message - The message to log
     */
    function logVerbose(message) {
        log.verbose(hookConsts.ANDROID_BEFORE_PLUGIN_INSTALL, message);
    }

    /*
     Makes a data object of the AndroidManifest.

     Returns an object with the Android data.

     An error is thrown if AndroidManifest.xml cannot be read.
     */
    function getAndroidData() {
        var manifestContent;        // AndroidManifest.xml content
        var manifest;				// XML parsed AndroidManifest.xml
        var data;			        // Resultant Android data

        logVerbose('Getting Android data.');

        data = {};
        manifestContent = that.readFile(path.join(platformDir,
            hookConsts.ANDROID_MANIFEST_XML)).toString();
        manifest = et.parse(manifestContent);
        data.manifest = manifest;

        logSilly('Manifest file: ' + manifestContent);
        logSilly('Manifest: ' + JSON.stringify(manifest, null, 2));
        logSilly('Package data: ' + JSON.stringify(data, null, 2));

        return data;
    }

    /*
     Updates AndroidManifest.xml to add the application:name attribute
     */
    function updateManifestXML(manifest){
        var application = manifest.findall("./application/")[0];
        var attributeName = application.get(hookConsts.ANDROID_NAME_ATTRIBUTE);
        if(attributeName){
          if(attributeName === hookConsts.ANDROID_NAME_ATTRIBUTE_VALUE){
            console.warn(strings.format(externalizedStrings.manuallyMergeMFPAppFile, 
                hooksConsts.MFP_APPLICATION_JAVA), path.join(platformDir, hookConsts.COM_IBM_PATH));
          }
        } else {
            logVerbose(strings.format(externalizedStrings.addApplicationAttribute, 
                hookConsts.ANDROID_NAME_ATTRIBUTE, hookConsts.ANDROID_NAME_ATTRIBUTE_VALUE, 
                hookConsts.ANDROID_MANIFEST_XML));
            application.set(hookConsts.ANDROID_NAME_ATTRIBUTE, 
                hookConsts.ANDROID_NAME_ATTRIBUTE_VALUE);
        }
        that.writeXML(manifest, path.join(platformDir, hookConsts.ANDROID_MANIFEST_XML));
    }

    /*
     The AndroidManifest.xml will be updated. 

     An error will be thrown if the hook fails.
     */
    this.invokeHook = function() {
        var androidData;			// AndroidManifest.xml data

        logVerbose('Performing before plugin install hook.');

        try {
            androidData = getAndroidData();
            updateManifestXML(androidData.manifest);
        } catch (err) {
            throw strings.format(externalizedStrings.failedPluginInstall,
                hookConsts.ANDROID, err);
        }
    };
}

AndroidBeforePluginInstall.prototype = new Hook();
module.exports = AndroidBeforePluginInstall;
