var msRefreshQuery;

function ShowItemDiscussion(type, id) {
    var url = "/Citizens/UserDiscussion.aspx?ID=" + id + "&ItemType=" + type;
    PopupWindowShow(url);
    return false;
}

// Shows a popup that already exists in the html
function PopupWindowShowInternal(selector) {

    var oElement = $(selector);
    if (oElement.length == 0)
        return;

    DimBackground();

    oElement.removeClass("PopupHidden");
    oElement.css("display", "");
    oElement.addClass("InternalPopupWindow");

    return false;
}

//shows a popup that already exists in the html, using the same styling as the regular PopupWindowShow function
function PopupWindowShowInternal2(selector) {
    var oElement = $(selector);
    if (oElement.length == 0)
        return;

    DimBackground();

    var popup = $("#divPopupBoxHolder");
    if (popup.length > 0)
        popup.remove();

    popup = $("<div id='divPopupBoxHolder' class='PopupBoxHolder ui-draggable' style='display:none'></div>");

    var sTop = "<div class='cornerImageHolder'></div><div class='closeButtonHolder'><input type='image' src='/Citizens/Images/close.png' onclick='javascript:return PopupWindowClose();'</div>";
    var sInnerHtml = "<table class='roundedPopupBox' cellspacing='0' cellpadding='0'><tr><td class='topLeft'><div></div></td><td class='top'>" + sTop + "</td><td class='topRight'><div></div></tr><tr><td class='left'></td> <td id='tdContents'><div class='PopupTitleBar'></div></td><td class='right'></tr><tr><td class='bottomLeft'></td> <td class='bottom'><div></div></td><td class='bottomRight'></tr></table>";
    popup.append(sInnerHtml);

    var form = $("form");
    if (form.length == 0) {
        $("body").append(popup);
    } else {
        $("form").append(popup);
    }

    var content = popup.find(selector);
    if (content.length == 0)
        popup.find("#tdContents").append($(selector).clone());


    var titleMessage = $(selector).find("#popupTitleMessage");
    if (titleMessage.length > 0) {
        popup.find(".PopupTitleBar").html(titleMessage.html());
    }

    var iWindowScrollPos = $(window).scrollTop();
    var iTop = iWindowScrollPos + 200;
    popup.css("top", iTop + "px");


    var width = popup.find(selector).width();
    popup.css("width", width + "px"); //this is neccessary for the auto margins to work, which centers the panel

    popup.css("display", "");
    popup.find(selector).css("display", "");

    return popup.find(selector);
}


function PopupWindowCloseInternal() {
    var popup = $(".InternalPopupWindow");
    popup.css("display", "none");
    $("#divBlackBoxOverlay").css("display", "none");
    return false;
}

function DimBackground() {
    var blackBox = $("#divBlackBoxOverlay");
    if (blackBox.length == 0) {
        blackBox = $("<div id='divBlackBoxOverlay' class='BlackBoxOverlay'></div>");
        var form = $("form:not(.popup-ignore)");
        if (form.length == 0) {
            $("body").append(blackBox);
        } else {
            $("form").append(blackBox);
        }
    }

    //  blackBox.css("width", "100%");
    //  blackBox.css("height", $(document).height() + "px");

    blackBox.css("opacity", 0.1);
    blackBox.fadeTo("400", 0.50);
    blackBox.css("display", "");
}

