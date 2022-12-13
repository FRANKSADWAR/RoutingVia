var arr_one = [636134,624796,110776,23121,65349,96868];
var arr_main = new Array();

function updateArrays(){
    for (var i = 0; i < arr_one.length; i ++){
        arr_main.push(arr_one.slice(i,i+2));
    }
    
    if (arr_main.length % 2 !==0){
        arr_main.pop(arr_main[arr_main.length]);
    }
    else if (arr_main.length % 2 == 0){
        arr_main.pop(arr_main[arr_main.length]);
    }
    console.log(arr_main);
}
updateArrays();