/* Dom7 */
var $$ = Dom7;
$mainUrl = "http://dev.bean.co.ke/smollan-api/api/";
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
    if (pageName !== "login") {
        if (!localStorage.login) {
            mainView.router.load({url: "./pages/login-page.html", ignoreCache: true, reload: true});
        }
    } else if (pageName === "login") {
        if (localStorage.login) {
            mainView.router.load({url: "./index.html", ignoreCache: true, reload: true});
        }
    }
});

app.on("pageBeforeIn", function (e) {
    $(".panel-right").removeClass("opacity-none");
    $(".panel-backdrop").removeClass("opacity-none");
    var pageName = e.name;
    if (pageName === "login") {
        if (localStorage.login) {
            mainView.router.load({url: "index.html", ignoreCache: true, reload: true});
        }
    } else if (pageName === "cooler-details") {
        coolerDetailsFunctions(e);
    } else if (pageName === "records") {
        recordsFunctions(e);
    }
});

/* set records page */
var recordsFunctions = function (pageData) {
    app.preloader.show('Loading...');
    var serviceApi = $mainUrl + 'get_records.php';
    app.request.post(serviceApi, {user: localStorage.id, appid: "123"}, function (response, status, xhr) {
        app.preloader.hide();
        console.log("data", response.data);
        if (response.status === "SUCCESS") {
            var recordData = JSON.parse(response.data);
            $$("#table-data").empty();
            for (var i = 0; i < recordData.length; i++) {
                var trow = '<tr>' +
                        '<td>' + recordData[i]["date_time"] + '</td>' +
                        '<td>' + recordData[i]["cooler"] + '</td>' +
                        '<td>' + recordData[i]["location"] + '</td>' +
                        '<td>' + recordData[i]["user_name"] + '</td>' +
                        '<td>' + recordData[i]["feedback"] + '</td>' +
                        '</tr>';
                $("#table-data").append(trow);
            }
        } else {
            app.dialog.alert(response.message, null);
        }
    }, function (xhr, status) {
        app.preloader.hide();
        console.log("Error", xhr);
        app.dialog.alert("Connection Error! Check your internet connection and try again!", null);
    }, "json");
};

/* set cooler details page */
var coolerDetailsFunctions = function (pageData) {
    if ($.isEmptyObject(pageData.route.params)) {
        var queryParams = pageData.route.query;
    } else {
        var queryParams = pageData.route.params;
    }
    var code = queryParams.code;
    $("#serial_no").val(code);
    var urlApi = $mainUrl + 'get_cooler.php';
    app.dialog.preloader('...');
    app.request.post(urlApi, {code: code}, function (response, status, xhr) {
        app.dialog.close();
        if (response.status === "SUCCESS") {
            var obj = JSON.parse(response.data);
            console.log(response.data);
            $("[data-cooler='serial']").html(obj.serial);
            $("[data-cooler='name']").html(obj.name);
            $("[data-cooler='location']").html(obj.location);
            $("[data-cooler='img']").attr("src", obj.image);
            console.log("Image", obj.image);
        } else {
            app.dialog.alert(response.message, null);
        }
    }, function (xhr, status) {
        app.dialog.close();
        app.dialog.alert("Connection Error! Check your internet connection and try again.!", null);
    }, "json");
};

/* update profile name */
$$('#main-panel').on('panel:open', function () {
    if (localStorage.userFirstName) {
        $("[data-modal='panelUserFullName']").html(localStorage.name);
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
    } else {
        var urlApi = $mainUrl + 'login.php';
        app.request.post(urlApi, {email: $email, password: $password}, function (response, status, xhr) {
            app.dialog.close();
            if (response.status === "SUCCESS") {
                var obj = JSON.parse(response.data);
                localStorage.login = "true";
                localStorage.id = obj.ID;
                localStorage.name = obj.name;
                localStorage.email = obj.email;
                console.log(response.data);
                app.dialog.alert(response.message, null, function () {
                    mainView.router.load({url: "./index.html", ignoreCache: true, reload: true});
                });
            } else {
                app.dialog.alert(response.message, null);
            }
        }, function (xhr, status) {
            app.dialog.close();
            app.dialog.alert("Connection Error! Check your internet connection and try again.!", null);
        }, "json");

    }
});

/* scan QR form */
$("body").on("submit", "#scan-qr-form", function (e) {
    e.preventDefault();

    if (typeof cordova == 'undefined') {
        var t = "353982886721734";
        var msg = "QR CODE " + t;
        app.dialog.alert(msg, null, function () {
            var $url = "./pages/cooler-details.html?code=" + t + "&serial=1";
            mainView.router.load({url: $url, ignoreCache: true, reload: true});
        });
        return;
    }

    cordova.plugins.barcodeScanner.scan(
            function (result) {
                var msg = "QR CODE " + result.text;
                app.dialog.alert(msg, null, function () {
                    var $url = "./pages/cooler-details.html?code=" + result.text + "&serial=1";
                    mainView.router.load({url: $url, ignoreCache: true, reload: true});
                });
            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera: false,
                showFlipCameraButton: true,
                showTorchButton: true,
                torchOn: false,
                prompt: "Place a the QR Code inside the scan area",
                resultDisplayDuration: 500,
                orientation: "portrait",
                disableAnimations: true
            }
    );
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
            ' <textarea name="comment" id="comment" placeholder="Your comment" rows="4"></textarea>' +
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

    var quizData = new Object();
    var quiz1 = $("[name='sheaves-aligned']");
    var quiz2 = $("[name='cooler-odorless']");
    var quiz3 = $("[name='stemp-below-10']");
    if (!quiz1.is(":checked")) {
        quizData.quiz1 = "YES";
    } else {
        quizData.quiz1 = "NO";
    }
    if (!quiz2.is(":checked")) {
        quizData.quiz2 = "YES";
    } else {
        quizData.quiz2 = "NO";
    }
    if (!quiz3.is(":checked")) {
        quizData.quiz3 = "YES";
    } else {
        quizData.quiz3 = "NO";
    }
    quizData.comment = $("[name='comment']").val();
    var strQuizData = JSON.stringify(quizData);
    var serial = $("#serial_no").val();
    var location = $("[data-cooler='location']").html();

    var urlApi = $mainUrl + 'save_records.php';
    app.dialog.preloader('...');
    app.request.post(urlApi, {quizData: strQuizData, cooler: serial, loc: location, userId: localStorage.id, userName: localStorage.name}, function (response, status, xhr) {
        app.dialog.close();
        if (response.status === "SUCCESS") {
            app.dialog.alert(response.message, null, function () {
                questionPopup.close();
                mainView.router.load({url: "./index.html", ignoreCache: true, reload: true});
            });
        } else {
            app.dialog.alert(response.message, null);
        }
    }, function (xhr, status) {
        app.dialog.close();
        app.dialog.alert("Connection Error! Check your internet connection and try again.!", null);
    }, "json");
});

/* initialize framework7 */
app.init();
