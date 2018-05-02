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
            $scope.data.numerics[i].value = "";
            $scope.data.numerics[i].unit = $scope.partNumber.numerics[i].units[0];
        }
    };

    $scope.validateConnectors = function(){

        //One of the Connectors or Polish is not selected
        if(!$scope.data.selects[6].value || //Connector Side A
            !$scope.data.selects[7].value || //Polish Side A
            !$scope.data.selects[8].value || //Connector Side B
            !$scope.data.selects[9].value){ //Polish Side A
                alert("UNSELECTED");
            return;
        }

        //Connector B's selection is "no connector"; do not swap connectors
        if($scope.data.selects[8].value == "OE"){
            return;
        }

        //A and B are in alphabetical order; do not swap connectors
        if($scope.data.selects[6].value <= $scope.data.selects[8].value){
            return;
        }

        //A and B are not in alphabetical order and need to be swapped
        let tempConnector = JSON.parse(JSON.stringify($scope.data.selects[6]));
        let tempPolish = JSON.parse(JSON.stringify($scope.data.selects[7]));
        $scope.data.selects[6] =  $scope.data.selects[8];
        $scope.data.selects[7] =  $scope.data.selects[9];
        
        $scope.data.selects[8] =  tempConnector;
        $scope.data.selects[9] =  tempPolish;       
        return;

    };

    $scope.test = function(){
        alert($(".CONNECTOR SIDE A").val());
    };


}]);
