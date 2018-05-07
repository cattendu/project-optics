var app = angular.module("partBuilderApp", ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: './views/partBuilder.htm',
            controller: 'partBuilderController'
        })
        .when('/FA', {
            templateUrl: './views/FA.htm',
            controller: 'FAController'
        })
        .when('/WNC', {
            templateUrl: './views/WNC.htm',
            controller: 'WNCController'
        })
        .otherwise({
            redirectTo: '/',
            controller: 'partBuilderController'
        })
    ;
}]);

app.controller('partBuilderController', ['$scope', '$http', '$route', function($scope, $http, $route){
    
    $http.get("/partNumbers").success(function(response){
        $scope.partNumbers = response;
    });

}]);

app.controller('FAController', ['$scope', '$http', '$route', function($scope, $http, $route){
    
     $http.get("/partNumber/FA").success(function(response){
         $scope.partNumber = response;
         $scope.data = {};
         $scope.data.selects = {};
         $scope.data.numerics = {};
         $scope.data.constants = response.constants;
 
         initializeSelects();
         initializeNumerics();
 
         $scope.range1 = [0,1,2,3,4,5]; //ABCDEF
         $scope.range2 = [6,7,8,9,10]; //HHIJJKL
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
             $scope.data.numerics[i].value = ""; //Value to display in partNumber
             $scope.data.numerics[i].input = ""; //Value to display in input
             $scope.data.numerics[i].lastValidInput = "";
             $scope.data.numerics[i].allowDecimals = $scope.partNumber.numerics[i].allowDecimals;
             $scope.data.numerics[i].maxLength = $scope.partNumber.numerics[i].maxLength;
             $scope.data.numerics[i].unit = $scope.partNumber.numerics[i].units[0];

             $scope.data.numerics[i].expectedFormat = generateDesiredNumericsInputFormat($scope.data.numerics[i].allowDecimals, $scope.data.numerics[i].maxLength);
         }
        };
        
        //Utility Functions
        var generateDesiredNumericsInputFormat = function(allowDecimals, maxLength){
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

        
        var generateNumericsValueFromInput = function(input, maxLength){
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
        
        $scope.onChangeNumerics = function(index){          
            const MAX_LENGTH = $scope.data.numerics[index].maxLength;
            const EXPECTED_FORMAT = $scope.data.numerics[index].expectedFormat;
            let input = $scope.data.numerics[index].input;

            if(!EXPECTED_FORMAT.test(input)){
                //Roll back to last valid input
                $scope.data.numerics[index].input = $scope.data.numerics[index].lastValidInput;
            }

            //update lastValidInput to this input and generate partNumber code value
            $scope.data.numerics[index].lastValidInput = $scope.data.numerics[index].input;
            $scope.data.numerics[index].value = generateNumericsValueFromInput($scope.data.numerics[index].input, MAX_LENGTH);
        };

        $scope.onBlurNumerics = function(index){
            //format input
        };
        
        //Prevents paste
        $scope.onPasteNumerics = function(event){
            let evt = event || window.event;
        if(evt.preventDefault) evt.preventDefault();
    };

    $scope.onKeypressNumerics = function(event) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;
        
        if(!isNumeric(key)){
            evt.preventDefault();
            return;
        }
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
