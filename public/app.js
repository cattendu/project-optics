var app = angular.module("myApp", ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: './views/home.html',
            controller: 'myCtn'
        })
        .when('/home', {
            templateUrl: './views/home.html',
            controller: 'myCtn' 
        })
        .when('/products', {
            templateUrl: './views/products.html',
            controller: 'myCtn' 
        })
        .otherwise({
            redirectTo: '/home' 
        })
    ;
}]);

app.controller('myCtn', ['$scope', '$http', '$route', function($scope, $http, $route){
    
    
    $http.get("/products").success(function(response){
        $scope.products = response;
        $scope.product = "";
    });

    $scope.removeProduct = function(id){
        $http.delete("/product/" + id).success(function(response){
            $route.reload();
        });
    };

    $scope.addProduct = function(){
        $http.post("/products", $scope.newProduct).success(function(response){
            $route.reload();
        });
    };

    $scope.editProduct = function(id){
        $http.get("/product/" + id).success(function(response){
            $scope.newProduct = response;
        });
    };

    $scope.updateProduct = function(id){
        $http.put("/product/" + id, $scope.newProduct).success(function(response){
            $route.reload();
        });
    };

    $scope.clearProduct = function(){
        $route.reload();
    }
}]);