function PopupWindowShow(url, alternateSizing) {

    msRefreshQuery = escape(url);

    // if we're inside a framset we have to do things a little different
    var fInsideFrameset = false;
    try {
        fInsideFrameset = $(window.top.document.body).find("frameset").length > 0;
    }
    catch (ex) {
    }

    // darken the background
    if (!fInsideFrameset) {
        DimBackground();
    }

    var popup = $("#divPopupBoxHolder");
    if (popup.length == 0) {
        popup = $("<div id='divPopupBoxHolder' class='PopupBoxHolder ui-draggable' style='display:none'></div>");

        var sTop = "<div class='cornerImageHolder'></div><div class='closeButtonHolder'><input type='image' src='/Citizens/Images/close.png' onclick='javascript:return PopupWindowClose();'</div>";
        var sInnerHtml = "<table class='roundedPopupBox' cellspacing='0' cellpadding='0'><tr><td class='topLeft'><div></div></td><td class='top'>" + sTop + "</td><td class='topRight'><div></div></tr><tr><td class='left'></td> <td id='tdContents'><div class='PopupTitleBar'></div></td><td class='right'></tr><tr><td class='bottomLeft'></td> <td class='bottom'><div></div></td><td class='bottomRight'></tr></table>";
        popup.append(sInnerHtml);

        var form = $("form:not(.popup-ignore)");
        if (form.length == 0) {
            $("body").append(popup);
        } else {
            $("form").append(popup);
        }
    }

    var oFrame = popup.find("#frame");
    if (oFrame.length == 0) {
        oFrame = $("<iframe id='frame' frameborder='0' scrolling='no'></iframe>");
        popup.find("#tdContents").append(oFrame);
    }

    oFrame.unbind("load");
    oFrame.load(function () {

        /*setTimeout(function () {
            var body = $(oFrame[0].contentWindow.document.body);
            alert(oFrame[0].scrollTop);
            alert(oFrame[0].contentWindow.document.body.scrollTop);
            var i = 0;
        }, 1000);*/

        setTimeout(function () {
            var body = $(oFrame[0].contentWindow.document.body);
            if (body.length == 0)
                return;

            // get title text and corner image, if any
            var cornerImage = body.find("#popupCornerImage");
            if (cornerImage.length > 0)
                popup.find(".cornerImageHolder").html(cornerImage.html());

            var titleMessage = body.find("#popupTitleMessage");
            if (titleMessage.length > 0) {
                titleMessage.css("display", "none");
                popup.find(".PopupTitleBar").html(titleMessage.html());
            }

            body = body.find(".PopupBox");
            if (body.length == 0)
                return;

            popup.css("display", "");
            body.css("display", "");

            var width = parseInt(body.css("width").replace("px", ""));
            var height = parseInt(body.css("height").replace("px", ""));

            popup.find("#tdTopLeft").css("width", (width) + "px");
            popup.find("#tdTopRight").css("width", "18px");

            if (alternateSizing) {
                popup.css("width", (width) + "px");
                oFrame.css("width", (width) + "px");
            }
            else {
                popup.css("width", (width) + "px");
                popup.css("height", (height + 24) + "px");
                oFrame.css("width", (width) + "px");
                oFrame.css("height", height + "px");

            }

            var iWindowScrollPos = $(window).scrollTop();

            var iMiddleX;
            if (fInsideFrameset)
                iMiddleX = 0;
            else
                iMiddleX = ($(window).width() - width) / 2;

            var iMiddleY = (($(window).height() - (height + 24)) / 2) + iWindowScrollPos;

            popup.css("top", iMiddleY + "px");

            $(oFrame[0]).height(height);
            oFrame[0].contentWindow.document.body.scrollTop = 0;
        }, 1);
    });

    if (url.indexOf("PopupMode=Yes") > -1)
        oFrame.attr("src", url);
    else if (url.indexOf("?") == -1)
        oFrame.attr("src", url + "?PopupMode=Yes");
    else
        oFrame.attr("src", url + "&PopupMode=Yes");

    return false;
}

// If the message starts with Fail:, it pops up the message. Otherwise, closes the popup window
function PopupWindowCloseOnSuccess(sMessage, fnParentAction) {
    if (sMessage.indexOf("Fail:") == 0)
        alert(sMessage.substr("Fail:".length));
    else
        PopupWindowClose(fnParentAction);
}

// If the message starts with Fail:, it pops up the message. Otherwise, redirects the page
function RedirectOnSuccess(sMessage, sURL) {
    if (sMessage.indexOf("Fail:") == 0)
        alert(sMessage.substr("Fail:".length));
    else
        window.location.href = sURL;
}

