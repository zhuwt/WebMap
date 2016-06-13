/**
 * Created by zhuwt on 2016/5/2.
 */
var common = {
    //正式时间控制数据，基准为1小时
    stationUpdateInterval: 3600000,      //更新速度，默认是每小时更新一次。//快速测试的时候可以使用1000造成1秒的定时器时间来快速消耗气量
    stationBurnTime: 1,                 //每次更新时间的消耗量系数，默认是1//PS：消耗量公式是：消耗量/消耗系数
    roadLengthModulus: 3600000,         //道路时间系数，默认3600000，表示单位为小时。//PS：路程计算是通过用户输入的值乘系数的，1000表示秒，3600000表示小时。
    carMoveInterval:1000,               //车辆挪动时间，默认为1000，1000表示每达到1秒移动一次车辆。60000既表示1分钟挪动一次。
    //测试时间控制数据，基准为秒
    // stationUpdateInterval: 1000,
    // stationBurnTime: 1,
    // roadLengthModulus: 1000,
    // carMoveInterval:1000,
    /////////////////////////////
    floatUnit:1,
    mapLayer: 0,
    stationLayer: 1,
    carLayer: 2,
    saveTime:15*60*1000,
    geometryType: {
        car: "car",
        city: "city",
        road: "road",
        station: "station"
    },
    carRadioValue: {
        create: "create",
        modify: "modify"
    },
    carColors:["#ffffff","#5cb85c","#5bc0de","#f0ad4e","#d9534f"]
};

common.findTheShortestRoad = function (startPoint, endPoint) {
    //1,获取有指定起始点的道路。
    var points = [];
    var rightRoad = [];
    var findRoads = common.findLineStringFromPoint(startPoint);

    if (findRoads.length <= 0) {
        return {
            time: 0,
            roads: []
        };
    }//***找不到道路，直接返回
    else {
        //***找到道路
        for (var n = 0; n < findRoads.length; n++) {
            var anotherPoint = common.returnAnotherPointOfLineString(findRoads[n], startPoint);
            //2,如果道路的另一点就是终点，那么创建对象，直接放入数组
            var roadPoint = {
                currentRoad: findRoads[n],
                nextRoads: null
            };
            if (common.sameCoordinate(anotherPoint, endPoint)) {
                rightRoad.push(roadPoint);
            }
            else {
                points.push(startPoint);
                var nextSubRoad = common.findNextRoad(anotherPoint, findRoads[n], endPoint, points);
                if (nextSubRoad.length > 0) {
                    roadPoint.nextRoads = nextSubRoad;
                    rightRoad.push(roadPoint);
                }
            }
            points.length = 0;
        }
    }
    ///sum time
    var shortestRoad = {
        time: 0,
        roads: []
    };
    if (rightRoad.length > 0) {
        shortestRoad.time = common.getShortestRoadTime(rightRoad, 0, shortestRoad.roads);//var shortestTime =
        shortestRoad.roads.reverse();
    }

    return shortestRoad;
};

common.findNextRoad = function (roadStartPoint, road, endpoint, points) {
    // 首先根据传入的道路和道路的起始点，取传入道路的终点，并且根据终点获取下一段路的数组，如果获取不到，直接返回为空，表示没有路了，
    // 否则进行循环下一段路
    var backFlag = false;
    var rightRoad = [];
    var roadEndPoint = common.returnAnotherPointOfLineString(road, roadStartPoint);
    var nextRoads = common.findLineStringFromPoint(roadStartPoint);
    if (nextRoads.length <= 1) {
        return rightRoad;
    }
    else {
        for (var n = 0; n < nextRoads.length; n++) {
            if (common.StartPointAndEndPointOnLineString(nextRoads[n], roadStartPoint, roadEndPoint))
                continue;
            // 循环下一段路的时候，首先判断下一段路的终点是不是车辆行驶的终点，是：返回；不是：传入下一个递归进行运算。
            var anotherPoint = common.returnAnotherPointOfLineString(nextRoads[n], roadStartPoint);
            for (var m = 0; m < (points.length - 1); m++) {
                if (common.sameCoordinate(anotherPoint, points[m])) {
                    backFlag = true;
                    break;
                }
            }
            if (backFlag)
                continue;

            var roadPoint = {
                currentRoad: nextRoads[n],
                nextRoads: null
            };

            if (common.sameCoordinate(anotherPoint, endpoint)) {
                rightRoad.push(roadPoint);
            }
            else {
                points.push(roadStartPoint);
                var nextSubRoad = common.findNextRoad(anotherPoint, nextRoads[n], endpoint, points);
                if (nextSubRoad.length > 0) {
                    roadPoint.nextRoads = nextSubRoad;
                    rightRoad.push(roadPoint);
                }
            }
        }
    }
    return rightRoad;
};

