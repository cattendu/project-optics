var app = angular.module("partBuilderApp", ['ui.router']);

app.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state("home", {
            url: '/home',
            templateUrl: 'views/home.html',
            controller: 'homeController',
            resolve: {
                catalog: function($http){
                    return $http.get("/sections").then(function(catalog){
                        return catalog.data;
                    });
                }, 
            }        
        })
        .state('catalog', {
            url: '/catalog',
            templateUrl: 'views/catalog.html',
            abstract: true
        })
        .state('catalog.section', {
            url: '/:sectionNumber',
            views: {
                catalogNav: {
                    templateUrl: 'views/catalog/catalog.nav.html',
                    controller: ''
                },
                catalogContent: {
                    templateUrl: 'views/catalog/catalog.section.html',
                    controller: 'catalogSectionController'
                },
            },                  
            
            //Get products from $stateParams section
            resolve: {
                section: function($stateParams, $http){
                    return $http.get("/section/" + $stateParams.sectionNumber).then(function(section){
                        return section.data;
                    });
                }
            } 
        })
        .state('catalog.section.product', {
            url: '/:productType',
            views: {
                catalogNav: {
                    templateUrl: 'views/catalog/catalog.nav.html',
                    controller: ''
                },
                catalogContent: {
                    templateUrl: function($stateParams){
                        return 'views/catalog/' + $stateParams.sectionNumber + '/' + $stateParams.productType + '.html';},
                    controller: 'catalogProductController'
                } 
            },
        });

    $urlRouterProvider.otherwise("/home");
});

app.controller('homeController', function (catalog, $scope) {
    $scope.sections = catalog;
});

app.controller('catalogSectionController', function (section, $scope){
    $scope.section = section;
    console.log(section);
});

app.controller('catalogController', function(products, $state, $stateParams){
    let params = {
        section: $stateParams.section,
        product: products[0].type
    };
    $state.transitionTo('catalog.section.product', params);
});


app.controller('navTabsController', function (products, $scope) {
    $scope.products = products;
    $scope.tabs = [];

    for(let product of products){
        $scope.tabs.push(product.type);
    }
});

var findProductByType = function (products, type) {
    for (let product of products)
        if (product.type == type)
            return product;
    return products[0];
};

app.controller('FAController', function (partNumberMatrix, $scope, $http, $state, $location) {
    // DEFAULT TAB
    $http.get("/partNumber/FA").success(function (partNumberMatrix) {
        init(partNumberMatrix);
    });

    // LOAD TAB PNM
    $scope.loadTab = function (tabToLoad) {
        if (tabToLoad != currentTab) {
            $http.get("/partNumber/" + tabToLoad).success(function (partNumberMatrix) {
                init(partNumberMatrix);
                currentTab = tabToLoad;
            });
        }
    };

    // INITIALIZE CONTROLLER DATA FROM DATABASE RESPONSE
    var init = function (partNumberMatrix) {
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

});