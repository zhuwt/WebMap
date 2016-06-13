var popDialog = {};
var displayStation = {};

popDialog.createStation = function (id, popPosition, info) {
    return popDialog.createPopupDialog(id, popPosition, info, "ol-popup-station","center", "#ffffff");
};

popDialog.createCarInformation = function (id, popPosition, info, color) {
    return popDialog.createPopupDialog(id, popPosition, info, "ol-popup", "left", color);
};

popDialog.createPopupDialog = function (id, popPosition, info, cssClassName,textAlign, color) {
    //Create dom for Popup dialog
    var popContainer = document.createElement('div');
    popContainer.id = id + "PC";
    popContainer.style.opacity = 0.8;
    popContainer.style.textAlign = textAlign;
    popContainer.className = cssClassName;
    popContainer.style.backgroundColor = color;

    var content = document.createElement('div');
    content.id = id + "C";
    content.innerText = info;
    popContainer.appendChild(content);

    var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
        position: popPosition,
        element: popContainer
    }));
    map.addOverlay(overlay);
    return overlay;
};

popDialog.createPopDialog = function (id, popPosition, info) {
    //Create dom for Popup dialog
    var popContainer = document.createElement('div');
    popContainer.id = id + "PC";
    popContainer.style.opacity = 0.8;
    popContainer.className = "ol-popup";

    var content = document.createElement('div');
    content.id = id + "C";
    content.innerText = info;
    popContainer.appendChild(content);

    var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
        position: popPosition,
        element: popContainer
    }));
    map.addOverlay(overlay);
    return overlay;
};

popDialog.modifyPopDialogText = function (id, text) {
    var content = document.getElementById((id + "C"));
    content.innerText = text;
};

popDialog.deletePopDialog = function (id) {
    //Create dom for Popup dialog
    var parentNodeOfContainer = document.getElementById(id + "PC").parentNode;
    var container = document.getElementById(id + "PC");
    parentNodeOfContainer.removeChild(container);
};

// popDialog.createPopDialog((new Date()).getTime(),[11426112.736181287, 4543722.709384017],'武威');
// popDialog.createPopDialog((new Date()).getTime(),[11769773.615351439, 4084489.0434466777],'乌鲁木齐');


displayStation.createStationLabel = function (id, displayPosition, stationName) {
    var element = document.createElement('a');
    element.id = id + "L";
    element.className = "overlay stationLabel";
    element.style.textDecoration = "none";
    element.innerText = stationName;

    var label = new ol.Overlay({
        position: displayPosition,
        element: element
    });
    map.addOverlay(label);
    return label;
};

displayStation.modifyStationLabel = function (id, stationName) {
    var element = document.getElementById(id + "L");
    element.innerText = stationName;
};

displayStation.createStationLabel((new Date()).getTime(), constPosition.WuWei, '武威');
displayStation.createStationLabel((new Date()).getTime(), constPosition.TianShui, '天水');
displayStation.createStationLabel((new Date()).getTime(), constPosition.HaMi, '哈密');