var gGeneralPane = {
	_testAudio : new Audio(),

	init : function() {
		this.onChangePopup(EchofonCommon.pref().getBoolPref('popup'));

		if (!EchofonCommon.isFF4() && navigator.platform.match("Linux")) {
			var elem = document.getElementById("app-mode-panel");
			elem.disabled = true;
			elem.setAttribute("tooltiptext", "Panel mode doesn't work on this platform");
		}
		if (EchofonCommon.isXULRunner()) {
			document.getElementById("popup-group").hidden = true;
			document.getElementById("notification-group").hidden = true;
			document.getElementById("open-link").hidden = true;
			document.getElementById("application-mode-group").hidden = true;
		}

		document.getElementById("unread-count").checked = EchofonCommon.pref().getBoolPref("unreadCount");

		var playSound = EchofonCommon.pref().getBoolPref("sound");
		document.getElementById("sound").checked = playSound;
		document.getElementById("sound-file").value = EchofonCommon.pref().getCharPref("soundFile");
		document.getElementById("sound-file").disabled = !playSound;
		document.getElementById("choose-sound").disabled = !playSound;
		document.getElementById("soundVolume").disabled = (!playSound || (document.getElementById("sound-file").value == ""));
		document.getElementById("soundVolume").setAttribute('movetoclick', (playSound && (document.getElementById("sound-file").value != "")));
		document.getElementById("soundPlayButton").label = EchofonCommon.getString("PlaySound");
		document.getElementById("soundPlayButton").disabled = (!playSound || (document.getElementById("sound-file").value == ""));

		var volume = EchofonCommon.pref().getIntPref("soundVolume");
		document.getElementById("soundVolume").value = volume;
		document.getElementById("soundVolumeNum").value = volume;

		var menulist = document.getElementById("font-face");
		var langGroupPref = document.getElementById("font.language.group");
		FontBuilder.buildFontList(langGroupPref.value, "", menulist);
		menulist.insertItemAt(0, "System Default", "", "");
		menulist.selectedIndex = 0;
		var currentFace = EchofonCommon.pref().getCharPref("fontFace");
		for ( var i in menulist.menupopup.childNodes) {
			var item = menulist.menupopup.childNodes[i];
			if (item.value == currentFace) {
				menulist.selectedIndex = i;
				break;
			}
		}
	},

	onChangeAppMode : function(menu) {
		EchofonCommon.notifyObservers("closeWindow");
		EchofonCommon.pref().setCharPref("applicationMode", menu.selectedItem.value);
		EchofonCommon.notifyObservers("toggleWindow");
		window.focus();
	},

	onChangeFont : function() {
		Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer).initWithCallback({
			notify : function() {
				EchofonCommon.notifyObservers("updateFont")
			}
		}, 50, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
	},

	onChangePopup : function(checked) {
		document.getElementById('popup-interval').disabled = !checked;
		document.getElementById('limited-popup').disabled = !checked;
		document.getElementById('limited-popup2').disabled = !checked;
	},

	onCheckUnreadCount : function(flag) {
		EchofonCommon.notifyObservers("showUnreadCount", !flag);
	},

	// Sound notitications
	onCheckSound : function(flag) {
		document.getElementById('sound-file').disabled = flag;
		document.getElementById('choose-sound').disabled = flag;
		document.getElementById("soundVolume").disabled = (flag || (document.getElementById("sound-file").value == ""));
		document.getElementById("soundVolume").setAttribute('movetoclick', (!flag && (document.getElementById("sound-file").value != "")));
		document.getElementById("soundPlayButton").disabled = (flag || (document.getElementById("sound-file").value == ""));
	},

	onSoundVolumeChange : function(scale) {
		document.getElementById('soundVolumeNum').value = scale.value;
		if (!this._testAudio.paused) {
			this._testAudio.volume = scale.value / 100;
		}
	},

	soundTestEnd : function() {
		document.getElementById("soundPlayButton").label = EchofonCommon.getString("PlaySound");
	},

	soundTest : function() {
		if (this._testAudio.paused) {
			var soundFile = document.getElementById("sound-file").value;
			var tempLocalFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
			tempLocalFile.initWithPath(soundFile);

			const
			ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
			this._testAudio.src = ioService.newFileURI(tempLocalFile).spec;
			this._testAudio.volume = document.getElementById("soundVolume").value / 100;
			this._testAudio.addEventListener("ended", this.soundTestEnd, false);
			document.getElementById("soundPlayButton").label = EchofonCommon.getString("StopSound");
			this._testAudio.play();
		} else {
			this._testAudio.pause();
			document.getElementById("soundPlayButton").label = EchofonCommon.getString("PlaySound");
		}
	},

	onBrowseFile : function() {
		const
		nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, EchofonCommon.getString("ChooseSoundFile"), nsIFilePicker.modeOpen);
		if (navigator.platform == "MacPPC" || navigator.platform == "MacIntel") {
			fp.appendFilter(EchofonCommon.getString("SoundFileFilter") + " (*.wav, *.aiff)", "*.wav; *.aiff; *.aif");
		} else {
			fp.appendFilter(EchofonCommon.getString("SoundFileFilter") + " (*.wav, *.ogg, *.mp3)", "*.wav; *.ogg; *.mp3");
		}

		var ret = fp.show();
		if (ret == nsIFilePicker.returnOK || ret == nsIFilePicker.returnReplace) {
			var file = fp.file;
			document.getElementById("sound-file").value = file.path;
			if (EchofonCommon.pref().getCharPref("soundFile") == "") {
				document.getElementById('choose-sound').disabled = false;
				document.getElementById("soundVolume").disabled = false;
				document.getElementById("soundVolume").setAttribute('movetoclick', true);
				document.getElementById("soundPlayButton").disabled = false;
			}
			EchofonCommon.pref().setCharPref("soundFile", file.path);
		}
	}

};