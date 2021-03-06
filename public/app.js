var app = angular.module("partBuilderApp", ['ui.router', 'ngCookies']);

app.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
    
    $stateProvider
        .state("home", {
            url: '/home',
            views:{
                'content':{
                    templateUrl: './views/home/home.content.html',
                    controller: 'homeController',
                },
                'nav':{
                    templateUrl: './views/home/home.nav.html',
                    controller: 'homeController',
                }
            },        
            resolve: {
                catalog: function($http){
                    return $http.get("/sections").then(function(catalog){
                        return catalog.data;
                    });
                }, 
            }        
        })
        .state('cart', {
            url: '/cart' ,
            views: {
                'content': {
                    templateUrl: 'views/cart/cart.content.html',
                    controller: 'cartController',
                },
                'nav': {
                    templateUrl: 'views/cart/cart.nav.html',
                    controller: 'cartController',
                }
            },
            resolve: {
                cart: function ($cookies) {
                    let cart = [];
                    let cookies = $cookies.getAll();
                    angular.forEach(cookies, function (v, k) {
                        let cookie = JSON.parse($cookies.get(k));

                        if (cookie.partNumber || null) {
                            cart.push(cookie);
                        }
                    });
                    return cart;
                }
            }
        })
        .state('catalog', {
            url: '/catalog',
            views: {
                'content': {
                    template: '<div ui-view="content"></div>'
                },
                'nav': {
                    template: '<div ui-view="nav"></div>'
                }
            },
            abstract: true
        })
        .state('catalog.section', {
            url: '/:sectionNumber',
            views: {
                "nav@catalog": {
                    templateUrl: 'views/catalog/section.nav.html',
                    controller: 'catalogSectionController'
                },
                "content@catalog": {
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
            url: '/:partNumber',
            views: {
                "nav@catalog": {
                    templateUrl: 'views/catalog/product.nav.html',
                    controller: 'catalogProductNavController'
                },
                "content@catalog": {
                    /*templateUrl: function($stateParams){
                        return "views/catalog/" + $stateParams.sectionNumber + "/" + $stateParams.partNumber + ".html";
                    },*/
                    templateUrl: 'views/catalog/product.content.html',
                    controller: 'catalogProductController'
                }
            },
            resolve: {
                product: function ($stateParams, section) {
                    for (let product of section.products) {
                        if (product.partNumber == $stateParams.partNumber)
                            return product;
                    }
                    return null;
                }
            }
        });

    $urlRouterProvider.otherwise("/home");
});

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);

        for (var i = 0; i < total; i++) {
            input.push(i);
        }

        return input;
    };
});

