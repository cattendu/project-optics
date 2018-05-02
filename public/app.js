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

        $scope.range1 = [0,1,2,3,4,5]; //ABCDEF
        $scope.range2 = [6,7,8,9,10]; //HHIJJKL

        /*
        //K:V map where Key is category description and value is selected part
        for(let category of $scope.partNumber.categories){
            if(category.description)
                $scope.data.selected[category.description] = {'placeholder':category.placeholder};
        }
        */

    });

    $scope.validateConnectors = function(){

        //One of the Connectors or Polish is not selected
        if(!$scope.data.selected["CONNECTOR SIDE A"].value || 
            !$scope.data.selected["CONNECTOR SIDE B"].value ||
            !$scope.data.selected["POLISH SIDE A"].value ||
            !$scope.data.selected["POLISH SIDE B"].value){
                alert("UNSELECTED");
            return;
        }

        //Connector B's selection is "no connector"; do not switch connectors
        if($scope.data.selected["CONNECTOR SIDE B"].value == "OE"){
            return;
        }

        //A and B are not in alphabetical order and need to be swapped
        if($scope.data.selected["CONNECTOR SIDE A"].value > $scope.data.selected["CONNECTOR SIDE B"].value){

            let tempConnector = JSON.parse(JSON.stringify($scope.data.selected["CONNECTOR SIDE A"]));
            let tempPolish = JSON.parse(JSON.stringify($scope.data.selected["POLISH SIDE A"]));

            $scope.data.selected["CONNECTOR SIDE A"] =  $scope.data.selected["CONNECTOR SIDE B"];
            $scope.data.selected["POLISH SIDE A"] =  $scope.data.selected["POLISH SIDE B"];
            
            $scope.data.selected["CONNECTOR SIDE B"] =  tempConnector;
            $scope.data.selected["POLISH SIDE B"] =  tempPolish;       

            return;
        }

        //Everything is fine
        return;
    };

    $scope.test = function(){
        alert($(".CONNECTOR SIDE A").val());
    };


}]);
