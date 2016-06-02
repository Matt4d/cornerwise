//---------- Search.aspx methods --------------------------------------------

function AdvancedSearchToggle() 
{
    if ($("#divAdvancedSearch").css("display") == "none")
    {
        var searchType = $(".SearchTypeDropdown").val();
        $(".AdvancedSearchContainer").css("display", "none");
        $(".AdvancedSearchContainer[searchType='" + searchType + "']").css("display", "");

        $("#divAdvancedSearch").slideDown();
    }
    else
    {
        $("#divAdvancedSearch").slideUp();
    }

    return false;
}

function AdvancedSearchRefresh()
{
    $(".AdvancedSearchContainer").css("display", "none");

    if ($("#divAdvancedSearch").css("display") == "none") { }
    else
    {
        var searchType = $(".SearchTypeDropdown").val();
        $(".AdvancedSearchContainer[searchType='" + searchType + "']").css("display", "");
    }
}
	
// updates the adv search controls with the given values	
function AdvancedSearchSet(option, exclusions) {

    option = DecodeFromServer(option);
    exclusions = DecodeFromServer(exclusions);
    
    if (option.length == 0 && exclusions.length == 0) {
        $("#divAdvancedSearch").css("display", "none");
        return;
    }

    GetServerControl("txtExclude").val(exclusions);

    $("#trAdvancedSearchRadio input").attr("checked", false);
    $("#trAdvancedSearchRadio input[value='" + option + "']").attr("checked", true);
    
    $("#divAdvancedSearch").css("display", "");
}

function KillViewState(viewStateInput) {
    if (viewStateInput.length > 0)
        viewStateInput.remove();
}

function btnSearch_Click() 
{
    if (IsOnSplitView()) {
        KillViewState($("#__VIEWSTATE"));
    }

    $(".hfInputHashQuery").val("");
    PreprocessSearch();

    mIgnoreNextHashChange = true;
    Global_AjaxReloadControl($(".pnlPageNumsAndResults"), "DoSearch", null, OnSearchResultsReceived, "/Citizens/Search.aspx");
  
    return false;
}

var mPreviousHashQuery = "";
var mIgnoreNextHashChange = false;

function LoadSearchFromHashQuery()
{
    if (IsOnSplitView())
        return;

    if (mIgnoreNextHashChange) {
        mIgnoreNextHashChange = false;
        return;
    }

    var hash = window.location.hash;
  
    $(".hfInputHashQuery").val(hash);

    //if the url contains a querystring, replace it with a hash so it doesn't conflict

    var hasParameters = false;
    var params = GetQueryParameters(null,true);

    for (var i = 0; i < Object.keys(params).length; i++) {
        if (Object.keys(params)[i] != "Action")
            hasParameters = true;
    }

    if (hasParameters)
    {
        window.location = window.location.href.substr(0, window.location.href.indexOf("?")) + "?Action=Search#" + window.location.href.substr(window.location.href.indexOf("?") + 1);
        return;
    }

    if (hash == mPreviousHashQuery)
        return;

    mPreviousHashQuery = hash;
    if (hash != undefined && hash.length > 1)
    {
        //make sure there are actually some parameters, otherwise there is no need to load
        var params = GetQueryStringParameters(hash);
        hasParameters = false;
        for (var i = 0; i < Object.keys(params).length; i++)
        {
            var key = Object.keys(params)[i];
            if (params[key].length > 0)
                hasParameters = true;
        }

        if(hasParameters)
            Global_AjaxReloadControl($(".pnlPage"), "DoSearchFull", null, OnSearchResultsReceived);
    }
}

function IsOnSplitView()
{
    if (window.location.href.indexOf("SplitView") > -1)
        return true;

    //while in split view, we can't use ajax loading. All handling is done serverside.
    var params = GetQueryParameters(null, true);
    return params["Frame"] == "SplitView";
       
}

function OnSearchResultsReceived()
{
    var qs = $("#hfQueryString").val();

    if (!IsOnSplitView())    
        window.location.hash = qs;

    var hashParams = GetQueryParameters(qs,null,true);
    var searchTerm = hashParams["SearchText"];
    HighlightWords(searchTerm);

    RefreshSearchTypeDropdownSize();
    $("#btnSearch").focus();

    $("#SearchBox").keyup(function (evt)
    {
        if(evt.keyCode==13)
            $("#btnSearch").click();
    });

    // Datepicker
    if (typeof $('.SearchDate').datepicker === 'function') {
        $(".SearchDate").datepicker({ inline: false });
    }

    if (typeof FixFooterPosition === 'function') {
        FixFooterPosition();
    }

    if(IsOnSplitView())
    {
        try
        {
            ReplaceLinks($("#divSearchResults"));
        }
        catch(e)
        {
            console.log(e);
        }
    }
}
function GetServerControl(id) {
    if (id == "hfAdvancedSearchOption")
        return $('#ContentPlaceHolder1_hfAdvancedSearchOption');
    //return $("#<%=hfAdvancedSearchOption.ClientID%>");

    if (id == "hfRealSearchTerms")
        return $('#ContentPlaceHolder1_hfRealSearchTerms');
    //return $("#<%=hfRealSearchTerms.ClientID%>");

    if (id == "txtExclude")
        return $('#ContentPlaceHolder1_txtExclude');
    //return $("#<%=txtExclude.ClientID%>");

    if (id == "SearchText")
        return $('#ContentPlaceHolder1_SearchText');
    // return $("#<%=SearchText.ClientID%>");
}

