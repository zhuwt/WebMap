/**
 * Created by Bucky.Zhu on 05/11/2016.
 */
carLicenseList = {
    addCar: function (carLicense,color) {
        var container = document.getElementById("carLicense");
        var ulCarList = document.getElementById("ulCarList");
        var item = document.createElement("li");
        item.className = "list-group-item";
        item.innerHTML = carLicense;
        item.onclick = function(){
            dialog.displayCarInformation(carLicense);
        };
        if (color != null)
            item.style.backgroundColor = color;
        ulCarList.appendChild(item);

        if (carLicenseList.hyperLinkCount() > 1)
            container.style.display = null;
    },
    removeCar: function (carLicense) {
        var container = document.getElementById("carLicense");
        var ulCarList = document.getElementById("ulCarList");
        for (var n = 0; n < ulCarList.childNodes.length; n++) {
            if (ulCarList.childNodes[n].innerHTML == carLicense) {
                var item = ulCarList.childNodes[n];
                ulCarList.removeChild(item);
            }
        }

        if (carLicenseList.hyperLinkCount() < 2)
            container.style.display = "none";
    },
    hyperLinkCount: function () {
        var count = 0;
        var container = document.getElementById("ulCarList");
        for (var n = 0; n < container.childNodes.length; n++) {
            if (container.childNodes[n].nodeName == "LI") {
                count++;
            }
        }
        return count;
    }
};
// carLicenseList.addCar = function (carLicense) {
//     var container = document.getElementById("carLicense");
//     var item = document.createElement("a");
//     item.href = "#";
//     item.className = "list-group-item";
//     item.innerHTML = carLicense;
//     container.appendChild(item);
//
//     if (container.childNodes.length > 3)
//         container.style.display = true;
// };
//
// carLicenseList.removeCar = function (carLicense) {
//     var container = document.getElementById("carLicense");
//     for (var n=0;n<container.childNodes.length;n++){
//         if (container.childNodes[n].innerHTML == carLicense){
//             var item = container.childNodes[n];
//             container.removeChild(item);
//         }
//     }
//
//     if (container.childNodes.length < 3)
//         container.style.display = "none";
// };