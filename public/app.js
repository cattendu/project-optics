var app = angular.module("partBuilderApp", ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('!');
    $routeProvider
        .when('/', {
            templateUrl: './views/home.htm',
        })
        .when('/fiber-cable-assemblies', {
            templateUrl: './views/sections/8/fiber-cable-assemblies.htm',
            controller: 'fiberCableAssembliesController'
        })
        .otherwise({
            redirectTo: '/',
            controller: 'partBuilderController'
        })
    ;
}]);

app.controller('fiberCableAssembliesController', ['$scope', '$http', '$route', '$location', function ($scope, $http, $route, $location) {
    const DEFAULT_TAB = "FA";
    var currentTab;


    // DEFAULT TAB
    $http.get("/partNumber/" + DEFAULT_TAB).success(function (partNumberMatrix) {
        init(partNumberMatrix);
        currentTab = DEFAULT_TAB;
    });
    
    // LOAD TAB PNM
    $scope.loadTab = function(tabToLoad){
        if (tabToLoad != currentTab){
            $http.get("/partNumber/" + tabToLoad).success(function (partNumberMatrix) {
                init(partNumberMatrix);
                currentTab = tabToLoad;
            });
        }
    };

    // INITIALIZE CONTROLLER DATA FROM DATABASE RESPONSE
    var init = function (partNumberMatrix){
        $scope.PNM = partNumberMatrix;
        $scope.data = {}; //selected data for each Part number Section

        $scope.data.selects = initializeDataSelects(partNumberMatrix.selects);
        $scope.data.numerics = initializeDataNumerics(partNumberMatrix.numerics);

        $scope.indexMap = initializeIndexMap(partNumberMatrix.selects, partNumberMatrix.numerics); //Allows to refer to a section by its description giving its position in the corresponding data.object

    };

    //Utility Functions
    var generateNumericsExpectedFormat = function (allowDecimals, maxLength) {
        if (allowDecimals) {
            return new RegExp("^\\d{0," + maxLength + "}(?:\\.|\\.\\d{0,2})?$");
        }
        else {
            return new RegExp("^\\d{0," + maxLength + "}$");
        }
    };

    var isNumeric = function (key) {
        key = String.fromCharCode(key);
        return /[\.0-9]/.test(key); //allow numbers and dot
    };

    var generateNumericsValue = function (input, maxLength) {
        let integers, decimals;

        if (input.includes(".")) {
            let splittedInput = input.split(".");
            integers = splittedInput[0];
            decimals = splittedInput[1];
        }
        else {
            integers = input;
            decimals = "";
        }

        integers = integers.padStart(maxLength, "0");
        decimals = decimals.padEnd(2, "0"); //always 2 decimals

        if (integers == 0 && decimals == 0) {
            return "";
        }

        if (decimals == 0) {
            return integers;
        }

        return integers + "D" + decimals;
    };

    //Events
    $scope.validateConnectors = function () {

        //One of the Connectors or Polish is not selected; Do nothing
        if (!$scope.data.selects[6].value || //Connector Side A
            !$scope.data.selects[7].value || //Polish Side A
            !$scope.data.selects[8].value || //Connector Side B
            !$scope.data.selects[9].value) { //Polish Side A
            return;
        }

        //Connector B's selection is "no connector"; Do nothing
        if ($scope.data.selects[8].value == "OE") {
            return;
        }

        //A and B are in alphabetical order; Do nothing
        if ($scope.data.selects[6].value <= $scope.data.selects[8].value) {
            return;
        }

        //A and B are not in alphabetical order; Swap Connectors and Polishes
        let tempConnector = JSON.parse(JSON.stringify($scope.data.selects[6]));
        let tempPolish = JSON.parse(JSON.stringify($scope.data.selects[7]));

        $scope.data.selects[6] = $scope.data.selects[8];
        $scope.data.selects[7] = $scope.data.selects[9];
        $scope.data.selects[8] = tempConnector;
        $scope.data.selects[9] = tempPolish;

        return;
    };

    //EVENTS >> NUMERICS

    //Prevents non-numeric inputs
    $scope.onKeypressNumericsInput = function (event) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;

        if (!isNumeric(key)) evt.preventDefault();
    };

    $scope.onChangeNumericsInput = function (index) {
        const EXPECTED_FORMAT = $scope.data.numerics[index].expectedFormat;
        let input = $scope.data.numerics[index].input;

        if (!EXPECTED_FORMAT.test(input)) {
            //Roll back to last valid input
            $scope.data.numerics[index].input = $scope.data.numerics[index].lastValidInput;
        }

        //update lastValidInput to this input and generate partNumber code value
        $scope.data.numerics[index].lastValidInput = $scope.data.numerics[index].input;
        $scope.data.numerics[index].value = generateNumericsValue(
            $scope.data.numerics[index].input,
            $scope.data.numerics[index].maxLength
        );
    };

    //Prevents paste
    $scope.onPasteNumericsInput = function (event) {
        let evt = event || window.event;

        if (evt.preventDefault) evt.preventDefault();
    };

    $scope.onBlurNumericsInput = function (index) {
        //format input
    };

    $scope.onChangeNumericsSelects = function (index) {
        const ID = "numericsInput" + index;

        if ($scope.data.numerics[index].unit.description == "not applicable") {
            $scope.data.numerics[index].input = "";
            $scope.data.numerics[index].lastValidInput = "";
            $scope.data.numerics[index].value = "";
            document.getElementById(ID).disabled = true;
        }
        else
            document.getElementById(ID).disabled = false;
    };

}]);