function RefreshSearchTypeDropdownSize() {
    var cbo = $(".SearchTypeDropdown");
    $("#cboSearchTypeSizer").html($('.SearchTypeDropdown option:selected').text());

    var oldWidth = cbo.width();
    var newWidth = $("#cboSearchTypeSizer").width() + 30 // 30 : the size of the down arrow of the select box 
    cbo.width(newWidth);

    var change = newWidth - oldWidth;
    var txt = $("#SearchLeft input");
    txt.width(txt.width() - change);
}
// preprocesses the search terms according to the advanced options before the request is sent to the server
function PreprocessSearch() {
    var sSearchText = GetServerControl("SearchText").val();

    var sSearchType = "";
    if ($("#divAdvancedSearch").css("display") == "none") {
        GetServerControl("txtExclude").val("");
        GetServerControl("hfAdvancedSearchOption").val("");
        GetServerControl("hfRealSearchTerms").val("");

        return true;
    }

    sSearchType = $("#trAdvancedSearchRadio input:checked").val();

    sSearchText = SearchTextFormat(sSearchText, GetServerControl("txtExclude").val(), sSearchType);

    GetServerControl("hfRealSearchTerms").val(sSearchText);
    GetServerControl("hfAdvancedSearchOption").val(sSearchType);

    return true;

}

// modifies the search text based on the advanced search options
function SearchTextFormat(sText, sExclusions, sFormat) 
{
    if (sFormat == "Any") {
        sText = sText.replace(" ", " | ");
    }
    else if (sFormat == "Near") {
        sText = sText.replace(" ", " ~ ");
    }
    else if (sFormat == "Exact") {
        sText = "\"" + sText + "\"";
    }

    // EXCLUSIONS
    if (sExclusions == null)
        sExclusions = "";

    var fHasExcludes = false;
    var aExcludes = sExclusions.split(" ");
    for (var i = 0; i < aExcludes.length; i++) {
        if (aExcludes[i].length == 0)
            continue;

        if (!fHasExcludes) {
            fHasExcludes = true;
            sText = "(" + sText +")";
        }
        sText += " !" + aExcludes[i] + " ";
    }
    return sText;
}

// shows or hides the advanced search help popup
function btnSearchHelp_Click() 
{
    if ($("#divSearchHelp").css("display") == "none") 
    {
        $("#divSearchHelp").css("display", "");
        
        var position = $("#btnSearchHelp").position();
        position.left += 32;

        //see if the window is wide enough to fit, if not position this underneath
        if ($(window).width() - position.left < $("#divSearchHelp").width()) 
        {
            position.left -= ($("#divSearchHelp").width());
            position.top += 32;
        }
        
        $("#divSearchHelp").css(position);
    }
    else
        $("#divSearchHelp").css("display", "none");

    return false;
}

// ---------------- Search Term Highlighting  ----------------------------
var oFirstElement;
function HighlightWords(sWords, fAlterLinks, fScrollToFirstWord) {

    if ($("#MainContentHolder").length == 0)
        return;

    // split the search terms into words and construct a regex OR expression
    var aWords = unescape(sWords).split(";");
    var sRegexified = "";
    oFirstElement = null;
    var lastMatchGroup = 2;
    for (var i = 0; i < aWords.length; i++) {
        if (aWords[i].length == 0)
            continue;

        lastMatchGroup++;
        
        if (sRegexified.length > 0)
            sRegexified += "|";

        var sFormatedWord = DecodeFromServer(aWords[i]);
        sFormatedWord = sFormatedWord.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1');

        // tick should match apostrophe
        sFormatedWord = sFormatedWord.replace(new RegExp("\\'","gi"),"[\\'|’]");
        
        //if the last character isn't a character, the regex won't match it
        var sChar = sFormatedWord.charAt(sFormatedWord.length - 1);
        if (new RegExp("[\.\!\:]").test(sChar))
            sFormatedWord = sFormatedWord.substr(0, sFormatedWord.length - 2);
        else if (sChar == ";")
            sFormatedWord = sFormatedWord.substr(0, sFormatedWord.length - 2);
        
        
        
        sRegexified += "(" + sFormatedWord + ")";
    }

    var fIsSearchPage = window.location.href.toLowerCase().indexOf("search.aspx") != -1;

    // decide whether to use the fast or slow algorithm depending on the length of the document
    var txt = $("#MainContentHolder")[0].outerHTML;
    
    if (fIsSearchPage || txt.length < 100000)
        HighlightWordsSlowAndSafe(sRegexified);
    else
        HighlightWordsFastAndDangerous(sRegexified, txt, lastMatchGroup);

    // modify links so search term will be highlighted on the following page
    if (fIsSearchPage) {
        $("#MainLayout a").each(function(i, element) {
            var link = $(element).attr("href");

            if (link == undefined || link.toLowerCase().indexOf("javascript") == 0) 
            {
                // need to handle these differently
                return;
            }
            
            //don't need this for links that point back to the search page
            if (link.toLowerCase().indexOf("search.aspx") > -1)
                return;

            if (link.length > 0) {
                $(element).attr("href", AppendSearchTermsToUrl(link, sWords));
            }
        });
    }

    //scroll to the first term
    if (oFirstElement != null && !fIsSearchPage) {
        var top = oFirstElement.offset().top;
        $("html").scrollTop(top);
    }

    SearchNavigationInsert();
}

