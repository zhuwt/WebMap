/**
 * Created by zhuwt on 2016/5/2.
 */
///////////////////////////Create road dialog////////////////////////////////////////////
dialog.createRoad = function () {
    if (Draw.getActive()) {
        Draw.setActive(false);
        return;
    }
    Modify.setActive(false);

    document.getElementById('roadTitle').innerHTML = '创建路线';
    document.getElementById('RoadLength').value = '';
    document.getElementById('deleteRoad').style.display = "none";
    document.getElementById('confirmRoadInfo').onclick = function () {
        if (dialog.checkRoadValue() == false)
            return;

        dialog.road.roadLength = document.getElementById('RoadLength').value;
        console.log("Road obj is: ");
        console.log(dialog.road);

        console.log('start draw road');
        Draw.setActive(true, 'LineString');
        $('#createRoad').modal('hide');
    };

    $('#createRoad').modal({backdrop: false});
};

///////////////////////////Modify road dialog////////////////////////////////////////////
dialog.modifyRoad = function (feature) {
    document.getElementById('roadTitle').innerHTML = '修改路线';
    document.getElementById('deleteRoad').style.display = null;
    document.getElementById('confirmRoadInfo').onclick = function () {
        if (dialog.checkRoadValue() == false)
            return;

        feature.road.roadLength = document.getElementById('RoadLength').value;
        $('#createRoad').modal('hide');
    };
    document.getElementById('deleteRoad').onclick = function () {
        map.getLayers().getArray()[1].getSource().removeFeature(feature);
        Modify.select.getFeatures().forEach(Modify.select.getFeatures().remove, Modify.select.getFeatures());
        $('#createRoad').modal('hide');
    };

    document.getElementById('RoadLength').value = feature.road.roadLength;
    $('#createRoad').modal({backdrop: false});
};

dialog.checkRoadValue = function () {
    var roadLength = document.getElementById('RoadLength').value;
    if (roadLength == '' || roadLength < 1 || roadLength>999){
        showMessageBox(constString.messageBoxTitleNotify,constString.roadLengthIllegal);
        return false;
    }

    return true;
};