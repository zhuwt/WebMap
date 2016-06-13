/**
 * Created by zhuwt on 2016/4/23.
 */
///////////////////////////Create car dialog/////////////////////////////////////////////
dialog.selChange = function (arg) {
    var createDiv = document.getElementById('createCarLicenseDiv');
    var modifyDiv = document.getElementById('modifyCarLicenseDiv');
    var deleteButton = document.getElementById('deleteCar');
    var labelArrival = document.getElementById('labelOfArrival');
    var carStatus = document.getElementById('carStatus');
    var labelColor = document.getElementById('carColorLabel');
    var carColor = document.getElementById('carColor');
    if (arg == 'create') {
        createDiv.style.display = null;
        modifyDiv.style.display = "none";
        deleteButton.style.display = "none";
        dialog.radioStaus = common.carRadioValue.create;
        labelArrival.style.display = "none";
        carStatus.style.display = "none";
        document.getElementById('confirmCarInfo').innerText = '创建';
        labelColor.style.display = null;
        carColor.style.display = null;
    } else {
        createDiv.style.display = "none";
        modifyDiv.style.display = null;
        deleteButton.style.display = null;
        labelArrival.style.display = null;
        carStatus.style.display = null;
        labelColor.style.display = "none";
        carColor.style.display = "none";
        dialog.radioStaus = common.carRadioValue.modify;
        document.getElementById('confirmCarInfo').innerText = '修改';
        dialog.setUIValueByCarLicense();
    }
};

dialog.changeColor = function () {
    var select = document.getElementById("carColor");
    select.style.backgroundColor = common.carColors[select.selectedIndex];
};

dialog.setUIValueByCarLicense = function () {
    var license = document.getElementById('modifyCarLicense').value;
    var carStatus = document.getElementById('carStatus');
    var startPlaceName;
    var endPlaceName;
    var features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.car && features[n].license == license) {
            startPlaceName = features[n].startPlaceName;
            endPlaceName = features[n].endPlaceName;
            document.getElementById('startPoint').value = startPlaceName;
            document.getElementById('endPoint').value = endPlaceName;
            // document.getElementById('carColor').style.backgroundColor = features[n].color;
            if ((new Date().getTime() >= features[n].arrivalTime))
                carStatus.value = constString.carArrival;
            else
                carStatus.value = constString.carMoving;
            break;
        }
    }
};

dialog.createCarDialog = function () {
    if (Draw.getActive()) {
        Draw.setActive(false);
        return;
    }
    Modify.setActive(false);

    dialog.station = null;
    dialog.car = {};
    document.getElementById('createCarLicense').value = '';
    var carSelectElement = document.getElementById('modifyCarLicense');
    var startSelectElement = document.getElementById('startPoint');
    var endSelectElement = document.getElementById('endPoint');
    var select = document.getElementById("carColor");
    select.selectedIndex = 0;
    select.style.backgroundColor = common.carColors[select.selectedIndex];

    //clean the option list
    common.clearSelect('modifyCarLicense');
    for (var m = startSelectElement.length - 1; m >= 0; m--) {
        startSelectElement.remove(m);
        endSelectElement.remove(m);
    }

    //walk the point of city and station,
    // then create the option and insert them to the select tag
    var option = null;
    var features = map.getLayers().getArray()[common.stationLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.station || features[n].geometryType == common.geometryType.city) {
            option = document.createElement('option');
            option.text = features[n].pointName;
            startSelectElement.add(option, null);

            option = document.createElement('option');
            option.text = features[n].pointName;
            endSelectElement.add(option, null);
        }
    }
    features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (n = 0; n < features.length; n++) {
        option = document.createElement('option');
        option.text = features[n].license;
        carSelectElement.add(option, null);
    }
    dialog.setUIValueByCarLicense();
    $('#car').modal({backdrop: false});
};

