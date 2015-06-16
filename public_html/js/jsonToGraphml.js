/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var jsonToGraphml = {
    createGraphml : function(attributes){
        var self = this;
        var graphmlText = "";

        //add headers
        graphmlText = graphmlText + "<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n";
        for (var a = 0; a < attributes.length;a++){
            for(var i = 0; i < attributes[a].length; i++){
                graphmlText += "<key id=\"" + attributes[a][i]['id'] + "\" for=\"graph\" attr.name=\"" + attributes[a][i]['atr.name'] + "\" attr.type=\"" + attributes[a][i]['atr.type'] + "\"/>\n"; 
            }
        }
        
        graphmlText += "<graph id=\"" + attributes[0][0]['id'] + "\" edgefault=\"" + attributes[0][0]["edgefault"] + "\">\n";
        var a = 0;
        cy.nodes().each(function(){
            graphmlText += "<node id=\"" + this.data.id + "\">\n";
            for(var i = 0; i < attributes[1][a].length; i++){
                graphmlText += "<data key=\"" + attributes[1][a-1]['id'] + ">" + this.data.x + "</data>\n";
            }
            a++;
        });
        a = 0;
        //adding arc sbgnml
        cy.edges().each(function(){
            graphmlText = graphmlText + "<edge id=\"" + this.data.id + "\" source=\"" + this.data.source + "\" target=\"" + this.data.target + "\">\n";
            for(var i = 0; i < attributes[2][a].length; i++){
                graphmlText += "<data key=\"" + attributes[2][a-1]['id'] + ">" + this.data.x + "</data>\n";
            }
            a++;
        });


        graphmlText = graphmlText +"</graph>\n" +"</graphml>\n";

        return graphmlText;
    }
}

