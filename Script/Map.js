//Define a namespace for the application.
var app = {
    // moveCartCount: 0,
    ControlValue: false,
    modifyMode: false,
    ControlEvent: {},
    Stations: [],
    Road: []
};

//need understand
app.Drag = function () {
    ol.interaction.Pointer.call(this, {});
};
ol.inherits(app.Drag, ol.interaction.Pointer);

//city of wuwei
var cityOfWuWei = new ol.Feature({
    geometry: new ol.geom.Point(constPosition.WuWei)
});
cityOfWuWei.geometryType = common.geometryType.city;
cityOfWuWei.pointName = "武威";

//city of tianshui
var cityOfTianshui = new ol.Feature({
    geometry: new ol.geom.Point(constPosition.TianShui)
});
cityOfTianshui.geometryType = common.geometryType.city;
cityOfTianshui.pointName = "天水";

//city of HaMi
var cityOfHaMi = new ol.Feature({
    geometry: new ol.geom.Point(constPosition.HaMi)
});
cityOfHaMi.geometryType = common.geometryType.city;
cityOfHaMi.pointName = "哈密";

//设置矢量样式
var vector = new ol.layer.Vector({
    source: new ol.source.Vector({features: [cityOfWuWei, cityOfTianshui, cityOfHaMi]}),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 4
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: '#cc0000'//'#ffcc33'
            })
        })//,
        // 'carPointStyle': new ol.style.Style({
        //     image: new ol.style.Circle({
        //         radius: 7,
        //         snapToPixel: false,
        //         fill: new ol.style.Fill({color: 'black'}),
        //         stroke: new ol.style.Stroke({
        //             color: 'white', width: 2
        //         })
        //     })
        // })
    })
});

var vector2 = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 4
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: '#cc0000'//'#ffcc33'
            })
        })//,
        // 'carPointStyle': new ol.style.Style({
        //     image: new ol.style.Circle({
        //         radius: 7,
        //         snapToPixel: false,
        //         fill: new ol.style.Fill({color: 'black'}),
        //         stroke: new ol.style.Stroke({
        //             color: 'white', width: 2
        //         })
        //     })
        // })
    })
});


var projection = ol.proj.get("EPSG:3857");
var resolutions = [];
for (var i = 0; i < 19; i++) {
    resolutions[i] = Math.pow(2, 18 - i);
}
var tilegrid = new ol.tilegrid.TileGrid({
    origin: [0, 0],
    resolutions: resolutions
});

var baidu_source = new ol.source.TileImage({
    //projection: projection, //默认坐标系统就是3854，所以不用写，除非使用4326坐标系统
    tileGrid: tilegrid,
    tileUrlFunction: function (tileCoord, pixelRatio, proj) {
        if (!tileCoord) {
            return "";
        }
        var z = tileCoord[0];
        var x = tileCoord[1];
        var y = tileCoord[2];

        if (x < 0) {
            x = "M" + (-x);
        }
        if (y < 0) {
            y = "M" + (-y);
        }

        return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";
    }
});