function PopupWindowClose(fnParentAction) {
    var popup = $("#divPopupBoxHolder");
    if (popup.length == 0) {
        parent.PopupWindowClose(fnParentAction);
        return false;
    }

    popup.css("display", "none");
    popup.find("#frame").attr("src", "");
    $("#divBlackBoxOverlay").css("display", "none");

    if (fnParentAction != undefined)
        fnParentAction();

    popup.remove();
    return false;
}

$(function () {

    try {
        parent.BackButtonFix();
    }
    catch (ex) {

    }

    if (window.location.href.indexOf("RefreshPage=Yes") > -1) {
        ShowPleaseWait();
        parent.RefreshPage(window.location.href);
        return;
    }

    if (window.location.href.indexOf("RefreshPage=ShowChangePassword") > -1) {
        // ShowPleaseWait();
        // parent.RefreshPage("/Citizens/ChangePassword.aspx");
        PopupWindowShow("/Citizens/ChangePassword.aspx");
        return;
    }

    var sRefreshQuery = $(".hfShowPopup").val();
    $(".hfShowPopup").val("");

    if (sRefreshQuery == undefined || sRefreshQuery.length == 0)
        return;

    PopupWindowShow(unescape(sRefreshQuery));

});

//this resolves an issue with the back button after closing a popup. it would wind up showing the popup window again but without the dark background
//this fix has been tested in firefox, chrome, and ie8
function BackButtonFix() {
    var blackBox = $("#divBlackBoxOverlay");
    if (blackBox.css("display") != "none")
        return;

    var popup = $("#divPopupBoxHolder");
    if (popup.length == 0)
        return;

    var oFrame = popup.find("#frame");
    if (oFrame.length == 0)
        return;

    oFrame.attr("src", "");
    popup.css("display", "none");
}

function RefreshPage(url) {

    // remove RefreshPage=Yes from the query
    url = url.replace("&RefreshPage=Yes", "");
    url = url.replace("RefreshPage=Yes", "");

    msRefreshQuery = url;

    if (msRefreshQuery == undefined)
        return;

    if (msRefreshQuery.indexOf("Login.aspx") > -1) {

        //ignore if it was part of the return url        
        if (msRefreshQuery.indexOf("?") == -1 || msRefreshQuery.indexOf("Login.aspx?") > -1)
            msRefreshQuery = "";
    }

    if ($(".btnRefreshPage").length == 0) {
        location.reload();
        return;
    }

    $(".hfShowPopup").val(msRefreshQuery);
    $(".btnRefreshPage")[0].click();

    //if this was called in a window, refresh the parent page
    try {
        window.top.opener.RefreshPage("");
    }
    catch (ex) {

    }
}

function ChangeParentPage(url) {

    // if we're in the web outline, we want to only change the detail panel
    if (window.location.href.indexOf("WebOutline") > -1) {
        var detailFrame = $("#divRightPanel");

        //insert frame + css class parameteres if they're not already there
        if (url.indexOf("Frame=") == -1)
            url += "&Frame=Video";

        if (url.indexOf("CssClass=") == -1)
            url += "&CssClass=AgendaOutline";

        detailFrame.html("");
        detailFrame.attr("src", url);

        FrameInsert(detailFrame, function (e) { if (moRightPanelScroller != undefined) { moRightPanelScroller.scrollTo(0, 0); } });
        PopupWindowClose();
        return;
    }

    if (window.top.location.href.indexOf("WebOutline") > -1) {

        parent.ChangeParentPage(url);
        return;
    }

    // otherwise, try setting the outer window
    try {
        window.top.location = url;
        return;
    }
    catch (e) { }

    // if there is no outer window, just set the current window
    window.location = url;

}

function ShowPleaseWait() {
    // replace entire body
    var oForm = $("form");
    oForm.html("<div class='LoginPleaseWait'>Logging in, please wait . . . </div>");

}

