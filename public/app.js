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
                "catalogNav@catalog": {
                    templateUrl: 'views/catalog/section.nav.html',
                    controller: 'catalogSectionController'
                },
                "catalogContent@catalog": {
                    templateUrl: 'views/catalog/section.content.html',
                    controller: 'catalogSectionController'
                },
            },
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
                "catalogNav@catalog": {
                    templateUrl: 'views/catalog/product.nav.html',
                    controller: 'catalogProductNavController'
                },
                "catalogContent@catalog": {
                    templateUrl: function($stateParams){
                        return "views/catalog/" + $stateParams.sectionNumber + "/" + $stateParams.productType + ".html";
                    },
                    controller: 'catalogProductController'
                }
            },
            resolve: {
                product: function ($stateParams, section) {
                    for (let product of section.products) {
                        if (product.type == $stateParams.productType)
                            return product;
                    }
                    return null;
                }
            }
        });

    $urlRouterProvider.otherwise("/home");
});

app.controller('homeController', function (catalog, $scope) {
    $scope.sections = catalog;
});

app.controller('catalogSectionController', function (section, $scope) {
    $scope.section = section;
});

app.controller('catalogProductNavController', function (section, product, $scope, $sce) {
    $scope.section = section;
    $scope.product = product;
});

// **************** PRODUCT CONTROLLER ****************
app.controller('catalogProductController', function (section, product, $scope, $sce){
    $scope.product = product;

    //INIT FUNCTIONS BEGIN
    var initPart = function(part){
        part.isDisabled = true;
        part.value = "";

        if(partIsSelect(part)){
            initSelect(part);
        }
        else if(partIsNumeric(part)){
            initNumeric(part);
        }
        else if(partIsConstant(part)){
            initConstant(part);
        }
        else{
            console.log("Invalid part type on: " + part);
        }
    };
    var initSelect = function (part){
        part.availableOptions = generateSelectAvailableOptions(part);
        part.selectedOption = {};
    };
    
    var initNumeric = function (part){
        part.availableOptions = generateNumericAvailableOptions(part);
        part.selectedOption = part.availableOptions[0];
        part.expectedFormat = initNumericExpectedFormat(part);
        part.input = '';
        part.lastValidInput = '';
    };
    var initNumericExpectedFormat = function (part) {
        if (part.allowDecimals) {
            return new RegExp("^\\d{0," + part.expectedLength + "}(?:\\.|\\.\\d{0,2})?$");
        }
        else {
            return new RegExp("^\\d{0," + part.expectedLength + "}$");
        }
    };
    var initConstant = function(){
        //Do init here
    };
    var initFocusedPart = function(){
        product.focusedPart = getNextVariablePart(product.parts[0]);
        product.focusedPart.isDisabled = false;
    };
    var init = function(){
        for(let part of product.parts){
            initPart(part);
        }
        initFocusedPart();
    };
    //INIT FUNCTIONS END

    //SET PART FOCUS BEGIN
    var setFocusedPart = function(partToFocus){
        if(!partToFocus.isDisabled){
            product.focusedPart = partToFocus;
            product.focusedPart.isDisabled = false;
        }
    };
    $scope.setFocusedPart = setFocusedPart;

    var setFocusOnNextPart = function(){
        let partToFocus = getNextVariablePart();

        if (partToFocus){
            partToFocus.isDisabled = false;
            partToFocus.availableOptions = generateAvailableOptions(partToFocus);
            setFocusedPart(partToFocus);
        }
        else{
            alert("ALL PARTS SELECTED");
        }
    };
    $scope.setFocusOnNextPart = setFocusOnNextPart;
    //SET PART FOCUS END

    $scope.setPart = function (optionToSelect = product.focusedPart.selectedOption, part = product.focusedPart){
        checkPartsForReset(part);
        
        if(partIsSelect(part))
            setSelect(optionToSelect, part);
        else if(partIsNumeric(part))
            setNumeric(optionToSelect, part);
        else if(partIsConstant(part))
            console.log("Tried to set a constant part on: " + part);
        else
            console.log("Invalid part type on: " + part);
    };
    var checkPartsForReset = function(lastValidPart){
        for (let i = product.parts.indexOf(lastValidPart) + 1; i < product.parts.length; i++){
            if(!product.parts[i].isDisabled){
                initPart(product.parts[i]);
            }
        }
    };
    //SELECT BEGIN
    var generateSelectAvailableOptions = function (part) {
        let availableOptions = [];
        let optionToCheck;

        //If a constraint is applicable, set available options accordingly
        for(let constraint of part.constraints){
            if(validateConstraint(constraint)){
                optionToCheck = getOptionFromValue(part, constraint.forcedValue);

                let addOption = true;
                for(let option of availableOptions){
                    if(option == optionToCheck)
                        addOption = false;    
                }
                if(addOption)
                    availableOptions.push(optionToCheck);
            }
        }
        
        //If no constraints were applicable, allow all options
        if(!availableOptions.length)
            availableOptions = part.options;

        return availableOptions;       
    };
    var setSelect = function (optionToSelect, part = product.focusedPart){
        part.selectedOption = optionToSelect;
        part.value = part.selectedOption.value;
        setFocusOnNextPart();
    };
    //SELECT END
    //NUMERIC BEGIN
    var generateNumericAvailableOptions = function (part) {
        let availableOptions = [];

        //If a constraint is applicable, set available options accordingly
        for (let constraint of part.constraints) {
            if (validateConstraint(constraint)) {
                availableOptions.push(getOptionFromValue(part, constraint.forcedValue));
            }
        }
        
        //If no constraints were applicable, allow all options except the 'not applicable' one
        if (!availableOptions.length){
            for(let option of part.options)
                if(option.description != 'not applicable')
                    availableOptions.push(option);
        }

        return availableOptions;
    };
    var setNumeric = function(optionToSelect, part = product.focusedPart){       
        part.selectedOption = optionToSelect;
        part.value = generateNumericValue(part);
        setFocusOnNextPart();
    };
    //NUMERIC END


    //UTILS FUNCTIONS
    var generateAvailableOptions = function(part){
        if(partIsNumeric(part))
            return generateNumericAvailableOptions(part);
        else if(partIsSelect(part))
            return generateSelectAvailableOptions(part);
    };
    var validateConstraint = function(constraint){
        let partToCheck;

        for(let condition of constraint.conditions){
            partToCheck = getPartFromId(condition.partId);

            if (!partToCheck.selectedOption || partToCheck.selectedOption.value != condition.optionValue)
                return false;
        }
        return true;
    };
    var getPartFromId = function(id){
        for(let part of product.parts){
            if(part.id == id)
                return part;
        }

        console.log("Part not found from id: " + id);
        return null;
    };
    var getOptionFromValue = function(part, value){
        for(let option of part.options)
            if (option.value == value)
                return option;
        
        console.log("Option not found from value: " + value);
        return null;
    };
    var partIsNumeric = function (part) {
        return part.type == 'numeric';
    };
    var partIsSelect = function (part) {
        return part.type == 'select';
    };
    var partIsConstant = function (part) {
        return part.type == 'constant';
    };
    var partIsVariable = function (part) {
        return partIsNumeric(part) || partIsSelect(part);
    };
    var getNextVariablePart = function (currentPart = product.focusedPart) {
        let start = product.parts.indexOf(currentPart) + 1;

        for (let i = start; i < product.parts.length; i++)
            if (product.parts[i].type != 'constant')
                return product.parts[i];
        return null;
    };
    $scope.getAsHtml = function(value){
        return $sce.trustAsHtml(value);
    };
    var keyIsNumeric = function (key) {
        key = String.fromCharCode(key);
        return /[\.0-9]/.test(key); //allow numbers and dot
    };
    var generateNumericValue = function (part) {
        let integers, decimals;

        if(part.selectedOption.description == 'not applicable'){
            return part.selectedOption.value;
        }
        if(part.selectedOption.value === undefined){
            part.selectedOption.value = "";
        }

        if (part.input.includes(".")) {
            let splittedInput = part.input.split(".");
            integers = splittedInput[0];
            decimals = splittedInput[1];
        }
        else {
            integers = part.input;
            decimals = "";
        }

        integers = integers.padStart(part.expectedLength, "0");
        decimals = decimals.padEnd(2, "0"); //always 2 decimals

        if (integers == 0 && decimals == 0) {
            return "";
        }

        if (decimals == 0) {
            return integers + part.selectedOption.value;
        }

        return integers + "D" + decimals;
    };
    
    //EVENTS >> NUMERICS
    //Prevents non-numeric inputs
    $scope.onKeypressNumericInput = function (event, part = product.focusedPart) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;
        
        if (!keyIsNumeric(key)){
            evt.preventDefault(); //prevent key input
        }
    };

    $scope.onChangeNumericInput = function (event, part = product.focusedPart) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;
        const EXPECTED_FORMAT = part.expectedFormat;

        if (!EXPECTED_FORMAT.test(part.input)){
            //Rollback to last valid input
            part.input = part.lastValidInput;
        }
        else{
            part.lastValidInput = part.input;
            part.value = generateNumericValue(part, part.input);
        }
        
    };

    //Prevents paste
    $scope.onPasteNumericInput = function (event) {
        let evt = event || window.event;

        if (evt.preventDefault) evt.preventDefault();
    };

    $scope.onChangeNumericSelect = function (event, part = product.focusedPart){
        part.value = generateNumericValue(part, part.input);
    };

    //INIT CALL
    init();
});