// var baidu_layer = new ol.layer.Tile({
//     source: baidu_source
// });
/////////////////////////////Event///////////////
app.ControlEvent.setCar = function (car) {
    car.animating = true;
    console.log("car{" + car.license + "}start moveing.  Time is：" + new Date());
    var setCarNextStatus = function (car) {
        var text = "";
        var finalPosition = null;
        if (car.currentRoadIndex < (car.roads.length - 1)) {
            car.startTime += car.roads[car.currentRoadIndex].road.roadLength * common.roadLengthModulus;
            //get current road last point
            if (car.direct)
                finalPosition = car.roads[car.currentRoadIndex].getGeometry().getLastCoordinate();
            else
                finalPosition = car.roads[car.currentRoadIndex].getGeometry().getFirstCoordinate();
            // car.setPosition(finalPosition);
            text = car.license + "\n" + car.endPlaceName + "\n" + common.getTimeFormatToString(car.arrivalTime-new Date().getTime());
            popDialog.modifyPopDialogText(car.id,text);
            car.getGeometry().setCoordinates(finalPosition);
            car.popup.setPosition(finalPosition);
            //set next road
            car.currentRoadIndex++;
            //set move direct
            car.direct = common.sameCoordinate(finalPosition, car.roads[car.currentRoadIndex].getGeometry().getFirstCoordinate());
        } else {
            if (car.direct)
                finalPosition = car.roads[car.currentRoadIndex].getGeometry().getLastCoordinate();
            else
                finalPosition = car.roads[car.currentRoadIndex].getGeometry().getFirstCoordinate();

            text = car.license + "\n" + car.endPlaceName + "\n" + constString.carArrival;
            popDialog.modifyPopDialogText(car.id,text);
            car.getGeometry().setCoordinates(finalPosition);
            car.popup.setPosition(finalPosition);
            console.log("car{" + car.license + "}arrival!");
            console.log('End Move!' + new Date());
            car.animating = false;
            car.stopMove = null;
            map.un('postcompose', carMove);
            if (common.sameCoordinate(finalPosition,common.positionOfHaMi))
                carLicenseList.addCar(car.license,car.color);
        }
    };

    var carMove = function (e) {
        var vectorContext = e.vectorContext;
        if (car.animating) {
            var elapsedTime = (new Date().getTime()) - car.startTime;
            if (elapsedTime < 0){
                // tell OL3 to continue the postcompose animation
                map.render();
                return;
            }
            var index = Math.round(elapsedTime / common.carMoveInterval);
            var roadLength = car.roads[car.currentRoadIndex].road.roadLength * common.roadLengthModulus/1000;

            if (index >= roadLength) {
                setCarNextStatus(car);
                return;
            }

            var moveCoordinate = null;
            if (car.direct)
                moveCoordinate = car.roads[car.currentRoadIndex].getGeometry().getCoordinateAt(index / roadLength);
            else
                moveCoordinate = car.roads[car.currentRoadIndex].getGeometry().getCoordinateAt(1 - index / roadLength);
            var text = car.license + "\n" + car.endPlaceName + "\n" + common.getTimeFormatToString(car.arrivalTime-new Date().getTime());
            popDialog.modifyPopDialogText(car.id,text);
            car.getGeometry().setCoordinates(moveCoordinate);
            car.popup.setPosition(moveCoordinate);
            vectorContext.drawFeature(car, car.getStyle());
        }
        // tell OL3 to continue the postcompose animation
        map.render();
    };
    map.on('postcompose', carMove);

    car.stopMove = function () {
        map.un('postcompose', carMove);
        car.stopMove = null;
    };

    map.render();
};

app.ControlEvent.invisible = function () {
    map.getLayers().getArray()[common.mapLayer].setVisible(!map.getLayers().getArray()[common.mapLayer].getVisible());
};

app.ControlEvent.fullScreen = function () {
    map.getLayers().getArray()[common.mapLayer].setVisible(!map.getLayers().getArray()[common.mapLayer].getVisible());
};
/////////////////////////////control/////////////
// app.DrawStation = function (option) {
//     var options = option || {};
//     var element = document.getElementById('stationControl');
//
//     ol.control.Control.call(this, {
//         element: element,
//         target: options.target
//     });
// };
// ol.inherits(app.DrawStation, ol.control.Control);

var map = new ol.Map({
    controls: ol.control.defaults({
        attributionOptions: ({collapsible: false})
    }).extend([
        // new ol.control.FullScreen()
    ]),
    interactions: ol.interaction.defaults().extend([new app.Drag()]),
    // overlays: [overlay,overlay1],
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: baidu_source
        }),
        vector,
        vector2
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([100, 35.82]),
        zoom: 5,
        minZoom: 5
        // maxZoom: 5
    })
});
// console.log(map.getLayers().getArray()[common.stationLayer].getSource().getFeatures());


/////////////////////////////Draw function///////
var Modify = {
    status : false,
    init: function () {
        this.select = new ol.interaction.Select();
        map.addInteraction(this.select);

        this.modify = new ol.interaction.Modify({
            features: this.select.getFeatures()
        });
        map.addInteraction(this.modify);

        this.setEvents();
    },
    setEvents: function () {
        var selectedFeatures = this.select.getFeatures();

        this.select.on('change:active', function () {
            selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
        });

        this.select.on('select', function (arg) {
            if (arg.selected.length > 0) {
                switch (arg.selected[0].geometryType) {
                    case common.geometryType.city:
                        selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                        break;
                    case common.geometryType.station:
                        dialog.modifyStation(arg.selected[0]);
                        break;
                    case common.geometryType.road:
                        dialog.modifyRoad(arg.selected[0]);
                        break;
                }
            }
            if (arg.deselected.length > 0) {
                switch (arg.deselected[0].geometryType) {
                    case common.geometryType.city:
                        selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
                        break;
                    case common.geometryType.station:
                        arg.deselected[0].station.setPosition(arg.deselected[0].getGeometry().getCoordinates());
                        break;
                    case common.geometryType.road:
                        // dialog.modifyRoad(arg.deselected[0].road);
                        break;
                }
            }
        });
    },
    setActive: function (active) {
        if (active){
            map.getLayers().getArray()[common.carLayer].setVisible(false);
            document.getElementById('statusControlModify').style.display=null;
        }
        else{
            map.getLayers().getArray()[common.carLayer].setVisible(true);
            document.getElementById('statusControlModify').style.display="none";
        }


        Modify.status = active;
        this.select.setActive(active);
        this.modify.setActive(active);
    },
    getActive:function(){
        return Modify.status;
    }
};
Modify.init();

