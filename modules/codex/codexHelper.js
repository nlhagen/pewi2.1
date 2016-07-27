var dataHolder ;
var elementNum ;
var elementHeight;

function init() {

    
  $.ajax({
       async: false,
       type: "GET",
       url: './codexResources/mainTEST.dat',
       dataType: "text",
       contentType: "application/x-www-form-urlencoded;charset=UTF-8",
       success: function (data) {
           setUp(data);
       }
    });
}


function setUp(data){
  
    var strRawContents = data;
    //split based on escape chars
    while (strRawContents.indexOf("\r") >= 0)
        strRawContents = strRawContents.replace("\r", "");
    var arrLines = strRawContents.split("\n");

    var tableString = "";

    dataHolder = Array(arrLines.length) ;
    elementNum = Array(arrLines.length) ;
    elementHeight = Array(arrLines.length) ;

    var padding = 20 ; //increase by 20 each sub category
    var i = 0 ;
    var tempElementHolder = [0,0,0,0,0,0,0,0,0];
    var tempIndexHolder = [0,0,0,0,0,0,0,0,0,0] ;
    var current = -1;
    
    
    
    while(i<arrLines.length){
        
        var char = arrLines[i][0] ;
        
        //console.log(arrLines[i]) ;
        
        switch(char){
            case '#':
                tableString += establishHeader(i,arrLines[i],arrLines[i+1],arrLines[i+2],padding);
                
                tableString += "<div id='" + i + "sub' class='subHolder'>" ;
                padding += 20 ;
                
                current += 1 ;
                tempIndexHolder[current] = i ;

                if(current>0){
                    tempElementHolder[current - 1] += 1 ;
                }
                
                i += 3 ;
                
                break;
            case '@':
                tableString += establishElement(i,arrLines[i],arrLines[i+1],arrLines[i+2],arrLines[i+3],padding);
                
                tempElementHolder[current] += 1 ;
                
                
                i += 4 ;
                break ;
            case '$':
                
                elementNum[tempIndexHolder[current]] = tempElementHolder[current] ;
                tempElementHolder[current] = 0 ;
                current -= 1 ;
                
                //end subholder
                tableString += '</div>' ;
                padding -= 20 ;
                i += 1 ;
                break ;
            default :
                i+= 1;
        }
    
    //console.log(current);
    //console.log(tempElementHolder);
    //console.log(tempIndexHolder[current]);
    //console.log("----");
  
    }
  
  
  
    document.getElementById('indexHolder').innerHTML = tableString ;
    estalishHeights() ;

}


function establishHeader(i, line1, line2, line3, padding){
    
    var tempString = " ";
    
    tempString += "<div id='" + i + "' class='groupHeader' onmouseover='this.focus()' onclick='arrangeDisplay(" + i + "); toggleChild(" + i + ");' style='padding-left:" + padding + "px;' >" ;
         
    tempString += line1.slice(2) ;
      
    tempString += "</div>" ; 
    
    
    dataHolder[i] = {} ;
             
    dataHolder[i].square1 = line2 ;
             
    dataHolder[i].square2 = line3 ;  
    
    dataHolder[i].title = line1.slice(3) ;
    
    
    return tempString ;
}

function establishElement(i, line1, line2, line3, line4, padding){
    
    var tempString = "";
    
    tempString += "<div id='" + i + "' class='groupElement' onclick='arrangeDisplay(" + i + ");' style='padding-left:" + padding + "px;' >" ;
       
    tempString += line1.slice(2) ;
      
    tempString += "</div>" ; 
             

             
    dataHolder[i] = {} ;
             
    dataHolder[i].square1 = line2 ;
             
    dataHolder[i].square2 = line3 ;
    
    dataHolder[i].hasMore = line4 ;

    dataHolder[i].title = line1.slice(3) ;

    return tempString
    
}

function estalishHeights() {
    
    heightConstant = 35 ;
    
    for(var i=0; i < elementNum.length; i++){
        if(elementNum[i]){
            elementHeight[i] = heightConstant * elementNum[i] ;
        }
    }
    
    
}