dialog.displayCarInformation = function (carLicense) {
    if (Draw.getActive()) {
        Draw.setActive(false);
        return;
    }
    Modify.setActive(false);

    dialog.station = null;
    dialog.car = {};
    document.getElementById('confirmCarInfo').innerText = '修改';
    var createCarLicenseElement = document.getElementById('createCarLicense');
    createCarLicenseElement.value = "";
    var carSelectElement = document.getElementById('modifyCarLicense');
    var startSelectElement = document.getElementById('startPoint');
    var endSelectElement = document.getElementById('endPoint');
    var select = document.getElementById("carColor");
    select.selectedIndex = 0;
    select.style.backgroundColor = common.carColors[select.selectedIndex];

    //clean the option list
    common.clearSelect('modifyCarLicense');
    for (var m = startSelectElement.length - 1; m >= 0; m--) {
        startSelectElement.remove(m);
        endSelectElement.remove(m);
    }

    //walk the point of city and station,
    // then create the option and insert them to the select tag
    var option = null;
    var features = map.getLayers().getArray()[common.stationLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.station || features[n].geometryType == common.geometryType.city) {
            option = document.createElement('option');
            option.text = features[n].pointName;
            startSelectElement.add(option, null);

            option = document.createElement('option');
            option.text = features[n].pointName;
            endSelectElement.add(option, null);
        }
    }
    features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (n = 0; n < features.length; n++) {
        option = document.createElement('option');
        option.text = features[n].license;
        carSelectElement.add(option, null);
    }

    //Set car information in dialog
    var createDiv = document.getElementById('createCarLicenseDiv');
    var modifyDiv = document.getElementById('modifyCarLicenseDiv');
    document.getElementById("radioCreateCar").checked = false;
    document.getElementById("radioModifyCar").checked = true;
    var deleteButton = document.getElementById('deleteCar');
    var labelArrival = document.getElementById('labelOfArrival');
    var carStatus = document.getElementById('carStatus');
    var labelColor = document.getElementById('carColorLabel');
    ///////
    createDiv.style.display = "none";
    modifyDiv.style.display = null;
    carSelectElement.value = carLicense;
    deleteButton.style.display = null;
    labelArrival.style.display = null;
    carStatus.style.display = null;
    labelColor.style.display = "none";
    select.style.display = "none";
    dialog.radioStaus = common.carRadioValue.modify;
    document.getElementById('confirmCarInfo').innerText = '修改';
    dialog.setUIValueByCarLicense();
    ///////
    $('#car').modal({backdrop: false});
};

dialog.confirmCarInfo = function () {
    dialog.station = null;
    dialog.car.startPoint = document.getElementById('startPoint').value;
    dialog.car.endPoint = document.getElementById('endPoint').value;
    dialog.car.delayTime = document.getElementById('carMoveDelay').value;
    dialog.car.carLicense = document.getElementById('createCarLicense').value;
    var selectNode = document.getElementById("carColor");
    //Check the car value
    if (document.getElementById('radioCreateCar').checked && dialog.car.carLicense == '') {
        showMessageBox(constString.messageBoxTitleNotify, constString.carLicenseCannotBeEmpty);
        return false;
    }

    if (common.findCarByLicense(dialog.car.carLicense)) {
        showMessageBox(constString.messageBoxTitleNotify, constString.carLicenseDuplicate);
        return false;
    }

    if (dialog.car.delayTime == '' || dialog.car.delayTime < -24 || dialog.car.delayTime > 24) {
        showMessageBox(constString.messageBoxTitleNotify, constString.delayTimeIllegal);
        return false;
    }

    //Check start and end is same
    var startPoint = common.findStationOrControlByName(dialog.car.startPoint).getGeometry().getCoordinates();
    var endPoint = common.findStationOrControlByName(dialog.car.endPoint).getGeometry().getCoordinates();
    if (common.sameCoordinate(startPoint, endPoint)) {
        showMessageBox(constString.messageBoxTitleNotify, constString.startAndEndPositionCanNotBeSame);
        return;
    }

    //find the way between start and end
    var shortestRoad = common.findTheShortestRoad(startPoint, endPoint);
    if (shortestRoad.roads.length == 0) {
        showMessageBox(constString.messageBoxTitleNotify, constString.canNotFoundTheWay);
        return;
    }

    // var rotation = common.PointRotation(startPoint,endPoint);
    // console.log(rotation);
    // rotation = rotation*Math.PI/180+Math.PI;//rotation*2*Math.PI/360+Math.PI

    var style = null;
    if (endPoint[0] - startPoint[0] >= 0) {
        style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: "Image/truckRight.png"
                // rotation:rotation
            })
        });
    } else {
        style = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                src: "Image/truckLeft.png"
                // rotation:rotation
            })
        });
    }
    //Create car
    if (document.getElementById('radioCreateCar').checked) {
        //craete car feature
        var car = new ol.Feature({
            geometry: new ol.geom.Point(startPoint)
        });
        //Set car information
        car.id = new Date().getTime();
        car.license = dialog.car.carLicense;
        car.geometryType = common.geometryType.car;
        car.animating = false;
        car.setStyle(style);
        dialog.setCarInformation(car,
            dialog.car.startPoint,
            dialog.car.endPoint,
            dialog.car.delayTime,
            shortestRoad,
            startPoint,
            common.carColors[selectNode.selectedIndex]);
        map.getLayers().getArray()[common.carLayer].getSource().addFeature(car);
        car.getGeometry().setCoordinates(startPoint);
        car.popup.setPosition(startPoint);
        app.ControlEvent.setCar(car);
        if (common.sameCoordinate(startPoint, constPosition.HaMi))
            carLicenseList.removeCar(car.license);
    }
    else {//Modify car
        var features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
        var carLicense = document.getElementById('modifyCarLicense').value;
        for (var n = 0; n < features.length; n++) {
            if (features[n].geometryType == common.geometryType.car &&
                features[n].license == carLicense) {

                if (common.sameCoordinate(features[n].getGeometry().getCoordinates(), constPosition.HaMi))
                    carLicenseList.removeCar(carLicense);

                features[n].setStyle(style);
                dialog.setCarInformation(features[n],
                    dialog.car.startPoint,
                    dialog.car.endPoint,
                    dialog.car.delayTime,
                    shortestRoad,
                    startPoint,
                    features[n].color);

                if (features[n].stopMove != null) {
                    features[n].stopMove();
                }

                app.ControlEvent.setCar(features[n]);
            }
        }
    }
    $('#car').modal('hide');
};

