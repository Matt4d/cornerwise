
function OpenWindow(PageName) {
    window.open(PageName, "PopUpCalendar", "width=1200,height=700,toolbars=no,scrollbars=no,status=no,resizable=yes");
}

function CheckWindow() {
    ChildWindow.close();
}

//reverse of  in MinuteTraq//
function DecodeFromServer(str) {
    str = str.replace(/!sc!/g, ";");
    str = str.replace(/!sq!/g, "'");
    str = str.replace(/!dq!/g, "\"");
    str = str.replace(/\+/g, " ");


    return str;
}

function CommTest() {
    return "OK";
}



function lnkAddComment_click(sLinkID, sTextboxID, sCheckboxID) {
    var oLink = $(sLinkID);
    var oText = $(sTextboxID);
    var sPublic;

    if ($(sCheckboxID).length == 0)
        sPublic = "False";
    else if ($(sCheckboxID)[0].checked)
        sPublic = "False";
    else
        sPublic = "True";

    //if link already contains &Public then the user has tried to click it twice
    if (oLink.attr("href").indexOf("&Public") != -1) {
        oLink.attr("href", "#");
        return false;
    }

    var sLink = oLink.attr("href") + "&Public=" + sPublic + "&Comment=" + escape(oText.val());

    var fSplitView = false;
    try {
        if (HandleSplitViewAddComment != undefined)
            fSplitView = true;
    }
    catch (ex) {
        fSplitView = false;
    }

    if (fSplitView) {
        oLink.attr("href", "#");
        HandleSplitViewAddComment(sLink);
        return false;
    }
    else {
        oLink.attr("href", sLink);

        oText.val("");
        return true;
    }
}

function Global_GetHashParameter() {

    var sURL = window.location.href;
    if (sURL.indexOf("#") < 0)
        return "";
    else
        return sURL.substring(sURL.indexOf("#") + 1);

}

function Global_GetQueryParameter(sKey) {
    return GetQueryParameters(window.location.href)[sKey];
}

function GetQueryParameters(sURL, ignoreHash, noRegex) {

    if (sURL == undefined || sURL.Length == 0)
        sURL = window.location.href;

    if (ignoreHash && sURL.indexOf("#") >= 0)
        sURL = sURL.substring(0, sURL.indexOf("#"));

    var sQuery;
    if (noRegex) {
        sQuery = new Array();
        sQuery.push(sURL);
    }
    else
        sQuery = sURL.match(/\?(.+)$/);

    var params = {};

    if (sQuery == null || sQuery == undefined || sQuery.length == 0)
        return params;

    for (var j = 0; j < sQuery.length; j++) {

        var aQueryList = sQuery[j].split("&");
        if (aQueryList.length > 0 && aQueryList[0].indexOf("?") != 0) {
            for (var i = 0; i < aQueryList.length; i++) {
                var aParts = aQueryList[i].split("=");
                params[aParts[0]] = aParts[1];
            }
            return params;
        }
    }
    return params;
}

function GetQueryStringParameters(sQuery)
{
    var params = {};

    if (sQuery.substr(0, 1) == "#" || sQuery.substr(0, 1) == "?")
        sQuery = sQuery.substr(1);

    var aQueryList = sQuery.split("&");
    if (aQueryList.length > 0)
    {
        for (var i = 0; i < aQueryList.length; i++) {
            var aParts = aQueryList[i].split("=");
            params[aParts[0]] = aParts[1];
        }
        return params;
    }
}

//Adds or sets a new query parameter to the given URL
function Global_SetQueryParameter(sURL, sName, sValue) {
    //first, take the text after the hashtag. We'll put it back at the end
    var sHash = "";
    if (sURL.indexOf("#") > -1) {
        sHash = sURL.substring(sURL.indexOf("#"));
        sURL = sURL.substring(0, sURL.indexOf("#"));
    }
    var index1 = sURL.indexOf("?" + sName + "=");
    var index2 = sURL.indexOf("&" + sName + "=");

    var fExists = index1 >= 0 || index2 >= 0;

    var sPrefix;
    if (sURL.indexOf("?") >= 0)
        sPrefix = "&";
    else
        sPrefix = "?";

    if (!fExists)
        return sURL + sPrefix + sName + "=" + sValue + sHash;

    var sLeft = sURL.substring(0, Math.max(index1, index2) + sName.length + 2);
    var sRight = sURL.substr(Math.max(index1, index2) + 1);
    if (sRight.indexOf("&") >= 0)
        sRight = sRight.substr(sRight.indexOf("&"));
    else
        sRight = "";

    var sResult = sLeft + sValue + sRight + sHash;
    return sResult;

}

