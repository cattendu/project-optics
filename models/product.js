class PartNumber{
    constructor([partGroups]){
        this.partGroups = [partGroups];
    }

    get template(){
        var template = "";
        
        for(var partGroup in this.partGroups){
            template += partGroup.template;
        }

        return template; 
    }
}

class PartGroup
{
	constructor()
	{
        this.type = "Cable"; //ex: Cable, Side A, Side B, Length
		this.partCategories = [];
    }
    
    get template(){
        var template = "";

        for(var parCategory in this.partCategories){
            template += PartCategory.template;
        }

        return template;
    }

}

class PartCategory
{
	constructor()
	{
		this.template = "A";  //this should tell us the colour needed.
		this.description = "FIBER TYPE";
		this.parts = [];
    }
    
    get template(){
        return this.template;
    }
}

class Part
{
	constructor()
	{
        this.value = "";
		this.description = "";
	}
}