//************************************************************************ */
//************************************************************************ */
//************************************************************************ */

var findProductByType = function (products, type) {
    for (let product of products)
        if (product.type == type)
            return product;
    return products[0];
};

app.controller('FAController', function (partNumberMatrix, $scope, $http, $state, $location) {
    // INITIALIZE CONTROLLER DATA FROM DATABASE RESPONSE
    var init = function (partNumberMatrix) {
        $scope.PNM = partNumberMatrix;
        $scope.data = {}; //selected data for each Part number Section

        $scope.data.selects = initializeDataSelects(partNumberMatrix.selects);
        $scope.data.numerics = initializeDataNumerics(partNumberMatrix.numerics);

        $scope.indexMap = initializeIndexMap(partNumberMatrix.selects, partNumberMatrix.numerics); //Allows to refer to a section by its description giving its position in the corresponding data.object

    };

    ////Utility Functions
    //var generateNumericsExpectedFormat = function (allowDecimals, maxLength) {
    //    if (allowDecimals) {
    //        return new RegExp("^\\d{0," + maxLength + "}(?:\\.|\\.\\d{0,2})?$");
    //    }
    //    else {
    //        return new RegExp("^\\d{0," + maxLength + "}$");
    //    }
    //};

    //var isNumeric = function (key) {
    //    key = String.fromCharCode(key);
    //    return /[\.0-9]/.test(key); //allow numbers and dot
    //};

    //var generateNumericsValue = function (input, expectedLength) {
    //    let integers, decimals;
    //
    //    if (input.includes(".")) {
    //        let splittedInput = input.split(".");
    //        integers = splittedInput[0];
    //        decimals = splittedInput[1];
    //    }
    //    else {
    //        integers = input;
    //        decimals = "";
    //    }
    //
    //    integers = integers.padStart(expectedLength, "0");
    //    decimals = decimals.padEnd(2, "0"); //always 2 decimals
    //
    //    if (integers == 0 && decimals == 0) {
    //        return "";
    //    }
    //
    //    if (decimals == 0) {
    //        return integers;
    //    }
    //
    //    return integers + "D" + decimals;
    //};

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

        if (!keyIsNumeric(key)) evt.preventDefault();
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