// highlights words by doing a deep traversal of the DOM. This method is slow but it only affects text nodes so there's no
// danger of messing with html tags
function HighlightWordsSlowAndSafe(sSearchString) {
    var pattern = new RegExp("(\\b\\S*" + sSearchString + "\\S*\\b)", "gi");
    var oNode = $("#MainContentHolder")[0];

    HighlightWordsInElement(oNode, pattern);
}
 
function HighlightWordsInElement(oNode, sPattern) {
    
    // if this is not a text node, call this method on its children
    if(oNode.nodeType != 3) { 
        for(var i =0; i < oNode.childNodes.length;i++) {
            HighlightWordsInElement(oNode.childNodes[i], sPattern);        
        }
        return;
    }
    
    var txt = oNode.nodeValue;
    if (!sPattern.test(txt))
        return;

    if (txt.toLowerCase().indexOf("javascript") > -1) return;
    var replacement = $("<span>" + txt.replace(sPattern, "<span class='SearchHighlight'>$1</span>") + " </span>");
    
    // remember the topmost element that matches the search
    if (oFirstElement == null || $(oNode.parentNode).offset().top < oFirstElement.offset().top)
    oFirstElement = replacement;

    $(oNode).replaceWith(replacement);
}

// for those who wish to live life on the edge. Highlights words by doing a regex replace on the entire content area. This might accidentally catch
// text inside an html attribute.  
function HighlightWordsFastAndDangerous(sSearchString, txt, lastMatchGroup) 
{
    var pattern = new RegExp("([>|\\s][^\\s|<|>|=]*)("+sSearchString+"[^\\s|<]*)", "gi");
    txt = txt.replace(pattern, "$1<span class='SearchHighlight'>$2</span>");
    var replacement = $(txt);
    $("#MainLayout").replaceWith(replacement);

    $(".SearchHighlight").each(function(i, element) 
    {
        if (oFirstElement == null || $(element).offset().top < oFirstElement.offset().top)
            oFirstElement = $(element);
    });
}

// places buttons on the page that skip to the next and previous search result

function SearchNavigationInsert() {

    var sTracker = $("<div class='SearchNavigation'></div>");
    sTracker.append("<div class='FindHeader'>Search Navigation</div>");
    
    var backBtn = $("<INPUT class='FindButton' onclick='javascript:SearchNavigationGoPrevious();' type='button' value='Previous Search Result'>");
    var nextBtn = $("<INPUT class='FindButton' onclick='javascript:SearchNavigationGoNext();' type='button' value='Next Search Result'>");
    sTracker.append(backBtn);
    sTracker.append(nextBtn);
    

    $(".LeftNavigation").append(sTracker);

    //keep the tracker docked
    $(window).scroll(function() {
        PositionSearchNavigator();
    });
    PositionSearchNavigator();
}

function PositionSearchNavigator() 
{
    var iScrollY = $(window).scrollTop();
    iScrollY += $(window).height();
    iScrollY -= ($(".SearchNavigation").height() + 64);

    $(".SearchNavigation").css("top", iScrollY + "px")
}

function SearchNavigationGoPrevious() {

    var iScrollPos = $(window).scrollTop();

    var iNewScrollPos = 0;

    // find the lowest search result that is higher up the page than the scroll position
    $(".SearchHighlight").each(function() {
        var offset = $(this).offset().top;
        if (offset < iScrollPos && offset > iNewScrollPos)
            iNewScrollPos = offset;
    });

    $("html").scrollTop(iNewScrollPos);
}