dialog.setCarInformation = function (car, startPlaceName, endPlaceName, delayTime, shortestRoad, startPoint, color) {
    car.startPlaceName = startPlaceName;
    car.endPlaceName = endPlaceName;
    car.startPoint = startPoint;
    car.roads = shortestRoad.roads;
    car.currentRoadIndex = 0;
    car.totalTime = shortestRoad.time * common.roadLengthModulus;
    var currentTime = new Date().getTime();
    car.startTime = currentTime + parseInt(delayTime) * common.roadLengthModulus;
    car.arrivalTime = currentTime + shortestRoad.time * common.roadLengthModulus + parseInt(delayTime) * common.roadLengthModulus;
    car.direct = common.sameCoordinate(startPoint, car.roads[car.currentRoadIndex].getGeometry().getFirstCoordinate());
    car.color = color;
    if (car.popup != null) {
        popDialog.deletePopDialog(car.id);
        map.removeOverlay(car.popup);
    }

    var popupText = car.license + "\n" + car.endPlaceName + "\n" + common.getTimeFormatToString((car.arrivalTime - car.startTime));
    car.popup = popDialog.createCarInformation(car.id, startPoint, popupText, car.color);
};

dialog.deleteCar = function () {
    var carLicense = document.getElementById('modifyCarLicense').value;
    if (carLicense == "")
        return;

    var features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.car &&
            features[n].license == carLicense) {
            //stop car running
            if (features[n].stopMove != null) {
                features[n].stopMove();
            }
            //remove car and the popup belong to the car
            popDialog.deletePopDialog(features[n].id);
            map.removeOverlay(features[n].popup);
            map.getLayers().getArray()[common.carLayer].getSource().removeFeature(features[n]);
            if (common.sameCoordinate(features[n].getGeometry().getCoordinates(), constPosition.HaMi))
                carLicenseList.removeCar(features[n].license);
            $('#car').modal('hide');
            return;
        }
    }
    showMessageBox(constString.messageBoxTitleError, constString.carCanNotFound);
};

// var createCar = function (license,startPosition,endPosition,shortestRoads) {
//     var car = new ol.Feature({
//         geometry: new ol.geom.Point(startPoint)
//     });
//     //Set car information
//     car.id = new Date().getTime();
//     car.license = license;
//     startPoint = startPosition;
//     endPoint = endPosition;
//     car.startTime = new Date().getTime();
//     car.roads = shortestRoads;
//     car.currentRoadIndex = 0;
//     car.status = common.carStatus.move;
//     car.direct = common.sameCoordinate(startPoint,car.roads[car.currentRoadIndex].getGeometry().getFirstCoordinate());
//     car.popup = popDialog.createPopDialog(car.id,startPoint,car.license);
//
//     //car style
//     var style = new ol.style.Style({
//         // image: new ol.style.Icon({
//         //     // anchor: [0.5, 1],
//         //     src: "Image/Arrow.jpg"
//         // })
//         image: new ol.style.Circle({
//             radius: 7,
//             snapToPixel: false,
//             fill: new ol.style.Fill({color: 'black'}),
//             stroke: new ol.style.Stroke({
//                 color: 'white', width: 2
//             })
//         })
//     });
//
//     //Set car information
//     car.setStyle(style);
//
//     //////////////////////////////////////////////////////////////////////
//     //Public method
//     car.setPosition = function (position) {
//         car.getGeometry().setCoordinates(position);
//         car.popup.setPosition(position);
//     };
//
//
//     return car;
// };



