//
// Implementation of update_with_media client
// Copyright -

var EXPORTED_SYMBOLS = ["UpdateWithMedia"];

const {classes:Cc, interfaces:Ci, utils:Cu} = Components;

const OAUTH_ECHO_PROVIDER = "https://api.twitter.com/1.1/account/verify_credentials.json";
const API_URL = "https://api.twitter.com/1.1/statuses/update_with_media.json";

Cu.import("resource://echofon/TwitterClient.jsm");
Cu.import("resource://echofon/EchofonUtils.jsm");
Cu.importGlobalProperties(['File']);
function UpdateWithMedia(user, target, context)
{
  this.user = user;
  this.target = target;
  this.context = context;
}

UpdateWithMedia.prototype = {
  send: function(file_path, text, location) {
    this.file_path = file_path;

    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    req.open("POST", API_URL);
    var target = this;
    req.onload    = function(p) {target.onLoad(req);}
    req.onerror   = function(p) {target.onError(req);}

    var oauthecho = TwitterClient.buildOAuthHeader(this.user, "POST", API_URL, {});
    req.setRequestHeader("Authorization", "OAuth " + oauthecho);

    // 送信データを用意
    var formData = Cc["@mozilla.org/files/formdata;1"].createInstance(Ci.nsIDOMFormData);

    // メッセージ
    formData.append("status", text);

    // 画像
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(file_path);
	formData.append("media[]", new File(file));

    req.send(formData);
    return req;
  },

  onLoad: function(req) {
    var resp = JSON.parse(req.responseText);
    switch (Number(req.status)) {
      case 200:
        this.target.statuses_update(resp, req, this);
        break;

      default:
        Cu.reportError("Failed to upload image: " + resp['Error']['ErrorCode'] + ": " + resp['Error']['Message']);
        this.context.error = "Failed to upload image: " + resp['Error']['Message'];
        EchofonUtils.notifyObservers("failedToSendMessage", this.context);
        break;
    }
  },

  onError: function(req) {
    this.context.error = "Failed to upload image: network error";
    Cu.reportError(this.context.error);
    EchofonUtils.notifyObservers("failedToSendMessage", this.context);
  }
}
