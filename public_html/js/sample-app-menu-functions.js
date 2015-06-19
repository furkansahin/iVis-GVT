///////////////////// LOAD & SAVE //////////////////////////////


$("#save-file").click(function (e) {

    var sbgnmlText = jsonToGraphml.createGraphml(atts);

    var blob = new Blob([sbgnmlText], {
        type: "text/plain;charset=utf-8;",
    });
    var filename = "" + new Date().getTime() + ".graphml";;
    saveAs(blob, filename);

});



//////////////////////////////////////////////////////////////////////////////////////////////

var tempName = "cose2";
$("#cose2").click( function (e) {
    tempName = "cose2";
    whitenBackgrounds();
    $("#cose2").css("background-color", "grey");
});
$("#cose").click( function (e) {
    tempName = "cose";
    whitenBackgrounds();
    $("#cose").css("background-color", "grey");
});
$("#cola").click( function (e) {
    tempName = "cola";
    whitenBackgrounds();
    $("#cola").css("background-color", "grey");
});
$("#springy").click( function (e) {
    tempName = "springy";
    whitenBackgrounds();
    $("#springy").css("background-color", "grey");
});
$("#arbor").click( function (e) {
    tempName = "arbor";
    whitenBackgrounds();
    $("#arbor").css("background-color", "grey");
});

var cose2LayoutProp = new COSE2Layout({
    el: '#layout-table'
});

var coseLayoutProp = new COSELayout({
    el: '#layout-table'
});
var colaLayoutProp = new COLALayout({
    el: '#layout-table'
});
var arborLayoutProp = new ARBORLayout({
    el: '#layout-table'
});
var springyLayoutProp = new SPRINGYLayout({
    el: '#layout-table'
});
$("#add-node-dialog").hide();
$("#addNode").click(function () {
    $("#add-node-dialog").dialog({
        modal: true,
        draggable: false,
        resizable: false,
        position: ['center', 'top'],
        show: 'blind',
        hide: 'blind',
        width: 400,
        dialogClass: 'ui-dialog-osx',
        buttons: {
            "Done": function () {
                var name = $("#new-node-name").val();
                var w = $("#new-node-width").val();
                var h = $("#new-node-height").val();
                var x = $("#new-node-x").val();
                var y = $("#new-node-y").val();
                var color = $("#new-node-color").val();
                var shape = $("#new-node-shape").val();

                if (w == "") {
                    w = null;
                }
                else {
                    w = Number(w);
                }

                if (h == "") {
                    h = null;
                }
                else {
                    h = Number(h);
                }

                if (x == "") {
                    x = null;
                }
                else {
                    x = Number(x);
                }

                if (y == "") {
                    y = null;
                }
                else {
                    y = Number(y);
                }
                addNode(name, x, y, w, h, color, shape);
                $(this).dialog("close");
            }
        }
    });
});
var addNode = function (name, x_, y_, w, h, color, shape) {
    var id_ = IDGenerator.generate();

    css = {};
    css["content"] = name;
    css["background-color"] = color;
    css["shape"] = shape;

    cy.add({
        group: "nodes",
        data: {id: id_, width: w, height: h},
        position: {x: x_, y: y_},
        css: css
    });

    cy.layout({
        name: "preset"
    });
}

$("#addEdge").click(function (e) {
    if (edgeNodes.length != 2){
        return;
    }
    var target = edgeNodes[1];
    var source = edgeNodes[0];
    var edge = new Object();
    edge['group'] = "edges";
    edge['data'] = {source: source, target: target};
    cy.add(edge);
});