app.controller('homeController', function (catalog, $scope) {
    $scope.sections = catalog;
});
app.controller('cartController', function (cart, $scope, $cookies, $state) {
    $scope.cart = cart;
    $scope.quantityRange = 99;

    $(document).ready(function () {
        $('.removePopover').confirmation({
            onConfirm: function (event, element) {
                removeProduct(element[0].getAttribute("data-partNumber"));
            },
            onCancel: function (event, element) {}
        });
    });


    var initCart = function(){
        for(let product of cart){
            product.quantityMode = "closed";
            product.quantityInput = product.quantity;
        }
    };

    //********************************************** NUMERIC INPUT BEGIN  **********************************************
    $scope.quantityInputIsValid = function(product){
        if (product.quantityInput == 0)
            return false;

        if (product.quantityInput == "")
            return false;

        if (product.quantityInput == product.quantity)
            return false;

        return true;
    };
    //-------------------------------------------EVENTS BEGIN---------------------------------------------
    var removeQuantityOpenCloseEvents = function(){
        $(document).off("click.cartQuantity");
        $(document).off("keyup.cartQuantity");
    };
    //----------------------------------------------------------------------------------------------------
    var addQuantityOpenCloseEvents = function (product, quantityInputContainerElem){
        //Close quantityInput if user clicks anywhere outside the select box
        $(document).on("click.cartQuantity", function (event) {
            let evt = event || window.event;
            let target = evt.target;

            //User clicked outside of the quantityInput element
            if (!quantityInputContainerElem.contains(target)) {
                quantityGoToClosedState(product);
                $scope.$apply(); //manually update ng
            }
        });

        //Close quantityInput if user hits esc key
        $(document).on("keyup.cartQuantity", function (event) {
            let evt = event || window.event;
            let key = evt.keyCode || evt.which;

            if (key == 27){ //esc
                quantityGoToClosedState(product);
                $scope.$apply(); //manually update ng
            }
        });
    };
    //-------------------------------------------EVENTS END---------------------------------------------
    //------------------------------------------QUANTITY STATES--------------------------------------------
    var quantityGoToClosedState = function(product){
        product.quantityMode = "closed";     
        removeQuantityOpenCloseEvents();
    };
    //----------------------------------------------------------------------------------------------------
    var quantityGoToOpenedState = function (product, quantityInputContainerElem){
        product.quantityMode = "opened";
        addQuantityOpenCloseEvents(product, quantityInputContainerElem);
    };
    //----------------------------------------------------------------------------------------------------
    var quantityGoToInputState = function(product, quantityInputElement){
        product.quantityMode = "input";
        
        //set focus on input; timeout required because must wait for ng to update
        window.setTimeout(function () {
            quantityInputElement.focus();
        }, 0);

        removeQuantityOpenCloseEvents();
    };
    //------------------------------------------QUANTITY STATES--------------------------------------------
    //--------------------------------------------NUMERIC INPUT BEGIN------------------------------------------------
    $scope.onKeypressNumericInput = function (event) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;

        if (!keyIsNumeric(key)) {
            evt.preventDefault(); //prevent key input
        }
    };
    //----------------------------------------------------------------------------------------------------
    //Prevents paste
    $scope.onPasteNumericInput = function (event) {
        let evt = event || window.event;

        if (evt.preventDefault) evt.preventDefault();
    };
    //----------------------------------------------------------------------------------------------------
    var keyIsNumeric = function (key) {
        key = String.fromCharCode(key);
        return /[0-9]/.test(key); //allow numbers
    };
    //--------------------------------------------NUMERIC INPUT END------------------------------------------------
    //--------------------------------------------NG EVENTS BEGIN------------------------------------------------
    $scope.onClickQuantityUpdate = function (product) {
        updateQuantity(product, product.quantityInput);
        quantityGoToClosedState(product);
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onClickClosedQuantity = function (event, product) {
        let evt = event || window.event;
        let target = evt.target;
        
        quantityGoToOpenedState(product, target);
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onClickOpenedQuantity = function(product){
        let evt = event || window.event;
        let target = evt.target;

        let value = target.getAttribute("value");

        if(value == 'input'){
            let quantityInputElement = target.closest(".cart-quantity-container").getElementsByTagName('input')[0];
            quantityGoToInputState(product, quantityInputElement);
        }
        else{
            updateQuantity(product, value);
            quantityGoToClosedState(product);
        }
    };
    //--------------------------------------------NG EVENTS END------------------------------------------------
    //----------------------------------------------------------------------------------------------------
    var updateQuantity = function (product, quantity) {
        product.quantity = quantity;
        product.quantityInput = quantity;

        updateCookie(product);
    };
    var updateCookie = function(product){
        let updatedCookie = JSON.stringify({ 'section': product.section, 'partNumber': product.partNumber, 'quantity': product.quantity, 'datasheet': product.datasheet, 'orderDateTime': product.orderDateTime });
        $cookies.put(product.partNumber, updatedCookie);
    };
    //********************************************** NUMERIC INPUT END  **********************************************

    $scope.removeCookies = function(){
        angular.forEach($cookies.getAll(), function (v, k) {
            $cookies.remove(k);
        });
    };

    var removeProduct = function (partNumber){
        $cookies.remove(partNumber);
        cart = updateCart();
        $scope.$apply();

    };
    var updateCart = function(){
        cart.length = 0; //Clear array while maintaining reference
        
        let cookies = $cookies.getAll();
        angular.forEach(cookies, function (v, k) {
            let cookie = JSON.parse($cookies.get(k));

            if (cookie.partNumber || null) {
                cart.push(cookie);
            }
        });
        return cart;
    };

    initCart();

});

app.controller('catalogSectionController', function (section, $scope) {
    $scope.section = section;
});

app.controller('catalogProductNavController', function (section, product, $scope, $sce) {
    $scope.section = section;
    $scope.product = product;
});

// **************** PRODUCT CONTROLLER ****************
app.controller('catalogProductController', function (section, product, $scope, $sce, $cookies){
    $scope.section = section;
    $scope.product = product;
    $scope.quantity = 1;

    //********************************************** INIT FUNCTIONS BEGIN **********************************************
    var initPart = function(part){
        part.isDisabled = true;
        part.value = null;
        part.selectedOption = null;
        part.details = null;

        if(partIsSelect(part)){
            initSelect(part);
        }
        else if(partIsNumeric(part)){
            initNumeric(part);
        }
        else if(partIsColor(part)) {
            initColor(part);
        }
        else if (partIsConstant(part)) {
            initConstant(part);
        }
        else{
            console.log("Invalid part type: " + part.type);
        }
    };
    //----------------------------------------------------------------------------------------------------
    var initSelect = function (part){
        //Do init here
    };
    //----------------------------------------------------------------------------------------------------
    var initNumeric = function (part){
        part.expectedFormat = initNumericExpectedFormat(part);
        part.input = null;
        part.lastValidInput = null;
    };
    var initNumericExpectedFormat = function (part) {
        if (part.decimalsLength > 0) {
            return new RegExp("^\\d{0," + part.integersLength + "}(?:[\\.,]|[\\.,]\\d{0,2})?$");
        }
        else {
            return new RegExp("^\\d{0," + part.integersLength + "}$");
        }
    };
    var initColor = function(part){
        //Do init here
    };
    //----------------------------------------------------------------------------------------------------
    var initConstant = function(){
        //Do init here
    };
    //----------------------------------------------------------------------------------------------------
    var initFocusedPart = function(){
        let partToFocus = getFirstVariablePart();
        setFocusedPart(partToFocus, true);
    };
    //----------------------------------------------------------------------------------------------------
    var init = function(){
        for(let part of product.parts){
            initPart(part);
        }
        initFocusedPart();
    };
    //********************************************** INIT FUNCTIONS END **********************************************

    //********************************************** PART FOCUS BEGIN **********************************************
    var setFocusedPart = function(partToFocus, forceFocus = false){       
        let partIsFocusable = !partToFocus.isDisabled || forceFocus;
        
        if (partIsFocusable){
            let currentFocus = product.focusedPart || null;
            if (partIsNumeric(currentFocus)){
                setNumeric(currentFocus, currentFocus.selectedOption);
            }

            partToFocus.isDisabled = false;
            product.focusedPart = partToFocus;

            //If part is numeric and it does not already have a selectedOption, automatically select a valid option for visual purposes;
            //See: https://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select
            if(partIsNumeric(partToFocus) && !partToFocus.selectedOption)
                partToFocus.selectedOption = getFirstValidOption(partToFocus);
        }
    };
    $scope.setFocusedPart = setFocusedPart;
    //----------------------------------------------------------------------------------------------------
    var setFocusOnNextVariablePart = function () {
        let partToFocus = getNextVariablePart(product.focusedPart);

        if (partToFocus)
            setFocusedPart(partToFocus, true);     

        //Reached end of parts; Open product summary modal
        else {
            $('#modalProductSummary').modal('show');
        }
    };
    $scope.setFocusOnNextVariablePart = setFocusOnNextVariablePart;
    //----------------------------------------------------------------------------------------------------
    var setFocusOnNextAvailablePart = function(){
        let partToFocus = getfirstUnsetVariablePart();

        if (partToFocus)
            setFocusedPart(partToFocus, true);

        //Reached end of parts; Open product summary modal
        else {
            $('#modalProductSummary').modal('show');
        }
    };
    //----------------------------------------------------------------------------------------------------
    var setFocusOnFirstVariablePart = function () {
        let partToFocus = getFirstVariablePart();

        if (!partToFocus)
            console.log("setFocusOnFirstVariablePart: No valid part to focus");
        else
            setFocusedPart(partToFocus, true);

    };
    $scope.setFocusOnFirstVariablePart = setFocusOnFirstVariablePart;
    //----------------------------------------------------------------------------------------------------
    var getFirstVariablePart = function () {
        for (let part of product.parts)
            if (partIsVariable(part))
                return part;
        
        console.log("getFirstVariablePart: No variable parts found");
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    var getNextVariablePart = function (currentPart) {
        let firstIndexToCheck = product.parts.indexOf(currentPart) + 1;

        for (let i = firstIndexToCheck; i < product.parts.length; i++)
            if (partIsVariable(product.parts[i]))
                return product.parts[i];

        console.log("getNextVariablePart: No variable parts found after " + currentPart.id);
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    var getfirstUnsetVariablePart = function(){
        for(let part of product.parts)
            if(partIsVariable(part) && !part.value)
                return part;
        
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onBlurPart = function(part){
        if(partIsNumeric(part)){
            setNumeric(part, part.selectedOption);
        }
    };
    //********************************************** PART FOCUS END **********************************************

    //********************************************** PART VALUE & OPTION BEGIN  **********************************************    
    $scope.setPart = function (part, optionToSelect){
        let setIsSuccessful;
        
        if(partIsSelect(part)){
            setIsSuccessful = setSelect(part, optionToSelect);
        }
        else if(partIsNumeric(part)) {
            setIsSuccessful = setNumeric(part, optionToSelect);
        }
        else if(partIsColor(part)) {
            setIsSuccessful = setColor(part, optionToSelect);
        }
        else if(partIsConstant(part)){
            console.log("Tried to set a constant part on: " + part);
            setIsSuccessful = false;
        }
        else{
            console.log("Invalid part type on: " + part);
            setIsSuccessful = false;
        }
        
        if (setIsSuccessful){
            let partsNeededReset = checkPartsForReset(part);

            if(partsNeededReset)
                setFocusOnNextVariablePart();
            else
                setFocusOnNextAvailablePart();
        }
    };
    //----------------------------------------------------------------------------------------------------
    var checkPartsForReset = function(lastValidPart){
        let startingIndex = product.parts.indexOf(lastValidPart) + 1;

        for (let i = startingIndex; i < product.parts.length; i++){
            if(product.parts[i].isDisabled)
                return false;
            
            if (!product.parts[i].selectedOption)
                return false;

            if (!validateOption(product.parts[i].selectedOption)){
                resetAllParts(product.parts[i]);
                return true;
            }
        }
        return false;
    };
    //----------------------------------------------------------------------------------------------------
    var getFirstValidOption = function (part) {
        for (let option of part.options)
            if (validateOption(option))
                return option;
        
        console.log("getFirstValidOption: No valid option found for part " + part.id);
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    var setSelect = function (part, optionToSelect){
        if(!part || !optionToSelect)
            return false;
        
        part.selectedOption = optionToSelect;
        part.value = optionToSelect.value;
        part.details = optionToSelect.description;

        if (part.id == "_connectorSideA" || 
            part.id == "_polishSideA"    || 
            part.id == "_connectorSideB" || 
            part.id == "_polishSideB") {
                validateConnectors();
            }
        
        return true;
    };
    //----------------------------------------------------------------------------------------------------
    var setNumeric = function(part, optionToSelect){       
        if(!part || !optionToSelect)
            return false;

        if (!part.value && optionToSelect.description != 'Not Applicable')             
            return false;
        
        part.selectedOption = optionToSelect;
        part.input = formatNumericInput(part);
        part.value = generateNumericValue(part);
        part.details = generateNumericDetails(part);

        return true;
    };
    //----------------------------------------------------------------------------------------------------
    var setColor = function (part, optionToSelect) {
        if (!part || !optionToSelect)
            return false;

        part.selectedOption = optionToSelect;
        part.value = optionToSelect.value;
        part.details = optionToSelect.description;

        return true;
    };
    //----------------------------------------------------------------------------------------------------
    var resetPart = function(part){
        initPart(part);
    };
    var resetAllParts = function(part = product.parts[0]){
        let startingIndex = product.parts.indexOf(part);
        
        for(let i = startingIndex; i < product.parts.length; i++)
            resetPart(product.parts[i]);
    };
    //----------------------------------------------------------------------------------------------------
    var getPartFromId = function (id) {
        for (let part of product.parts)
            if (part.id == id)
                return part;    

        console.log("getPartFromId: Part not found for id " + JSON.stringify(id));
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    var getOptionFromValue = function (part, value) {
        for (let option of part.options)
            if (option.value == value)
                return option;

        console.log("getOptionFromValue: Option not found for value " + value + " and part " + part.id);
        return null;
    };
    //----------------------------------------------------------------------------------------------------
    var partIsNumeric = function (part) {
        return part ? part.type == 'numeric' : null;
    };
    //----------------------------------------------------------------------------------------------------
    var partIsSelect = function (part) {
        return part ? part.type == 'select' : null;
    };
    //----------------------------------------------------------------------------------------------------
    var partIsColor = function (part) {
        return part ? part.type == 'color' : null;
    };
    //----------------------------------------------------------------------------------------------------
    var partIsConstant = function (part) {
        return part ? part.type == 'constant' : null;
    };
    //----------------------------------------------------------------------------------------------------
    var partIsVariable = function (part) {
        return part ? part.type != 'constant' : null;
    };
    //----------------------------------------------------------------------------------------------------
    var getPartNumber = function(){
        let partNumber = "";

        for(let part of product.parts)
            partNumber += part.value || part.placeholder;
        return partNumber;
    };
    $scope.getPartNumber = getPartNumber;
    //********************************************** PART VALUE & OPTION END  **********************************************

    //********************************************** CONNECTORS VALIATION BEGIN  **********************************************
    var validateConnectors = function(){
        let connectorSideA = getPartFromId("_connectorSideA");
        let polishSideA = getPartFromId("_polishSideA");
        let connectorSideB = getPartFromId("_connectorSideB");
        let polishSideB = getPartFromId("_polishSideB");
        
        //Check if connectors exist
        if(connectorSideA && polishSideA && connectorSideB && polishSideB){         
            let swapIsRequired = connectorsNeedToBeSwapped(connectorSideA, polishSideA, connectorSideB, polishSideB);
            
            if (swapIsRequired)
            swapConnectors(connectorSideA, polishSideA, connectorSideB, polishSideB);      
        }
    };
    //----------------------------------------------------------------------------------------------------
    var connectorsNeedToBeSwapped = function(connectorSideA, polishSideA, connectorSideB, polishSideB){
        //One of the Connectors or Polish is not selected; Do nothing
        if (!connectorSideA.value ||
            !polishSideA.value    ||
            !connectorSideB.value ||
            !polishSideB.value) {
                return false;
        }

        //Connector B's selection is "no connector"; Do nothing
        if (connectorSideB.value == "OE") 
            return false;  

        //A and B are in alphabetical order; Do nothing
        if (connectorSideA.value <= connectorSideB.value) 
            return false;

        //A and B are not in alphabetical order; Connectors need to be swapped
        return true;
    };
    //----------------------------------------------------------------------------------------------------
    var swapConnectors = function (connectorSideA, polishSideA, connectorSideB, polishSideB){
        //Cannot simply swap using references because ConnectorSideA's option of value X != ConnectorSideB's option of value X
        let tempConnectorOption = getOptionFromValue(connectorSideB, connectorSideA.selectedOption.value);
        let tempPolishOption = getOptionFromValue(polishSideB, polishSideA.selectedOption.value);

        setSelect(connectorSideA, getOptionFromValue(connectorSideA, connectorSideB.selectedOption.value));
        setSelect(polishSideA, getOptionFromValue(polishSideA, polishSideB.selectedOption.value));
        
        setSelect(connectorSideB, tempConnectorOption);
        setSelect(polishSideB, tempPolishOption);
    };
    //********************************************** CONNECTORS VALIATION END  **********************************************

    //********************************************** OPTION FILTER BEGIN  **********************************************
    var validateOption = function (option) {
        if (!Array.isArray(option.conditions) || !option.conditions.length)
            return true;

        //Loop acts as a boolean AND for conditions; Returns true only if all conditions are true
        for (let condition of option.conditions) {
            if (!conditionIsValid(condition))
                return false;
        }

        //all conditions returned true
        return true;
    };
    $scope.validateOption = validateOption;
    //----------------------------------------------------------------------------------------------------
    var conditionIsValid = function (condition) {
        let partToCheck = getPartFromId(condition.partId);

        //part to check has not had a selection made yet; Do not check conditions until a selection has been made; return true
        if (!partToCheck.selectedOption)
            return true;

        //Return true if any condition is evaluated to true   
        for (let valueToCheck of condition.acceptedValues) {
            if (partToCheck.selectedOption.value == valueToCheck)
                return true;
        }
        return false;
    };
    //********************************************** OPTION FILTER END  **********************************************

    //********************************************** NUMERIC INPUT BEGIN  **********************************************
    var formatNumericInput = function(part){
        if (!part.input)
            return null;

        //Split on dot or comma
        let integers = part.input.split(/[/.,]/)[0];
        let decimals = part.input.split(/[/.,]/)[1] || null;

        if (!decimals || decimals == 0)
            return integers;

        return part.input;
    };
    
    var generateNumericValue = function (part) {
        if (part.selectedOption.description == 'Not Applicable')
            return part.selectedOption.value;    

        if (!part.input)
            return null;

        //Split on dot or comma
        let integers = part.input.split(/[/.,]/)[0];
        let decimals = part.input.split(/[/.,]/)[1] || null;
        
        if (!part.selectedOption.value)
            part.selectedOption.value = "";

        if(!decimals || decimals == 0)
            return integers.padStart(part.integersLength, "0") + part.selectedOption.value;
        
        return integers.padStart(part.integersLength, "0") + "D" + decimals.padEnd(part.decimalsLength, "0") + part.selectedOption.value;
    };
    //----------------------------------------------------------------------------------------------------
    var generateNumericDetails = function(part){    
        if (part.selectedOption.description == 'Not Applicable')
            return part.selectedOption.description;
        
        if (!part.input)
            return null;

        //Split on dot or comma
        let integers = part.input.split(/[/.,]/)[0];
        let decimals = part.input.split(/[/.,]/)[1] || null;
        
        if (!decimals || decimals == 0) 
            return integers + " " + part.selectedOption.description;

        return part.input + " " + part.selectedOption.description;
    };
    //----------------------------------------------------------------------------------------------------
    //Prevents non-numeric inputs
    $scope.onKeypressNumericInput = function (event, part = product.focusedPart) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;

        if (!keyIsNumeric(key) && !keyIsAcceptedNonNumerics(key)) {
            evt.preventDefault(); //prevent key input
        }
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onChangeNumericInput = function (event, part = product.focusedPart) {
        let evt = event || window.event;
        let key = evt.keyCode || evt.which;
        const EXPECTED_FORMAT = part.expectedFormat;

        if (!EXPECTED_FORMAT.test(part.input)) {
            //Rollback to last valid input
            part.input = part.lastValidInput;
        }
        else {
            part.lastValidInput = part.input;
            part.value = generateNumericValue(part);
        }
    };
    //----------------------------------------------------------------------------------------------------
    //Prevents paste
    $scope.onPasteNumericInput = function (event) {
        let evt = event || window.event;

        if (evt.preventDefault) evt.preventDefault();
    };
    //----------------------------------------------------------------------------------------------------
    var keyIsNumeric = function (key) {
        key = String.fromCharCode(key);
        return /[0-9]/.test(key); //allow numbers
    };
    //----------------------------------------------------------------------------------------------------
    var keyIsAcceptedNonNumerics = function (key) {
        key = String.fromCharCode(key);
        return /[\.,]/.test(key); //allow dot and comma;
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onChangeNumericSelect = function (event, part = product.focusedPart) {
        part.value = generateNumericValue(part);
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onFocusNumericSelect = function (event) {
        let evt = event || window.event;
        let target = $(evt.target);

        target.parent().addClass("focus-shadow");

        $(window).on('mousewheel DOMMouseScroll', function () {
            target.blur();
        });
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onBlurNumericSelect = function (event) {
        let evt = event || window.event;
        let target = $(evt.target);

        target.parent().removeClass("focus-shadow");

        $(evt.target).removeClass("opened");
        $(window).off('mousewheel DOMMouseScroll');
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onClickNumericSelect = function (event) {
        let evt = event || window.event;

        $(evt.target).toggleClass("opened");
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onKeyDownNumericSelect = function (event) {
        let evt = event || window.event;

        if (evt.keyCode == 13) //enter
            $(evt.target).addClass("opened");
    };
    //----------------------------------------------------------------------------------------------------
    $scope.onKeyUpNumericSelect = function (event) {
        let evt = event || window.event;

        if (evt.keyCode == 27) //esc
            $(evt.target).removeClass("opened");
    };
    //********************************************** NUMERIC INPUT END  **********************************************

    //********************************************** PRODUCT QUANTITY BEGIN  **********************************************
    $scope.substractQuantity = function () {
        if ($scope.quantity > 1)
            $scope.quantity--;
    };
    //----------------------------------------------------------------------------------------------------
    $scope.addQuantity = function () {
        $scope.quantity++;
    };
    //********************************************** PRODUCT QUANTITY END  **********************************************

    //********************************************** UTILITY FUNCTIONS BEGIN  **********************************************
    $scope.getAsHtml = function (value) {
        return $sce.trustAsHtml(value) || $sce.trustAsHtml('&nbsp');
    };
    //********************************************** UTILITY FUNCTIONS END  **********************************************
    
    $scope.addToCart = function (){

        let cookie = generateCookie(section.number, getPartNumber(), $scope.quantity, product.datasheet);
        $cookies.put(getPartNumber(), cookie);
    };

    var generateCookie = function(section, partNumber, quantity, datasheet){
        return JSON.stringify({ 'section': section, 'partNumber': partNumber, 'quantity': quantity, 'datasheet': datasheet, 'orderDateTime': new Date().toLocaleString()});
    };

    //INIT CALL
    init();
});