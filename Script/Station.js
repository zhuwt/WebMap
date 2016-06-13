/**
 * Created by Bucky.zhu on 04/12/2016.
 */
/////////////////////////////////Create station dialog////////////////////////////////////
var dialog = {
    station: {},
    road: {},
    car: {}
};

dialog.createStation = function () {
    if (Draw.getActive()) {
        Draw.setActive(false);
        return;
    }
    Modify.setActive(false);

    dialog.car = null;
    dialog.station = {};
    document.getElementById('title').innerHTML = '创建站点';
    document.getElementById('stationName').value = '';
    document.getElementById('stationSize').value = '';
    document.getElementById('consumePerHour').value = '';
    document.getElementById('alertSize').value = '';
    document.getElementById('deleteStation').style.display = "none";
    document.getElementById('confirmButton').onclick = function () {
        var stationName = document.getElementById('stationName').value;
        var stationSize = document.getElementById('stationSize').value;
        var consumePerHour = document.getElementById('consumePerHour').value;
        var alertSize = document.getElementById('alertSize').value;
        //check Value
        if (!dialog.checkStationValue())
            return;

        //Start create station
        dialog.car = null;
        dialog.station.stationName = stationName;
        dialog.station.stationSize = stationSize;
        dialog.station.consumePerHour = consumePerHour;
        dialog.station.alertSize = alertSize;
        console.log("Create Station obj is: ");
        console.log(dialog.station);

        console.log('start draw station');
        Draw.setActive(true, 'Point');
        $('#createStation').modal('hide');
    };
    $('#createStation').modal({
        backdrop: false
    });
};

//////////////////////////Modify station dialog////////////////////////////////////////////
//每次修改完站点信息后需要清理站点计时器重新进行计时
dialog.modifyStation = function (feature) {
    dialog.car = null;
    //Manual modify html file dialog information and hook the confirm button
    document.getElementById('title').innerHTML = '修改站点';
    document.getElementById('deleteStation').style.display = null;
    var originalStationName = feature.station.stationName;
    document.getElementById('confirmButton').onclick = function () {
        //check Value
        if (originalStationName == document.getElementById('stationName').value) {
            if (!dialog.checkStationValueWithoutStationName())
                return;
        }
        else if (!dialog.checkStationValue())
            return;

        $('#createStation').modal('hide');
        feature.station.setStationInfo(document.getElementById('stationName').value,
            document.getElementById('stationSize').value,
            document.getElementById('consumePerHour').value,
            document.getElementById('alertSize').value);

        feature.station.checkGas();
        if (feature.station.consumePerHour != 0 && feature.station.stopTimer == null){
                feature.station.stopTimer = setTimeout(feature.station.burnGas(feature.station, feature.getGeometry().getCoordinates()), common.stationUpdateInterval);
        }
        displayStation.modifyStationLabel(feature.station.stationId, feature.station.stationName);
    };

    document.getElementById('deleteStation').onclick = function () {
        feature.station.stationSize = 0;
        if (feature.station.stopTimer != null){
            clearTimeout(feature.station.stopTimer);
            feature.station.stopTimer = null;
        }


        if (feature.station.popup != null){
            popDialog.deletePopDialog(feature.station.stationId);
            map.removeOverlay(feature.station.popup);
        }
        map.removeOverlay(feature.label);
        map.getLayers().getArray()[1].getSource().removeFeature(feature);
        Modify.select.getFeatures().forEach(Modify.select.getFeatures().remove, Modify.select.getFeatures());
        $('#createStation').modal('hide');
    };
    //Initial station information
    document.getElementById('stationName').value = feature.station.stationName;
    document.getElementById('stationSize').value = feature.station.stationSize;
    document.getElementById('consumePerHour').value = feature.station.consumePerHour;
    document.getElementById('alertSize').value = feature.station.alertSize;
    $('#createStation').modal({backdrop: false});
};

//check Value
dialog.checkStationValue = function () {
    var stationName = document.getElementById('stationName').value;
    if (stationName == '') {
        showMessageBox(constString.messageBoxTitleNotify, constString.stationNameCannotBeEmpty);
        return false;
    }

    if (common.findStationByName(stationName) != null) {
        showMessageBox(constString.messageBoxTitleNotify, constString.stationNameDuplicate);
        return false;
    }

    return dialog.checkStationValueWithoutStationName();
};

