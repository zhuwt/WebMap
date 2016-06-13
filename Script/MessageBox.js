/**
 * Created by zhuwt on 2016/5/2.
 */
function showMessageBox(title,text) {
    document.getElementById('messageBoxTitle').innerHTML = title;
    document.getElementById('textOfMessageBox').innerHTML = text;
    $('#messageBox').modal({
        backdrop:false
    });
}

// showMessageBox("警告","测试警告信息");