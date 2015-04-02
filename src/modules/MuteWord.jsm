//
//
//

var EXPORTED_SYMBOLS = ["MuteWord"];

var gMuteWord = null;

function MuteWord() {
  this.pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch("extensions.twitternotifier.");
  try {
      this.muteWord = JSON.parse(this.pref.getComplexValue("muteWord",Components.interfaces.nsISupportsString).data);
  }
  catch (e) {
    this.muteWord = {};
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    str.data = JSON.stringify(this.muteWord);
    this.pref.setComplexValue("muteWord", Components.interfaces.nsISupportsString, str);
  }
}

MuteWord.prototype = {  
  getMuteWord: function(user_id)
  {
    if(!this.muteWord[user_id]) {
      this.muteWord[user_id] = [];
    }
    return this.muteWord[user_id];
  },

  removeMuteWord: function(user_id, value)
  {
    var index = -1;
    for(var i in this.muteWord[user_id]) {
      if(this.muteWord[user_id][i] == value) {
        index = i;
        break;
      }
    }
    
    if(index == -1) {
      return false;
    }
    this.muteWord[user_id].splice(index,1);
    
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    str.data = JSON.stringify(this.muteWord);
    this.pref.setComplexValue("muteWord", Components.interfaces.nsISupportsString, str);
    return true;
  },

  setMuteWord: function(user_id, value)
  {
    if(!this.muteWord[user_id]) {
      this.muteWord[user_id] = [];
    }
    for(var i in this.muteWord[user_id]) {
      if(this.muteWord[user_id][i] == value) {
        return false;
      }
    }
    this.muteWord[user_id].push(value);
    
    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
    str.data = JSON.stringify(this.muteWord);
    this.pref.setComplexValue("muteWord", Components.interfaces.nsISupportsString, str);
    return true;
  },

  checkMuteWord: function(user_id, tweet)
  {
    var muteWord = null;
    try {
      muteWord = this.muteWord[user_id];
    }
    catch(e){
      return false;
    }
    if (muteWord && muteWord.length != 0) {
      if(tweet.text.length != 0) {
        //check word
        for (var i in muteWord) {
          if(tweet.text.indexOf(muteWord[i]) != -1) {
            return true;
          }
        }
      }
      if(tweet.entities.urls.length != 0) {
        for(var i in muteWord) {
          for(var j in tweet.entities.urls) {
            var url = tweet.entities.urls[j].expanded_url.toLowerCase();
            if(url.indexOf(muteWord[i].toLowerCase()) != -1) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },
    
  removeAccount: function(user_id)
  {
    if(this.muteWord[user_id]) {
      delete this.muteWord[user_id];

      var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
      str.data = JSON.stringify(this.muteWord);
      this.pref.setComplexValue("muteWord", Components.interfaces.nsISupportsString, str);
    }
  }
};

MuteWord.instance = function() {
  if(gMuteWord == null) {
    gMuteWord = new MuteWord();
  }
  return gMuteWord;
}