var Draw = {
    init: function () {
        map.addInteraction(this.Point);
        this.Point.setActive(false);
        map.addInteraction(this.LineString);
        this.LineString.setActive(false);
        // map.addInteraction(this.Polygon);
        // this.Polygon.setActive(false);
    },
    Point: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('Point')
    }),
    LineString: new ol.interaction.Draw({
        source: vector.getSource(),
        type: /** @type {ol.geom.GeometryType} */ ('LineString')
    }),
    // Polygon: new ol.interaction.Draw({
    //     source: vector.getSource(),
    //     type: /** @type {ol.geom.GeometryType} */ ('Polygon')
    // }),
    getActive: function () {
        return this.activeType ? this[this.activeType].getActive() : false;
    },
    setActive: function (active, type) {
        if (active) {
            this.activeType && this[this.activeType].setActive(false);
            this[type].setActive(true);
            this.activeType = type;
        } else {
            this.activeType && this[this.activeType].setActive(false);
            this.activeType = null;
        }
    }
};
Draw.init();

Draw.setActive(false, '');
Modify.setActive(false);

// The snap interaction must be added after the Modify and Draw interactions
// in order for its map browser event handlers to be fired first. Its handlers
// are responsible of doing the snapping.
var snap = new ol.interaction.Snap({
    source: vector.getSource()
});

map.addInteraction(snap);

map.on('click', function (event) {
    console.log('Click the map.    Click event is :');
    console.log(event);
    // console.log(event.coordinate);
    // console.log(map.getLayers().getArray()[1].getSource().getFeatures());
    // selectedFeatures.clear();
    //infoBox.innerHTML = '&nbsp;';
});

//////////////Draw Event/////////////////////////
Draw.Point.on('drawend', function (arg) {
    if (dialog.station != null) {
        var feature = newStation.createStation(arg.feature, dialog.station.stationName, dialog.station.stationSize, dialog.station.consumePerHour, dialog.station.alertSize);
        if (feature.station.consumePerHour != 0)
            feature.station.stopTimer = setTimeout(feature.station.burnGas(arg.feature.station, arg.feature.getGeometry().getCoordinates()), 1000);
        app.Stations.push(arg.feature);
        console.log('station objects are :');
        console.log(app.Stations);
    } else {
        arg.feature.geometryType = common.geometryType.car;
        arg.feature.pointName = dialog.car.carLicense;
        arg.feature.car = {
            carLicense: dialog.car.carLicense
        };
    }

    Draw.setActive(false, 'Point');
});

Draw.LineString.on('drawend', function (arg) {
    arg.feature.geometryType = common.geometryType.road;
    arg.feature.road = {
        roadLength: dialog.road.roadLength
    };
    arg.feature.setId(new Date().getTime());
    app.Road.push(arg.feature);
    console.log('road object are :');
    console.log(arg.feature.road);
    Draw.setActive(false, 'LineString');
});

app.ControlEvent.SetModifyStatus = function () {
    Modify.setActive(!Modify.getActive());
};

app.ControlEvent.save = function () {
    console.log('*****saved******!');
    var roadCount = 0;
    var ls = localStorage;
    ls.clear();
    var features = map.getLayers().getArray()[common.stationLayer].getSource().getFeatures();
    for (var n = 0; n < features.length; n++) {
        if (features[n].geometryType == common.geometryType.station){
            var stationObj = {
                stationName: features[n].station.stationName,
                stationSize: features[n].station.stationSize,
                consumePerHour: features[n].station.consumePerHour,
                alertSize: features[n].station.alertSize,
                position: features[n].getGeometry().getCoordinates(),
                type: common.geometryType.station
            };
            var stringStationObj = JSON.stringify(stationObj);
            ls.setItem("站点-" + stationObj.stationName, stringStationObj);
            continue;
        }
        if (features[n].geometryType == common.geometryType.road){
            var roadObj = {
                roadLength:features[n].road.roadLength,
                coordinates:features[n].getGeometry().getCoordinates(),
                type: common.geometryType.road
            };
            var stringRoadObj = JSON.stringify(roadObj);
            ls.setItem("路线-" + (++roadCount), stringRoadObj);
        }
    }
    features = map.getLayers().getArray()[common.carLayer].getSource().getFeatures();
    for (n = 0; n < features.length; n++){
        var strRoads = "";
        for (var m=0;m<features[n].roads.length;m++){
            var innerRoadObj = {
                roadLength:features[n].roads[m].road.roadLength,
                coordinates:features[n].roads[m].getGeometry().getCoordinates(),
                type: common.geometryType.road
            };
            strRoads += JSON.stringify(innerRoadObj) + "#^$";
        }
        var carObj = {
            type:common.geometryType.car,
            license:features[n].license,
            startPlaceName:features[n].startPlaceName,
            endPlaceName:features[n].endPlaceName,
            startPoint:features[n].startPoint,
            road:strRoads,
            totalTime:features[n].totalTime,
            startTime:features[n].startTime,
            arrivalTime:features[n].arrivalTime,
            direct:features[n].direct,
            color:features[n].color
        };
        var stringCarObj = JSON.stringify(carObj);
        ls.setItem("车辆-" + features[n].license, stringCarObj);
    }

    setTimeout("app.ControlEvent.save()",common.saveTime);
};