dialog.checkStationValueWithoutStationName = function () {
    var stationSize = document.getElementById('stationSize').value;
    var consumePerHour = document.getElementById('consumePerHour').value;
    var alertSize = document.getElementById('alertSize').value;
    if (stationSize == '' || stationSize < 0 || stationSize > 9999) {
        showMessageBox(constString.messageBoxTitleNotify, constString.stationSizeIllegal);
        return false;
    }
    if (consumePerHour == '' || consumePerHour < 0 || consumePerHour > 9999) {
        showMessageBox(constString.messageBoxTitleNotify, constString.stationConsumeIllegal);
        return false;
    }
    if (alertSize == '' || alertSize < 0 || alertSize > 9999 || parseInt(alertSize) > parseInt(stationSize)) {
        showMessageBox(constString.messageBoxTitleNotify, constString.stationAlertIllegal);
        return false;
    }
    return true;
};

var newStation = {
    //construction
    createStation: function (feature, name, size, consume, alert) {
        feature.station = {
            stationId: new Date().getTime(),
            stationName: name,
            stationSize: size,
            consumePerHour: consume,
            alertSize: alert,
            timeRunning: false
        };
        // feature.setId(new Date().getTime());
        feature.pointName = name;
        feature.geometryType = common.geometryType.station;
        feature.label = displayStation.createStationLabel(feature.station.stationId, feature.getGeometry().getCoordinates(), feature.station.stationName);
        var station = feature.station;
        var stationPosition = feature.getGeometry().getCoordinates();
        feature.station.burnGas = function (station) {
            return function () {
                console.log("station {"+ station.stationName +"}size is:" + station.stationSize + "   time is :" + new Date());
                if (station.reduceSize(stationPosition)) {
                    clearTimeout(feature.station.stopTimer);
                    feature.station.stopTimer = null;
                }
                else
                    feature.station.stopTimer = setTimeout(station.burnGas(station, stationPosition), common.stationUpdateInterval);
            };
        };

        //public method
        feature.station.setStationInfo = function (name, size, consume, alert) {
            feature.station.stationName = name;
            feature.station.stationSize = size;
            feature.station.consumePerHour = consume;
            feature.station.alertSize = alert;
        };

        feature.station.setPosition = function (position) {
            feature.getGeometry().setCoordinates(position);
            feature.label.setPosition(position);
            if (feature.station.popup != null)
                feature.station.popup.setPosition(position);
        };

        feature.station.removeOverlay = function () {
            if (feature.station.popup != null){
                popDialog.deletePopDialog(feature.station.stationId);
                map.removeOverlay(feature.station.popup);
                feature.station.popup = null;
            }
        };

        feature.station.reduceSize = function (point) {
            feature.station.stationSize -= parseFloat(feature.station.consumePerHour/common.stationBurnTime);
            return feature.station.checkGas(point);
        };

        feature.station.checkGas = function(point){
            if (feature.station.consumePerHour == 0 && feature.station.stopTimer != null){
                clearTimeout(feature.station.stopTimer);
                feature.station.stopTimer = null;
                feature.station.removeOverlay();
                return true;
            }

            //如果已经消耗光了就显示耗尽。
            if (feature.station.stationSize <= 0) {
                feature.station.stationSize = 0;
                if (feature.station.popup == null)
                    feature.station.popup = popDialog.createStation(feature.station.stationId, point, 0);
                else
                    popDialog.modifyPopDialogText(feature.station.stationId,0);
                return true;
            }
            //如果没有消耗光就要 判断是否修改。
            if (feature.station.stationSize <= feature.station.alertSize && feature.station.popup == null) {
                feature.station.popup = popDialog.createStation(feature.station.stationId, point, 0);
            }
            else {
                if (feature.station.stationSize > feature.station.alertSize) {
                    var text = ((feature.station.stationSize-feature.station.alertSize)/feature.station.consumePerHour).toFixed(common.floatUnit);
                    if (feature.station.popup == null)
                        feature.station.popup = popDialog.createStation(feature.station.stationId, point, text);
                    else
                        popDialog.modifyPopDialogText(feature.station.stationId,text);
                }
            }
            return false;
        };

        feature.station.popupWarningMessage = function (point) {
            feature.station.popup = popDialog.createStation(feature.station.stationId, point, constString.stationNotifyWarning);
        };

        return feature;
    }
};