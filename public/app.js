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

    $scope.selectCategory = function(msg){
        alert(msg);
    };
}]);

app.controller('FAController', ['$scope', '$http', '$route', function($scope, $http, $route){
    
    $http.get("/partNumber/FA").success(function(response){
        $scope.partNumber = response;
        console.log(response);
    });

    $scope.selectCategory = function(selectedCat){
        $scope.selectedCategory = selectedCat;
    };

}]);