$("#delete").click(function (e) {
    var allNodes = cy.$('node');


    var tNodes = cy.$('node:selected');
    var tEdges = cy.$('edge:selected');
    for (var i = 0; i < tEdges.length; i++)
    {
        cy.remove(tEdges[i]);
    }
    for (var i = 0; i < tNodes.length; i++)
    {
        var children = tNodes[i].children();
        var allEdges = cy.$('edge');
        var parData = null;
        if (tNodes[i].isChild()){
            parData = tNodes[i]._private.data.parent
        }
        cy.remove(tNodes[i]);
        if (children != null && children.length > 0 ){

            for(var a = 0; a < children.length; a++){
                children[a]._private.data.parent = parData;

            }
            cy.add(children);
            cy.add(allEdges);
        }
    }
});
var pNodeNum = 0;
$("#makeCompound").click(function (e) {
    var nodes = cy.$('node:selected');
    var nodesToAdd = [];
    var par = null;
    if (nodes[0]._private.data.parent != null)
        par = nodes[0]._private.data.parent;
    for (var i = 0; i < nodes.length; i++) {
        nodesToAdd[i] = new Object();
        if (nodes[i]._private.data.parent != null && nodes[i]._private.data.parent != par){
            return;
        }
    }
    var num = nodes.length;
    var pNode = new Object();
    pNode['data'] = {id: ('p' + (pNodeNum++))};
    pNode['group'] = 'nodes';
    pNode.position = new Object();

    if (par != null){
        pNode['data'].parent = par;
    }

    var xs = 0;
    var ys = 0;
    var edges = cy.edges();
    for (var i = 0; i < nodes.length; i++) {
        nodesToAdd[i].group = 'nodes';
        nodesToAdd[i].data = {id: nodes[i]._private.data.id, parent: 'p' + (pNodeNum - 1)};
        nodesToAdd[i].position = {x: nodes[i].position('x'), y: nodes[i].position('y')};
        nodesToAdd[i].css = nodes[i].css();
        xs += nodes[i].position('x');
        ys += nodes[i].position('y');
        cy.remove(nodes[i]);
    }
    cy.remove('edge');
    pNode['position'] = {x: xs / num, y: ys / num};
    cy.add(pNode);
    for (var i = 0; i < nodesToAdd.length; i++)
        cy.add(nodesToAdd[i]);
    for (var i = 0; i < edges.length; i++) {
        cy.add(edges[i]);
    }


})
$("#layout-properties").click(function (e) {
    if (tempName !== '') {
        switch (tempName) {
            case 'cose2':
                cose2LayoutProp.render();
                break;
            case 'cose':
                coseLayoutProp.render();
                break;
            case 'cola':
                colaLayoutProp.render();
                break;
            case 'arbor':
                arborLayoutProp.render();
                break;
            case 'springy':
                springyLayoutProp.render();
                break;
        }
    }

});

$("#perform-layout").click(function (e) {
    cy.layout().stop();
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);
    switch (tempName) {
        case 'cose2':
            cose2LayoutProp.applyLayout();
            break;
        case 'cose':
            coseLayoutProp.applyLayout();
            break;
        case 'cola':
            colaLayoutProp.applyLayout();
            break;
        case 'arbor':
            arborLayoutProp.applyLayout();
            break;
        case 'springy':
            springyLayoutProp.applyLayout();
            break;
    }
});
var atts;
$("body").on("change", "#file-input", function (e) {
    var fileInput = document.getElementById('file-input');
    var file = fileInput.files[0];
    var textType = /text.*/;

    var reader = new FileReader();
    reader.onload = function (e)
    {
        var graphmlConverter = new graphmlToJSON(textToXmlObject(this.result));
        atts = graphmlConverter.attributes;

        var cytoscapeJsGraph = {
            edges: graphmlConverter.objects[2],
            nodes: graphmlConverter.objects[1]
        };
        //       console.log(JSON.stringify(graphmlConverter.objects[1][0]));
        refreshCytoscape(cytoscapeJsGraph);
    };
    reader.readAsText(file);
});
$("#load-file").click(function (e) {
    $("#file-input").trigger('click');
});

$("#new").click(function(e){
    var graphData = new Object();
    graphData['nodes'] = undefined;
    graphData['edges'] = undefined;
    refreshCytoscape(graphData);
})

$("#save-as-png").click(function(evt){
    var pngContent = cy.png({scale : 3, full : true});

    // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    // this is to remove the beginning of the pngContent: data:img/png;base64,
    var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

    saveAs(b64toBlob(b64data, "image/png"), "network.png");

});