common.getShortestRoadTime = function (roads, preTotalTime, shortestRoads) {
    var shortestTime = null;
    var shortRoads = null;
    for (var n = 0; n < roads.length; n++) {
        var tempTime = parseInt(roads[n].currentRoad.road.roadLength);
        var recordRoads = [];
        if (roads[n].nextRoads != null) {
            tempTime = common.getShortestRoadTime(roads[n].nextRoads, tempTime, recordRoads);
        }
        if (shortestTime == null) {
            shortestTime = tempTime;
            recordRoads.push(roads[n].currentRoad);
            shortRoads = recordRoads;
            continue;
        }
        if (tempTime < shortestTime) {
            shortRoads = [];
            shortestTime = tempTime;
            recordRoads.push(roads[n].currentRoad);
            shortRoads = recordRoads;
        }
    }
    for (var m = 0; m < shortRoads.length; m++) {
        shortestRoads.push(shortRoads[m]);//.roads
    }

    return shortestTime + preTotalTime;
};

common.findLineStringFromPoint = function (point) {
    var lineStrings = [];
    var features = map.getLayers().getArray()[1].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        //var geometry = features[n].getGeometry();
        if (features[n].geometryType == common.geometryType.road &&
            (common.sameCoordinate(features[n].getGeometry().getFirstCoordinate(), point) ||
            common.sameCoordinate(features[n].getGeometry().getLastCoordinate(), point)))
            lineStrings.push(features[n]);
    }
    return lineStrings;
};

common.returnAnotherPointOfLineString = function (lineString, point) {
    if (common.sameCoordinate(lineString.getGeometry().getFirstCoordinate(), point))
        return lineString.getGeometry().getLastCoordinate();
    else
        return lineString.getGeometry().getFirstCoordinate();
};

common.StartPointAndEndPointOnLineString = function (lineString, startPoint, endPoint) {
    return ((common.sameCoordinate(lineString.getGeometry().getFirstCoordinate(), startPoint) &&
    common.sameCoordinate(lineString.getGeometry().getLastCoordinate(), endPoint)) ||
    (common.sameCoordinate(lineString.getGeometry().getFirstCoordinate(), endPoint) &&
    common.sameCoordinate(lineString.getGeometry().getLastCoordinate(), startPoint)))
};

common.sameCoordinate = function (coordinateFirst, coordinateSecond) {
    return (coordinateFirst[0] == coordinateSecond[0] && coordinateFirst[1] == coordinateSecond[1]);
};

common.clearSelect = function (elementId) {
    var selectDom = document.getElementById(elementId);
    for (var n = selectDom.length - 1; n >= 0; n--) {
        selectDom.remove(n);
    }
};

common.findStationOrControlByName = function (name) {
    var features = map.getLayers().getArray()[1].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        //var geometry = features[n].getGeometry();
        if (features[n].geometryType == common.geometryType.city && features[n].pointName == name)
            return features[n];
        else if (features[n].geometryType == common.geometryType.station && features[n].station.stationName == name)
            return features[n];
    }

    return null;
};

common.findStationByName = function (name) {
    var features = map.getLayers().getArray()[1].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.station &&
            features[n].station.stationName == name)
            return features[n];
    }

    return null;
};

common.findCarByLicense = function (license) {
    var features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.car &&
            features[n].license == license) {
            return features[n];
        }
    }

    return null;
};

common.getTime = function (millisecond) {
    var hour = parseInt(millisecond / 3600000);
    return hour;
    // var day = parseInt(millisecond / 86400000);//day:24*60*60*1000
    // var hour = parseInt((millisecond - 86400000 * day) / 3600000);//hour:60*60*1000
    // var minutes = parseInt((millisecond - 86400000 * day - hour * 3600000) / 60000);//minutes:60*1000
    // var seconds = parseInt((millisecond - 86400000 * day - hour * 3600000 - minutes * 60000) / 1000);//minutes:60*1000
    // return {
    //     day: day,
    //     hour: hour,
    //     minutes: minutes,
    //     seconds: seconds
    // };
};

common.getTimeFormatToString = function (millisecond) {
    var time = common.getTime(millisecond);
    return time + "小时";
    // var time = common.getTime(millisecond);
    // return time.day + "天" + time.hour + "小时" + time.minutes + "分" + time.seconds + "秒";
};

common.PointRotation = function (PointA, PointB) {
    var Dx = PointB[0] - PointA[0];
    var Dy = PointB[1] - PointA[1];
    var Rotation = Math.atan2(Dy, Dx);
    return Rotation / Math.PI * 180;
};