app.controller('FAController', ['$scope', '$http', '$route', function($scope, $http, $route){
    $http.get("/partNumber/FA").success(function(partNumberMatrix){
        
       init(partNumberMatrix);
    });
    
    //INIT FUNCTIONS
    var init = function(partNumberMatrix){
       $scope.PNM = partNumberMatrix;
       $scope.data = {}; //selected data for each Part number Section
    
       $scope.data.selects = initializeDataSelects(partNumberMatrix.selects);
       $scope.data.numerics = initializeDataNumerics(partNumberMatrix.numerics);
       
       $scope.indexMap = initializeIndexMap(partNumberMatrix.selects, partNumberMatrix.numerics); //Allows to refer to a section by its description giving its position in the corresponding data.object
       
       $scope.range1 = [0,1,2,3,4,5]; //ABCDEF
       $scope.range2 = [6,7,8,9,10]; //HHIJJKL
    };
    
    $scope.test = function(event, val){
        let evt = event || window.event;
        $scope.data.selects[0] = val;
    };

    var initializeDataSelects = function(selects){        
       let s = {}; 
       
       for(let i = 0; i < selects.length; i++){
           s[i] = {};
           s[i].forcedValues = [];
        }
        return s;
    };
    
    var initializeDataNumerics = function(numerics){             
        let n = {};
        
        for(let i = 0; i < numerics.length; i++){
            n[i] = {};
            n[i].value = ""; //Value to display in partNumber
            n[i].input = ""; //Value to display in input
            n[i].lastValidInput = ""; //Tracks the last valid input for input validation
            n[i].allowDecimals = numerics[i].allowDecimals;
            n[i].maxLength = numerics[i].maxLength; //max number of integer digits
            n[i].unit = numerics[i].units[0]; //Automatically select the first unit in available options
                   
            n[i].expectedFormat = generateNumericsExpectedFormat(n[i].allowDecimals, n[i].maxLength);
        }
        return n;
    };
    
    var initializeIndexMap = function(selects, numerics){
        let indexMap = {};

        for(let i = 0; i < selects.length; i++){
            indexMap[selects[i].description] = i;
        }
        
        for(let i = 0; i < numerics.length; i++){
            indexMap[numerics[i].description] = i;
        }

        return indexMap;
    };
    
    //Utility Functions
    var generateNumericsExpectedFormat = function(allowDecimals, maxLength){
        if(allowDecimals){
            return new RegExp("^\\d{0,"+maxLength+"}(?:\\.|\\.\\d{0,2})?$");
        }
        else{
            return new RegExp("^\\d{0,"+maxLength+"}$");
        }
    };

    var isNumeric = function(key){
       key = String.fromCharCode( key );
       return /[\.0-9]/.test(key); //allow numbers and dot
    };

    var generateNumericsValue = function(input, maxLength){
        let integers, decimals;
        
        if(input.includes(".")){
            let splittedInput = input.split(".");
            integers = splittedInput[0];
            decimals = splittedInput[1];
        }
        else{
            integers = input;
            decimals = "";
        }

        integers = integers.padStart(maxLength, "0");
        decimals = decimals.padEnd(2, "0"); //always 2 decimals
        
        if(integers == 0 && decimals == 0){
            return "";
        }

        if(decimals == 0){
            return integers;
        }

        return integers + "D" + decimals;      
    };

    //Events
    $scope.validateConnectors = function(){
         
        //One of the Connectors or Polish is not selected; Do nothing
        if(!$scope.data.selects[6].value || //Connector Side A
           !$scope.data.selects[7].value || //Polish Side A
           !$scope.data.selects[8].value || //Connector Side B
           !$scope.data.selects[9].value){ //Polish Side A
               return;
        }

       //Connector B's selection is "no connector"; Do nothing
       if($scope.data.selects[8].value == "OE"){
           return;
       }

       //A and B are in alphabetical order; Do nothing
       if($scope.data.selects[6].value <= $scope.data.selects[8].value){
           return;
       }

       //A and B are not in alphabetical order; Swap Connectors and Polishes
       let tempConnector = JSON.parse(JSON.stringify($scope.data.selects[6]));
       let tempPolish = JSON.parse(JSON.stringify($scope.data.selects[7]));
       
       $scope.data.selects[6] =  $scope.data.selects[8];
       $scope.data.selects[7] =  $scope.data.selects[9];
       $scope.data.selects[8] =  tempConnector;
       $scope.data.selects[9] =  tempPolish;       
       
       return;
    };
    
    //EVENTS >> NUMERICS

    //Prevents non-numeric inputs
    $scope.onKeypressNumericsInput = function(event) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;

        if(!isNumeric(key)) evt.preventDefault();       
    };
    
    $scope.onChangeNumericsInput = function(index){          
        const EXPECTED_FORMAT = $scope.data.numerics[index].expectedFormat;
        let input = $scope.data.numerics[index].input;
        
        if(!EXPECTED_FORMAT.test(input)){
            //Roll back to last valid input
            $scope.data.numerics[index].input = $scope.data.numerics[index].lastValidInput;
        }
        
        //update lastValidInput to this input and generate partNumber code value
        $scope.data.numerics[index].lastValidInput = $scope.data.numerics[index].input;
        $scope.data.numerics[index].value = generateNumericsValue(
            $scope.data.numerics[index].input,
            $scope.data.numerics[index].maxLength
        );
    };
    
    //Prevents paste
    $scope.onPasteNumericsInput = function(event){
        let evt = event || window.event;

        if(evt.preventDefault) evt.preventDefault();
    };

    $scope.onBlurNumericsInput = function(index){
        //format input
    };

    $scope.onChangeNumericsSelects = function(index){
        const ID = "numericsInput"+index;
        
        if($scope.data.numerics[index].unit.description == "not applicable"){
            $scope.data.numerics[index].input = "";
            $scope.data.numerics[index].lastValidInput = "";
            $scope.data.numerics[index].value = "";
            document.getElementById(ID).disabled = true;
        }
        else
            document.getElementById(ID).disabled = false;
    };

    $scope.test = function(){
        alert("test");
    };

 }]);

 //************************************
 // ****************WNC****************
 //************************************
 app.controller('WNCController', ['$scope', '$http', '$route', function($scope, $http, $route){
    
     $http.get("/partNumber/WNC").success(function(response){
         $scope.partNumber = response;
         $scope.data = {};
         $scope.data.selects = {};
         $scope.data.numerics = {};
         $scope.data.constants = response.constants;
 
         initializeSelects();
         initializeNumerics();
 
     });
 
     var initializeSelects = function(startIndex = 0){
         let length = $scope.partNumber.selects.length;
         
         for(let i = startIndex; i < length; i++){
             $scope.data.selects[i] = {};
         }
     };
 
     var initializeNumerics = function(startIndex = 0){
         let length = $scope.partNumber.numerics.length;
         
         for(let i = startIndex; i < length; i++){
             $scope.data.numerics[i] = {};
             $scope.data.numerics[i].value = "";
             $scope.data.numerics[i].unit = $scope.partNumber.numerics[i].units[0];
         }
     };
 
     $scope.validateConnectors = function(){
 
         //One of the Connectors or Polish is not selected; Do nothing
         if(!$scope.data.selects[6].value || //Connector Side A
             !$scope.data.selects[7].value || //Polish Side A
             !$scope.data.selects[8].value || //Connector Side B
             !$scope.data.selects[9].value){ //Polish Side A
             return;
         }
 
         //Connector B's selection is "no connector"; Do nothing
         if($scope.data.selects[8].value == "OE"){
             return;
         }
 
         //A and B are in alphabetical order; Do nothing
         if($scope.data.selects[6].value <= $scope.data.selects[8].value){
             return;
         }
 
         //A and B are not in alphabetical order; Swap Connectors and Polishes
         let tempConnector = JSON.parse(JSON.stringify($scope.data.selects[6]));
         let tempPolish = JSON.parse(JSON.stringify($scope.data.selects[7]));
         
         $scope.data.selects[6] =  $scope.data.selects[8];
         $scope.data.selects[7] =  $scope.data.selects[9];
         
         $scope.data.selects[8] =  tempConnector;
         $scope.data.selects[9] =  tempPolish;       
         return;
     };
 
     $scope.test = function(){
         alert("OK");
     }; 
 }]);