app.ControlEvent.load = function () {
    //map style
    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 4
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: '#cc0000'//'#ffcc33'
            })
        })
    });

    //create Station
    var createStation = function (obj) {
        var newFeature = new ol.Feature({
            geometry: new ol.geom.Point(obj.position)
        });
        newFeature.geometryType = common.geometryType.station;
        newFeature.setStyle(style);
        var feature = newStation.createStation(newFeature, obj.stationName, obj.stationSize, obj.consumePerHour, obj.alertSize);
        map.getLayers().getArray()[common.stationLayer].getSource().addFeature(feature);
        if (feature.station.consumePerHour != 0)
            feature.station.stopTimer = setTimeout(feature.station.burnGas(feature.station, feature.getGeometry().getCoordinates()), 1000);
    };

    var createCar = function (obj) {
        //craete car feature
        var car = new ol.Feature({
            geometry: new ol.geom.Point(obj.startPoint)
        });
        var style = null;
        if (endPoint[0] - startPoint[0] >= 0 ){
            style = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: "Image/truckRight.png"
                    // rotation:rotation
                })
            });
        }else{
            style = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    src: "Image/truckLeft.png"
                    // rotation:rotation
                })
            });
        }
        //Set car information
        car.id = new Date().getTime();
        car.license = obj.license;
        car.geometryType = common.geometryType.car;
        car.animating = false;
        car.setStyle(style);
        car.startPlaceName = obj.startPlaceName;
        car.endPlaceName = obj.endPlaceName;
        car.startPoint = obj.startPoint;
        car.roads = obj.roads;
        car.currentRoadIndex = 0;
        car.totalTime = obj.totalTime;
        car.startTime = obj.startTime;
        car.arrivalTime = obj.arrivalTime;
        car.direct = obj.direct;
        car.color = obj.color;
        //set popup
        var popupText = car.license + "\n" + car.endPlaceName + "\n" + common.getTimeFormatToString((car.arrivalTime - car.startTime));
        car.popup = popDialog.createCarInformation(car.id,car.startPoint,popupText,car.color);

        map.getLayers().getArray()[common.carLayer].getSource().addFeature(car);
        car.getGeometry().setCoordinates(car.startPoint);
        car.popup.setPosition(car.startPoint);
        app.ControlEvent.setCar(car);
    };

    //loop the objects
    var ls = localStorage;
    var count = ls.length;
    for (var n = 0; n < count; n++) {
        var stringObject = ls.getItem(ls.key(n));
        var obj = JSON.parse(stringObject);
        switch (obj.type) {
            case common.geometryType.station:
                createStation(obj);
                break;
            case common.geometryType.road:
                var newFeature = new ol.Feature({
                    geometry: new ol.geom.LineString(obj.coordinates)
                });
                newFeature.geometryType = common.geometryType.road;
                newFeature.road = {
                    roadLength: obj.roadLength
                };
                newFeature.setStyle(style);
                map.getLayers().getArray()[common.stationLayer].getSource().addFeature(newFeature);
                break;
            default:
                break;
        }
    }
    //loop the objects
    for (var m = 0; m < count; m++) {
        var strObject = ls.getItem(ls.key(m));
        var carObj = JSON.parse(strObject);
        if (common.geometryType.car == carObj.type){
            carObj.roads = [];
            var strRoad = carObj.road.split("#^$");
            for (var j=0;j<strRoad.length;j++){
                if (strRoad[j] != ""){
                    var roadObject = JSON.parse(strRoad[j]);
                    newFeature = new ol.Feature({
                        geometry: new ol.geom.LineString(roadObject.coordinates)
                    });
                    newFeature.geometryType = common.geometryType.road;
                    newFeature.road = {
                        roadLength: roadObject.roadLength
                    };
                    newFeature.setStyle(style);
                    carObj.roads.push(newFeature);
                }
            }
            createCar(carObj);
        }
    }
};

function autoSave(){

    setTimeout("app.ControlEvent.save()",common.saveTime);//900000
}
autoSave();

var test = function () {
    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false
    });
    popup.setPosition(common.positionOfHaMi);
    $(element).popover({
        'placement': 'top',
        'html': true,
        'content': 'fdsafdsafdsa'
    });
    $(element).popover('show');
};