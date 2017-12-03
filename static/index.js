//Global Data Object
var dataobj = null;

//Global Timer var
var timeout_id = 0;

//Update History every 5 seconds
setInterval(gethistory,5000);

//Get History Function
function gethistory(){
    $.get("/get_hist").done(function(data){
        //Reset hist box
        $("#history").text("");
        if(data==""){
            return;
        }
        histobj = JSON.parse(data);
        for(i=0; i<histobj.hist.length;i++){
            $("#history").append(histobj.hist[i] + "<br/>");
        }
    });
}

//Set History Function
function sethistory(){
    clearTimeout(timeout_id);
    $.post("/set_hist",dataobj.query);
}

//Query Function
$(document).ready(function(){
    gethistory();
    $("#search").keyup(function(){
        clearTimeout(timeout_id);
        var input = $(this).val();
        if(input == ""){
            $("#result").text("Enter something to search!"); 
            $("#index").text("");
            $("#status").text("");
        } else{
            $("#input").text(input);
            $.post("/search",input).done(function(data){
                clearTimeout(timeout_id)
                timeout_id = setTimeout(sethistory,2000);
                dataobj = JSON.parse(data);
                if(dataobj.foundcount == 0){
                    $("#result").text("Nothing Found!");
                    $("#index").text("");
                }else{
                    dataobj.position = 1;
                    displaydata(false);
                }

            });
        }
    });
});

//Display Data Function
function displaydata(back_track){
    //Create temporary iterator cap
    var temp_iter = 0;
    if(back_track==true){
        if(dataobj.position==dataobj.foundcount+1){
            dataobj.position -= (dataobj.foundcount%10) + 10;
        }else{
            dataobj.position -= 20; 
        }
        temp_iter = dataobj.position+10;
    }else{
        if(dataobj.position+10 > dataobj.foundcount){
            temp_iter = dataobj.foundcount+1;
        }else{
            temp_iter = dataobj.position + 10;
        }
    }
    //Display index stats
    $("#index").text(dataobj.position+"-"+(temp_iter-1)+"/"+dataobj.foundcount);
    //Reset result element first
    $("#result").text("");
    do{
        $("#result").append("<div id='subresult'>");
        $("#result").append(dataobj.position +".  ");
        //Highlight query term in Title if there
        var title = highlight(dataobj.entries[dataobj.position-1][0],dataobj.query);
        //Print Title
        $("#result").append("<a href='"+dataobj.entries[dataobj.position-1][1]+"'>"+ title +"</a>");
        $("#result").append("<br/>Abstract: ");
        //Highlight query term in abstract
        var abs = highlight(dataobj.entries[dataobj.position-1][2],dataobj.query);
        //Print Abstract
        $("#result").append(abs);
        $("#result").append("</div>");
        $("#result").append("<br/><br/>");
        dataobj.position++;
    }while(dataobj.position<temp_iter);        
}
//Highlight all query keywords in text in html
function highlight(data_string, query){
    //Create RegEx
    var re = new RegExp(query,'i');
    var full_string = "";
    var new_string = data_string;
    var index = 0;
    while(true){
        index = new_string.search(re);
        if(index == -1){
            full_string += new_string;
            break;
        }
        var beg_string = new_string.slice(0,index);
        var mid_string = new_string.slice(index,index+query.length);
        var end_string = new_string.slice(index+query.length,);
        full_string += beg_string + "<span id='hi'>" + mid_string + "</span>";
        new_string = end_string;
    }
    return full_string;
}
//Display Next Page Function
function displaynext(){
    //Reset status first
    $("#status").text("");
    //Check if there is more to display
    if(dataobj.position>=dataobj.foundcount){
        $("#status").text("No more results Left");
    }else{
        displaydata(false);
    }
}


//Display Previous Page Function
function displayprev(){
    //Reset status first
    $("#status").text("");
    //Check if already reached front page
    if(dataobj.position-10<=1){
        $("#status").text("Already at first page");
    }else{
        displaydata(true);
    }
}