function SearchNavigationGoNext()
{
    var iScrollPos = $(window).scrollTop();

    var iNewScrollPos = $(document).height();
    
    // find the highest search result that is further down the page than the scroll position
    $(".SearchHighlight").each(function() {
        var offset = $(this).offset().top;
        if (offset > iScrollPos && offset < iNewScrollPos)
            iNewScrollPos = offset;
    });

    $("html").scrollTop(iNewScrollPos);
}

function AppendSearchTermsToUrl(link, searchTerms) {
    if (!searchTerms)
        return;
    link = Global_SetQueryParameter(link, "highlightTerms", searchTerms);
    return link;
}




//******* Quick Search Bar *****************

$(function() {
    UpdateSearchBox(false);
    $("#txtQuickSearch").click(function(e) { UpdateSearchBox(true); });
    $("#txtQuickSearch").keydown(function(e) {
        if (e.keyCode == 13) {
            DoSearch();
            return false;
        }
        UpdateSearchBox(true);
    });

    $("#txtQuickSearch").blur(function(e) { UpdateSearchBox(false); });
    $("#btnQuickSearch").click(function (e) {
        DoSearch();
        return false;
    });


});

function DoSearch() {

    var txtSearch = $("#txtQuickSearch");
    var sText = txtSearch.val();

    if (sText == "Search")
        sText = "";

    if (typeof DoSearch_Hook == 'function')
        DoSearch_Hook(sText);
    else
        window.location = "/Citizens/Search.aspx#SearchText=" + encodeURIComponent(sText);

    return false;
}

function UpdateSearchBox(fClearDefaultText) {
    var txtSearch = $("#txtQuickSearch");
    var sText = txtSearch.val();

    if (sText == undefined)
        return;
        
    if (fClearDefaultText) {
        if (sText == "Search")
            txtSearch.val("");
    }
    else {
        if (sText.length == 0)
            txtSearch.val("Search");
    }

    if (txtSearch.val() == "Search")
        txtSearch.css("color", "#CCCCCC");
    else
        txtSearch.css("color", "Black");
}

function OtherDocTypeChanged()
{
    var dropdown = $("#ContentPlaceholder1_cboDocumentType");
    var destination = $("#DocumentsCustomFields");

    var selectedTypeID = dropdown.val();
    if(selectedTypeID != undefined && selectedTypeID > 0)
        OutputCustomFieldsUI(selectedTypeID, destination);
}

//Clears any existings contents of destinationControl and creates
//ui elements for each of them
function OutputCustomFieldsUI(otherDocumentTypeID, destinationControl)
{
    destinationControl.html("<img src='/Lib/images/Loading_Snake_32x32.gif' alt='Loading...'/>");

    $.get("/api/OtherDocumentType/" + otherDocumentTypeID, function (docType)
    {
        destinationControl.html("<br/>");

        var customFields = docType.CustomFields;
        var lastFieldType = GetFieldTypeWithoutNumber(customFields[0].FieldType);

        customFields.forEach(function (field)
        {
            if (!field.Use)
                return;

            //add a break when we have a new field type
            var thisFieldType = GetFieldTypeWithoutNumber(field.FieldType);
            if (thisFieldType != lastFieldType) {
                lastFieldType = thisFieldType;
                destinationControl.append("<br/>");
            }

            AppendCustomFieldUI(destinationControl, field)            
        });
    });
}

//for example Text1->Text
function GetFieldTypeWithoutNumber(fieldName)
{
    return fieldName.replace(new RegExp("\\d+"), "");
}

function AppendCustomFieldUI(destinationControl, field)
{
    var controlName= "custom_" + field.FieldType;
    var fieldName = field.Name;
    if(!field.Use)
        return;

    var customUI = $("<span></span>");
    customUI.append("<label for='" + controlName + "'>" + fieldName + ":</label>");

    //if there are lookup values, make this a dropdown, otherwise it can be a textbox
    if (field.LookupValues.length > 0)
    {
        var select = $("<select name='" + controlName + "' id='" + controlName + "'/></select>");
        select.append("<option value=''></option>");
        field.LookupValues.forEach(function (lookup)
        {
            select.append("<option value='" + lookup.Name + "'>" + lookup.Name + "</option>");
        });
        customUI.append(select);
    }
    else if (field.FieldType.indexOf("Date") != -1) // date fields get date selectors
    {
        var dateInput = $("<input class='SearchDate SearchBoxText' type='text' name='" + controlName + "' id='" + controlName + "'/>");
        customUI.append(dateInput)
        dateInput.datepicker({ inline: false });
    }
    else 
    {
        customUI.append("<input type='text' name='" + controlName + "' id='" + controlName + "'/>")
    }
    customUI.append("<input type='hidden' name='fieldname" + controlName + "' " +
                    "id='fieldname" + controlName + "' " +
                    "value='" + field.Name + "' />")

    destinationControl.append(customUI);
}