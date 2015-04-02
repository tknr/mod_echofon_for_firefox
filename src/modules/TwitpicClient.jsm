//
// Implementation of Twitpic client
// Copyright -

var EXPORTED_SYMBOLS = ["TwitpicClient"];

const {classes:Cc, interfaces:Ci, utils:Cu} = Components;

const OAUTH_ECHO_PROVIDER = "https://api.twitter.com/1.1/account/verify_credentials.json";
const TWITPIC_API_URL = "http://api.twitpic.com/2/upload.json";
const TWITPIC_API_KEY = "ee0573f3843ddc42bb35086d289b538b";

Cu.import("resource://echofon/TwitterClient.jsm");
Cu.import("resource://echofon/EchofonUtils.jsm");

function TwitpicClient(user, target, context)
{
  this.user = user;
  this.target = target;
  this.context = context;
}

TwitpicClient.prototype = {
  upload: function(file_path, text, location) {
    this.file_path = file_path;

    var req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    req.open("POST", TWITPIC_API_URL);
    var target = this;
    req.onload    = function(p) {target.onLoad(req);}
    req.onerror   = function(p) {target.onError(req);}

    var oauthecho = TwitterClient.buildOAuthHeader(this.user, "GET", OAUTH_ECHO_PROVIDER, {});
    req.setRequestHeader("X-Verify-Credentials-Authorization", "OAuth realm=\"http://api.twitter.com/\"," + oauthecho);
    req.setRequestHeader("X-Auth-Service-Provider", OAUTH_ECHO_PROVIDER);

    // 送信データを用意
    var formData = Cc["@mozilla.org/files/formdata;1"].createInstance(Ci.nsIDOMFormData);

    // API キー
    formData.append("key",TWITPIC_API_KEY);
    // メッセージ(ツイートと共通)
    formData.append("message", text);

    // 画像
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    file.initWithPath(file_path);
	formData.append("media", File(file));

    req.send(formData);
    return req;
  },

  onLoad: function(req) {
    var resp = JSON.parse(req.responseText);
    switch (Number(req.status)) {
      case 200:
        this.target.imageUploadDidFinish(this.context, this.file_path, resp["url"]);
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
