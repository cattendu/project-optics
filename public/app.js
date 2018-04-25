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
    });

    let selectedParts = function(){
        for(let category in $scope.partNumber.categories){
            selectedParts.push(category.placeholder);
        }
    };

    $scope.selectedParts = selectedParts;

    $scope.selectCategory = function(selectedCat){
        $scope.selectedCategory = selectedCat;
    };

}]);
