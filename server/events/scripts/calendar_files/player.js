var jwMediaPlayer;
var playerStartPosition;

function SetupJWPlayer(playSources) {
    jwplayer.key = "VO1kc/+YcrrjDA7x43ztygqLfHfiZ3Dc3Dd4VQblU0vtcglj";
    playerStartPosition = parseInt(GetQueryParameters(window.location.href)["MediaPosition"]);


    jwMediaPlayer = jwplayer("MediaPlayer1").setup({
        playlist: playSources,
        autostart: true,
        width: "100%",
        height: "100%",
        androidhls: true
    });

    jwMediaPlayer.onReady(function () {
        if (playerStartPosition > 0) {
            jwMediaPlayer.seek(playerStartPosition);
        }

        TrySetBestQuality(jwMediaPlayer);
        FixVideoSizeJW();
    });

    jwMediaPlayer.onSetupError(function() {
        // Prompt for install of flash for live since most browsers don't support html5 live hls streaming
        if (IsJWSourceLive(playSources) && !jwplayer.utils.hasFlashPlayerVersion) {
            $("#MediaPlayer1").html("<h2>Please install Flash Player</h2><br/>" +
                "<p><a href=\"http://www.adobe.com/go/getflashplayer\">" +
                "<img src=\"http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif\" alt=\"Get Adobe Flash player\" /></a></p>");
        }

    });
    
}

function IsJWSourceLive(playSources) {
    if (playSources == null) return false;
    if (playSources.length <= 0) return false;

    var ret = false;
    try {
       var i;
        for (i = 0; i < playSources.length; i++) {
            if (playSources[i].file.indexOf("(format=m3u8-aapl).m3u8") > -1) ret = true;
        } 
    } catch (e) {

    } 
    
    return ret;
}

function JWPlayerSetPosition(player, position) {
    jwMediaPlayer.seek(position);

    return true;
}

function SetPosition(position) {
    jwMediaPlayer.seek(position);

    return true;
}

function FixVideoSizeJW() {
    if (typeof (FixVideoSize) != "function") {
        return;
    }

    FixVideoSize(0, 0);

    //run again after a delay, in chrome the size won't take right away and I'm not sure why
    setTimeout(function () { FixVideoSize(0, 0); }, 100);
}

function TrySetBestQuality(player) {
    // if source is live - possible that quality is currently not set - try set it after timeout.
    if (player.getCurrentQuality() == -1) {
        setTimeout(function () { TrySetBestQuality(player); }, 200);

        return;
    }

    if (player.getCurrentQuality() !== 0) {
        return;
    }

    var allQualities = player.getQualityLevels();
    var bestQualityIndex = 0;
    var bestQuality = 0;

    for (var i = 0; i <= allQualities.length - 1; i++) {
        var quality = parseInt(allQualities[i].label);
        if (quality > bestQuality) {
            bestQuality = quality;
            bestQualityIndex = i;
        }
    };

    player.setCurrentQuality(bestQualityIndex);
}

// Dummy functions to prevent error by calling Silverlight JS.
function ChangeVideoPannelVisibility(isVisible) { }
function RememberPlayerPosition() { }
function RestorePlayerPosition() { }
function VideoScreenInitPlayer() { }