function toggleChild(value) {
    
    var childString = value + "sub" ;
    
    var heightString = (heightConstant * elementNum[value]) + "px" ;
    heightString = elementHeight[value] + "px" ;

    if(document.getElementById(value).className == "groupHeader") {
        document.getElementById(childString).style.visibility = "visible" ;
        document.getElementById(childString).style.height = heightString ;
        document.getElementById(value).className = "selectedGroupHeader" ;
        
        var text = document.getElementById(value).innerHTML ;
        text = text.slice(1) ;
        text = "&ndash;" + text ;
        document.getElementById(value).innerHTML = text ;
        
        resizeSection(value,'expand') ;
        
    }
    else if(document.getElementById(value).className == "selectedGroupHeader"){
        document.getElementById(childString).style.height = "0px" ;
        document.getElementById(childString).style.visibility = "hidden" ;
        document.getElementById(value).className = "groupHeader" ;
        
        var text = document.getElementById(value).innerHTML ;
        text = text.slice(1) ;
        text = "+" + text ;
        document.getElementById(value).innerHTML = text ;
        
        resizeSection(value,'shrink')
        
    }

}


function arrangeDisplay(value) {

   document.getElementById('square1').innerHTML = dataHolder[value].square1 ;
   document.getElementById('square2frame').src = dataHolder[value].square2  ;
   
   console.log( dataHolder[value].hasMore ) ;
   if(dataHolder[value].hasMore && dataHolder[value].hasMore == "1"){
       document.getElementById('switchContentDepth').style.display = "block" ;
        document.getElementById('switchContentDepth').onclick = function() { showAdvanceDetail(value) } ;
   }
   else{
       document.getElementById('switchContentDepth').style.display = "none" ;
   }
   
   document.getElementById('title').innerHTML = dataHolder[value].title.toUpperCase() ;
   

    
    var element = document.getElementsByClassName('selectedGroupElement');
    if(element.length > 0) {
        element[0].className = 'groupElement';
    }
    
    if(document.getElementById(value).className == 'groupElement'){
        document.getElementById(value).className = 'selectedGroupElement' ; 
    }
    

    
}

function resizeSection(value,operation){
   
   
    var currentPadding = document.getElementById(value).style.paddingLeft ;
    currentPadding = currentPadding.slice(0,-1);
    currentPadding = currentPadding.slice(0,-1);
    currentPadding = Number(currentPadding) ;
   
   var i = value - 1;
   var onwards = 1 ;
   //find the number of open headers that are in parent
   while(i >= 0 && onwards){
    

       //if the element above is a open group header
       if(document.getElementById(i) && document.getElementById(i).className == "selectedGroupHeader") {
           
           //if the element is some parent container
           var elementPadding = document.getElementById(i).style.paddingLeft ;
            elementPadding = elementPadding.slice(0,-1);
            elementPadding = elementPadding.slice(0,-1);
            elementPadding = Number(elementPadding) ;
           
            if(elementPadding < currentPadding){
                
            var string = document.getElementById((i + "sub")).style.height ;
            string = string.slice(0,-1);
            string = string.slice(0,-1);
            
            if(operation == 'expand') string = Number(string) + elementHeight[value]  ;
            if(operation == 'shrink') string = Number(string) - elementHeight[value] ;
            
            document.getElementById((i + "sub")).style.height = string + "px" ;
            elementHeight[i] = string ;
            
            }
           
           if(elementPadding == 20) onwards = 0 ;
           
        }
       
       i -= 1 ;
       
   }
   
   //var string = document.getElementById('0sub').style.height ;
   //string = string.slice(0,-1);
   //string = string.slice(0,-1);
   //string = Number(string) + 100 ;
   //alert(string) ;
   //document.getElementById('0sub').style.height = string + "px" ;
}

function onDocumentKeyDown(event) {

   switch(event.keyCode){
        case 73:
            parent.toggleIndex();
            break ;
    }

} //end onDocumentKeyDown

function showAdvanceDetail(value) {
    var string = dataHolder[value].square2 ;
    string = string.slice(0,-5) + "More.html";
    document.getElementById('square2frame').src =  string ;
    document.getElementById('switchContentDepth').innerHTML = "Less"
    document.getElementById('switchContentDepth').onclick = function() { showLessDetail(value) ;} ;
}

function showLessDetail(value){
    document.getElementById('square2frame').src = dataHolder[value].square2;
    document.getElementById('switchContentDepth').innerHTML = "Deeper"
    document.getElementById('switchContentDepth').onclick = function() { showAdvanceDetail(value) ;} ;
}