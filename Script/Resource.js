/**
 * Created by zhuwt on 2016/5/2.
 */
var constString = {
    //messageBox
    messageBoxTitleNotify:'提示',
    messageBoxTitleWarning:'警告',
    messageBoxTitleError:'错误',
    //Station size
    stationNotifyWarning:'气量不足',
    stationNotifyEmpty:'气量用尽',
    //Station check
    stationNameCannotBeEmpty:'站点名称不能为空，请输入一个合法的站点名称',
    stationNameDuplicate:"'站点名称'重复，请重新命名。",
    stationSizeIllegal:"'站点容量'不合法，请输入0到9999之间的数值。",
    stationConsumeIllegal:"'每小时消耗量'不合法，请输入0到9999之间的数值。",
    stationAlertIllegal:"'警戒量'不合法，请输入0到9999之间的数值,并且此值不能大于站点容量。",
    //Road check
    roadLengthIllegal:"'路线运行时间'不合法，请输入1到999之间的数值。",
    //Car error
    carLicenseCannotBeEmpty:'车牌号码不能为空，请输入一个合法的车牌号。',
    carCanNotFound:"无法找到指定的车辆进行删除。",
    startAndEndPositionCanNotBeSame:"起点与终点不能相同。",
    canNotFoundTheWay:"没有可供车辆行驶的路线，请创建路线后再创建车辆信息。",
    carLicenseDuplicate:"车牌号已经存在，请重新输入一个车牌号码。",
    delayTimeIllegal:"'延迟时间'不合法,请输入一个-24到24之间的数值",
    carArrival:"到达",
    carMoving:"运输中"
};

var constPosition = {
    HaMi:[10607319.289190479, 5090400.335679596],
    TianShui:[11769773.615351439, 4084489.0434466777],
    WuWei:[11426112.736181287, 4543722.709384017]
};