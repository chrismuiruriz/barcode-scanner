/* Dom7 */
var $$ = Dom7;
$mainUrl = "http://myschoolchart.com/unileverbe/rest/";
/* Theme */
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
    theme = document.location.search.split('theme=')[1].split('&')[0];
}

var app = new Framework7({
    theme: "md",
    init: false,
    cache: false,
    view: {
        pushState: true
    },
    root: "#app",
    name: "SMOLLAN",
    id: "co.ke.smollan",
    panel: {
        swipe: 'right'
    },
    routes: routes
});
var $$ = app.$;
/* make sure the app only runs on mobile devices */
if (app.device.desktop) {
    app.dialog.alert("We've detected you are using a desktop device to view this app, for the best user experience, kindly view it on your smartphone., ", null);
}

/* main view */
var mainView = app.view.create(".view-main");
/* pageInit is only called once */
app.on('pageInit', function (e) {
    var pageName = e.name;
    if (pageName === "home") {
    }
});
app.on("pageBeforeIn", function (e) {
    $(".panel-right").removeClass("opacity-none");
    $(".panel-backdrop").removeClass("opacity-none");
    var pageName = e.name;
    if (pageName === "home") {
    }
});
/* set up home page */
var setUpHomePage = function () {

};
/* update profile name */
$$('#main-panel').on('panel:open', function () {
    if (localStorage.userFirstName) {
        $("[data-modal='panelUserFullName']").html(localStorage.userFirstName + " " + localStorage.userLastName);
    }
});
/* login interface */
$("body").on("submit", "#login-form", function (e) {
    e.preventDefault();
    var $email = $("#login-email-input").val();
    var $password = $("#login-password-input").val();
    if ($email === "" || $password === "") {
        /* all fields are mandatory */
        app.toast.create({
            text: 'Email or Password is missing!',
            position: 'center',
            closeTimeout: 2000
        }).open();
        return;
    }
    mainView.router.load({url: "./index.html", ignoreCache: true, reload: true});
});

/* scan QR form */
$("body").on("submit", "#scan-qr-form", function (e) {
    e.preventDefault();
    cordova.plugins.barcodeScanner.scan(
            function (result) {
                alert("We got a barcode\n" +
                        "Result: " + result.text + "\n" +
                        "Format: " + result.format + "\n" +
                        "Cancelled: " + result.cancelled);
            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera: false, // iOS and Android
                showFlipCameraButton: true, // iOS and Android
                showTorchButton: true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                prompt: "Place a the QR Code inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations: true // iOS
            }
    );
    // mainView.router.load({url: "./pages/cooler-details.html", ignoreCache: true, reload: true});
});

/* get quiz from server */
var questionPopup = app.popup.create({
    content: '<div class="popup">' +
            '<form class="list" id="quiz-form">' +
            '<h4 class="quiz-title">Fill in the form below and submit</h4>' +
            '<ul>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title">Sheaves Properly Aligned?</div>' +
            '<div class="item-after">' +
            '<label class="toggle toggle-init">' +
            '<input type="checkbox" name="sheaves-aligned" value="yes"><i class="toggle-icon"></i>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title">Is this cooler odor-less?</div>' +
            '<div class="item-after">' +
            '<label class="toggle toggle-init">' +
            '<input type="checkbox" name="cooler-odorless" value="yes"><i class="toggle-icon"></i>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div class="item-content">' +
            '<div class="item-inner">' +
            '<div class="item-title">Is temp below 4.4 &#8451;</div>' +
            '<div class="item-after">' +
            '<label class="toggle toggle-init">' +
            '<input type="checkbox" name="temp-below-10" value="yes"><i class="toggle-icon"></i>' +
            '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div class="item-content item-input">' +
            ' <div class="item-inner">' +
            '<div class="item-title item-label">Comment</div>' +
            ' <div class="item-input-wrap">' +
            ' <textarea name="comment" placeholder="Your comment" rows="4"></textarea>' +
            ' </div>' +
            ' </div>' +
            ' </div>' +
            ' </li>' +
            '</ul>' +
            '<div class="quix-btn-container"><button class="col button button-fill" id="quiz-btn">SUBMIT</button></div>' +
            '</form>' +
            '<div class="block block-strong row">' +
            '<div class="col"><a class="button fill-form-from-data" href="#" id="close-quiz-popup">Close</a></div>' +
            '</div>' +
            '</div>'
});

$("body").on("click", "#close-quiz-popup", function (e) {
    e.preventDefault();
    questionPopup.close();
});

/* show quix */
$("body").on("click", "#get-quiz-details", function () {
    questionPopup.open();
});

/* on quiz submitted */
$("body").on("submit", "#quiz-form", function (e) {
    e.preventDefault();
});

/* initialize framework7 */
app.init();