function JSTest(testValue, expected) {
    if (testValue != expected)
        alert("Function is broken!");
}

function JSTests() {
    if (false)
        return;

    JSTest(Global_SetQueryParameter("http://what.com?Color=Red&Shape=Triangle", "Color", "blue"), "http://what.com?Color=blue&Shape=Triangle")
    JSTest(Global_SetQueryParameter("http://what.com?Color=Red&Shape=Triangle", "Shape", "square"), "http://what.com?Color=Red&Shape=square")
    JSTest(Global_SetQueryParameter("http://what.com?Color=Red&Shape=Triangle", "Animal", "squid"), "http://what.com?Color=Red&Shape=Triangle&Animal=squid")
    JSTest(Global_SetQueryParameter("http://what.com", "Animal", "squid"), "http://what.com?Animal=squid")
}

//looks at the hash tag provied by Global_AjaxPost to repeat an ajax action when a user pastes in the url
function Global_AjaxPageLoadResubmit(sAction, fnResponseAction) {

}

function Global_AjaxPost(sAction, fnResponseAction, fnAfterRequestSentAction, windowLocation) {

    if (windowLocation == null || windowLocation.length == 0)
        windowLocation = window.location.href;

    var sPostURL = Global_SetQueryParameter(windowLocation, "Action", sAction);
    sPostURL = Global_SetQueryParameter(sPostURL, "RequestTime", new Date().getTime());

    var formData = $('form').serialize();
    $.post(sPostURL, formData, fnResponseAction);

    if (fnAfterRequestSentAction != undefined)
        fnAfterRequestSentAction();
}


// Replaces the html of the given control with a spinner, makes a request to the current page, and fills the result into the control
function Global_AjaxReloadControl(oControl, sAction, oSpinnerControl, onLoad, windowLocation) {
    if (oSpinnerControl == undefined)
        oSpinnerControl = oControl;

    Global_AjaxPost(sAction, function (e) {
        oControl.html(e);
        if (onLoad)
            onLoad();
    }, function ()
    {
        oSpinnerControl.html("<img src='/Lib/images/Loading_Snake_32x32.gif' alt='Loading...'/>");
    }, windowLocation);
}

function Global_RefreshCurrentPage() {

    //go up to the main window
    var oWindow = window;
    while (oWindow.parent.location.href != undefined && oWindow.parent.location.href != oWindow.location.href)
        oWindow = oWindow.parent;

    var sURL = Global_SetQueryParameter(oWindow.location.href, "RequestTime", new Date().getTime());
    oWindow.location.href = sURL;
}

function Global_BrowserIsMobile() {
    return $(".hfIsMobile").val() == "True";
}


// shorthand for jquery ajax call. "get" does not use caching and results in timestamps being added to the url in some browsers
function AjaxGet(sUrl, fnAction) {
    $.ajax({ url: sUrl, data: {}, success: fnAction, cache: true });
}

function Global_StringReplaceAll(sText, sFind, sReplace) {
    var re = new RegExp(sFind, 'g')
    return sText.replace(re, sReplace);
}

if (typeof ChangeVideoPannelVisibility !== 'function') {
    function ChangeVideoPannelVisibility(isVisible) { }
}
if (typeof RememberPlayerPosition !== 'function') {
    function RememberPlayerPosition() { }
}
if (typeof RestorePlayerPosition !== 'function') {
    function RestorePlayerPosition() { }
}
if (typeof VideoScreenInitPlayer !== 'function') {
    function VideoScreenInitPlayer() { }
}

// resizable text area
$(function () {

    $(document).delegate(".resizableText", "keyup", function () {

        var iScrollHeight = $(this)[0].scrollHeight;
        var iHeight = $(this).height();

        if (iScrollHeight > 80)
            iScrollHeight = 80;


        if (iScrollHeight > (iHeight + 8))
            $(this).height(iScrollHeight);

        if ($(this).val().indexOf("Type in your comments here") == -1)
            return;

        var newTxt = $(this).val();
        newTxt = newTxt.replace("Type in your comments here", "");
        $(this).html(newTxt);
        $(this).css("color", "Black");
    });

    $(document).delegate(".resizableText", "click", function () {

        if ($(this).val() != "Type in your comments here")
            return;

        $(this).html("");
        $(this).css("color", "Black");
    });
});

// sends a request that returns a list of strings, and populates the given dropdown
function AjaxFillDropdown(control, url, defaultVal) {
    $.get(url, {}, function (e) {

        var contents = "";
        for (var i = 0; i < e.length; i++)
            contents += "<option value='" + e[i] + "'>" + e[i] + "</option>";
        control.html(contents);
        control.val(defaultVal);
    });
}


