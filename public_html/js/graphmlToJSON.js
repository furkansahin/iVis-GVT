var graph = {};
$(function () {
    window.cy = cytoscape({
        container: $('#cy')[0],
        style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'content': 'data(name)',
                    'text-valign': 'center',
                    'color': 'white',
                    'text-outline-width': 2,
                    'text-outline-color': '#888'
                })
                .selector(':selected')
                .css({
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black',
                    'text-outline-color': 'black'
                }),
        elements: {
            nodes: [
            ],
            edges: [
            ]
        },
        layout: {
            name: 'null',
            padding: 10
        }
    });
    $('#cy')[0];
});

var nodes = [];
var edges = [];
function graphmlToJSON(xml) {
    nodes = [];
    edges = [];
    graph = {};
    this.attributes = getAttributes(xml);
    this.objects = getObjects(xml, this.attributes[0], this.attributes[1], this.attributes[2]);

}
;
var handleNode = function (node, tabNum) {
    var txt = "";
    var tabs = "";
    for (var i = 0; i < tabNum; i++)
        tabs += "\t";
    var oneMoreTab = tabs + "\t";
    txt += tabs;
    txt += '<node id="';
    txt += node.data("id");
    txt += '">\n';

    txt += oneMoreTab;
    txt += '<data key="x">' + node.position("x") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="y">' + node.position("y") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="height">' + node.data("height") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="width">' + node.data("width") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="color">' + node.css("background-color") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="text">' + node.css("content") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="color">' + node.css("background-color") + '</data>\n';

    txt += oneMoreTab;
    txt += '<data key="shape">' + node.css("shape") + '</data>\n';

    var children = node.children();
    if (children != null && children.length > 0) {
        txt += oneMoreTab;
        txt += '<graph id="' + node.data("id") + ':' + '\"' 
                +' edgedefault="undirected">\n';

        for (var i = 0; i < children.length; i++) {
            txt = txt + handleNode(children[i], tabNum + 2);
        }

        txt += oneMoreTab;
        txt += '</graph>\n';
    }
    txt += tabs;
    txt += '</node>\n';
    return txt;
};
var handleRootGraph = function () {
    var txt = "";
    txt += "<graph id=\"" + graph['id'] + '\" edgedefault=\"' + graph["edgefault"] + "\">\n";
    var orphans = cy.nodes().orphans();
    for (var i = 0; i < orphans.length; i++) {
        txt = txt + handleNode(orphans[i], 2);
    }
    cy.edges().each(function () {
        txt = txt + "<edge id=\"" + this._private.data.id + "\" source=\"" + this._private.data.source + "\" target=\"" + this._private.data.target + "\">\n";
        for (var i = 0; i < atts[2].length; i++) {
            txt += "<data key=\"" + atts[2][i]['id'] + "\">" + this._private.data.x + "</data>\n";
        }
        txt += "</edge>";
    });
    txt += "</graph>\n" + "</graphml>\n";
    return txt;
};
var jsonToGraphml = {
    createGraphml: function () {
        var self = this;
        var graphmlText = "";

        //add headers
        graphmlText = graphmlText + "<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n";
        var objs = ['graph', 'node', 'edge'];
        for (var a = 0; a < 3; a++) {
            for (var i = 0; i < atts[a].length; i++) {
                graphmlText += "<key id=\"" + atts[a][i]['id'] + "\" for=\"" + objs[a] + "\" attr.name=\"" + atts[a][i]['attrName'] + "\" attr.type=\"" + atts[a][i]['attrType'] + "\"/>\n";
            }
        }
        
        return graphmlText + handleRootGraph();
    }
};


$("#save-file").click(function (e) {

    var sbgnmlText = jsonToGraphml.createGraphml(atts);

    var blob = new Blob([sbgnmlText], {
        type: "text/plain;charset=utf-8;",
    });
    var filename = document.getElementById('file-name').innerHTML;
    saveAs(blob, filename);

});

function refreshCytoscape(graphData) { // on dom ready

    cy = cytoscape({
        container: $('#cy')[0],
        style: cytoscape.stylesheet()
                .selector('node')
                .css({
                    'content': 'data(name)',
                    'text-valign': 'center',
                    'color': 'white',
                    'text-outline-width': 2,
                    'text-outline-color': '#888'
                })
                .selector(':selected')
                .css({
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black',
                    'text-outline-color': 'black'
                }),
        elements: {
            nodes: graphData['nodes'],
            edges: graphData['edges']

        },
        layout: {
            name: 'preset',
            fit: true
        }
    });
}
;
function loadXMLDoc(fileName) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else // for IE 5/6
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", filename, false);
    xhttp.send();
    return xhttp.responseXML;
}
;

function getAttributes(xmlObject) {
    var nodeAttributes = [];
    var edgeAttributes = [];
    var graphAttributes = [];
    $(xmlObject).find("key").each(function () {
        if ($(this).attr("for") == "node" || $(this).attr("for") == "all") {
            nodeAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
        if ($(this).attr('for') == "edge" || $(this).attr("for") == "all") {
            edgeAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
        if ($(this).attr('for') == "graph" || $(this).attr("for") == "all") {
            graphAttributes.push({
                id: $(this).attr('id'),
                attrName: $(this).attr('attr.name'),
                attrType: $(this).attr('attr.type')
            });
        }
    });
    return [graphAttributes, nodeAttributes, edgeAttributes];
}
;
var processNode = function (theNode, pid, nodeAttributes) {
    var id = $(theNode).attr('id');

    var nodeData = $(theNode).children('data');
    var nodeGraph = $(theNode).children('graph');
    var cyData = {};
    var cyCSS = {};
    var cyPos = {};

    cyData.id = id;
//  cyData.group = "nodes";

    if (pid != null) {
        cyData.parent = pid;
    }
    var i = 0;
    $(nodeData).each(function () {
        var val = $(this).text();
        val = val.toLowerCase();
        var name = $(this).attr('key');

        /*   if (key == null) {
         console.log("" + keyId + " is not a valid key for a node");
         return;
         }*/

        if (name == "x"||name == "y"||name == "width"||name == "height"||name == "margin") {
            val = Number(val);
        }

        if (name == "x") {
            cyPos.x = val;
        }
        else if (name == "y") {
            cyPos.y = val;
        }
        else if (name == "height") {
            cyData.height = val;
        }
        else if (name == "width") {
            cyData.width = val;
        }
        else if (name == "shape") {
            cyCSS.shape = val.toLowerCase();
        }
        else if (name == "color") {
            if (val.indexOf(" ") > -1)
                cyCSS['background-color'] = 'rgb(' + val.replace(/ /g, ',') + ')';
            else
                cyCSS['background-color'] = val;
        }
        else if (name == "text") {
            cyCSS.content = val;
        }
    });

//  Globals.elements.nodes.push({data: cyData, css: cyCSS, position: cyPos});
    nodes.push({data: cyData, css: cyCSS, position: cyPos});

    
    if (nodeGraph.length > 0) {
        nodeGraph = nodeGraph[0];

        var childNodes = $(nodeGraph).children("node");

        for (var i = 0; i < childNodes.length; i++) {
            var theNode = $(childNodes)[i];
            processNode(theNode, id, nodeAttributes);
        }
    }
}
function getObjects(xmlObject, graphAttributes, nodeAttributes, edgeAttributes, pid) {

    $(xmlObject).find('graph').each(function () {
        // define id of graph
        // <data> TO TAKE THIS </data>


        $(this).children('node').each(function () {
            processNode($(this), null, nodeAttributes);
            /*            var nodeData = new Object();
             nodeData["id"] = $(this).attr('id');
             if (pid != null)
             nodeData['parent'] = pid;
             var nodeCSS = new Object();
             var nodePosition = new Object();
             
             // for each node object, take variable values from between data tags.
             $(this).children('data').each(function () {
             if ($(this).attr("key") == "color"){
             var col = vals[a++].firstChild.textContent;
             col = col.split(" ");
             nodeCSS['background-color'] = "rgb("+col[0]+", " + col[1] + ", " + col[2]+")";
             }
             else
             nodeCSS[$(this).attr("key")] = vals[a++].firstChild.textContent;
             });
             nodePosition['x'] = Number(nodeCSS['x']);
             nodePosition['y'] = Number(nodeCSS['y']);
             if (nodeCSS['shape'])
             nodeCSS['shape'] = nodeCSS['shape'].toLowerCase();
             nodeCSS['color'] = 'red';
             
             if ($(this).children('graph').length > 0){
             for (var i = 0; i < $(this).children('graph').length; i++){
             var objects = getObjects($(this), graphAttributes, nodeAttributes, edgeAttributes, nodeData["id"]);
             }
             }
             nodes.push({data: nodeData, css: nodeCSS, position: nodePosition});
             */       });
        $(this).children('edge').each(function () {
            var edgeData = new Object();
            edgeData['id'] = $(this).attr('id');
            edgeData['source'] = $(this).attr('source');
            edgeData['target'] = $(this).attr('target');
            edges.push({data: edgeData});
        });
    });
    return [graph, nodes, edges];
}
;
var tempName = "";
$("#choose-layout").on('change', function (e) {
//    console.log($(this).context.value);
    tempName = $(this).context.value;
});

var COSELayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose',
        ready: function () {
        },
        stop: function () {
        },
        animate: true,
        refresh: 4,
        fit: true,
        padding: 30,
        boundingBox: undefined,
        randomize: true,
        debug: false,
        nodeRepulsion: 400000,
        nodeOverlap: 10,
        idealEdgeLength: 10,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 250,
        numIter: 100,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#cose-settings-template").html(), self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
    },
    render: function () {
        this.defaultLayoutProperties = this.currentLayoutProperties;
        var self = this;
        self.template = _.template($("#cose-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout").die("click").live("click", function (evt) {
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
            self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
            self.currentLayoutProperties.animate = document.getElementById("animate").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh").value);
            self.currentLayoutProperties.fit = document.getElementById("fit").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding").value);
            //           self.currentLayoutProperties.boundingBox = document.getElementById("boundingBox").checked;                  ///// Undefined
            self.currentLayoutProperties.randomize = document.getElementById("randomize").checked;
            self.currentLayoutProperties.debug = document.getElementById("debug").checked;
            self.currentLayoutProperties.initialTemp = Number(document.getElementById("initialTemp").value);
            //          self.currentLayoutProperties.coolingFactor = Number(document.getElementById("coolingFactor").value);          /////////// CHECK NUM!!
            self.currentLayoutProperties.minTemp = Number(document.getElementById("minTemp").value);

//            if(self.currentLayoutProperties.tile === "true")
//              self.currentLayoutProperties.tile = true;
//            else
//              self.currentLayoutProperties.tile = false;
            console.log(document.getElementById('fit').checked);

            $(self.el).dialog('close');

        });

        $("#default-layout").die("click").live("click", function (evt) {
            self.copyProperties();
            self.template = _.template($("#cose-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var COLALayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cola',
        animate: true, // whether to show the layout as it's running
        refresh: 1, // number of ticks per frame; higher is faster but more jerky
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: true, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        // layout event callbacks
        ready: function () {
        }, // on layoutready
        stop: function () {
        }, // on layoutstop

        // positioning options
        randomize: false, // use random node positions at beginning of layout
        avoidOverlap: true, // if true, prevents overlap of node bounding boxes
        handleDisconnected: true, // if true, avoids disconnected components from overlapping
        nodeSpacing: function (node) {
            return 10;
        }, // extra spacing around nodes
        flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
        alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

        // different methods of specifying edge length
        // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
        edgeLength: undefined, // sets edge length directly in simulation
        edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
        edgeJaccardLength: undefined, // jaccard edge length in simulation

        // iterations of cola algorithm; uses default values on undefined
        unconstrIter: undefined, // unconstrained initial layout iterations
        userConstIter: undefined, // initial layout iterations with user-specified constraints
        allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#cola-settings-template").html(), self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
//        var options = clone(this.currentLayoutProperties);
        console.log(options);
        cy.layout(options);
    },
    render: function () {
        var self = this;
        self.template = _.template($("#cola-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout1").die("click").live("click", function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate1").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh1").value);
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime1").value);
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating1").checked;
            self.currentLayoutProperties.fit = document.getElementById("fit1").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding1").value);
//            self.currentLayoutProperties.boundingBox = Number(document.getElementById("boundingBox").value);        //undefined
            self.currentLayoutProperties.randomize = document.getElementById("randomize1").checked;
            self.currentLayoutProperties.avoidOverlap = document.getElementById("avoidOverlap1").checked;
            self.currentLayoutProperties.handleDisconnected = document.getElementById("handleDisconnected1").checked;
            /*           self.currentLayoutProperties.nodeSpacing = Number(document.getElementById("nodeSpacing").value);///////Undefined
             self.currentLayoutProperties.flow = Number(document.getElementById("flow").value);///////Undefined
             self.currentLayoutProperties.alignment = Number(document.getElementById("alignment").value);///////Undefined
             self.currentLayoutProperties.edgeLength = Number(document.getElementById("edgeLength").value);///////Undefined
             self.currentLayoutProperties.edgeSymDiffLength = Number(document.getElementById("edgeSymDiffLength").value);///////Undefined
             self.currentLayoutProperties.edgeJaccardLength = document.getElementById("edgeJaccardLength").checked;///////Undefined
             self.currentLayoutProperties.unconstrIter = Number(document.getElementById("unconstrIter").value);///////Undefined
             self.currentLayoutProperties.userConstIter = Number(document.getElementById("userConstIter").value); ///////Undefined
             self.currentLayoutProperties.allConstIter = Number(document.getElementById("allConstIter").value); ///////Undefined
             */            self.currentLayoutProperties.infinite = document.getElementById("infinite1").checked;

//            if(self.currentLayoutProperties.tile === "true")
//              self.currentLayoutProperties.tile = true;
//            else
//              self.currentLayoutProperties.tile = false;

            $(self.el).dialog('close');
        });

        $("#default-layout1").die("click").live("click", function (evt) {
            self.copyProperties();
            self.template = _.template($("#cola-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});
var ARBORLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'arbor',
        animate: true, // whether to show the layout as it's running
        maxSimulationTime: 4000, // max length in ms to run the layout
        fit: true, // on every layout reposition of nodes, fit the viewport
        padding: 30, // padding around the simulation
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

        // callbacks on layout events
        ready: undefined, // callback on layoutready 
        stop: undefined, // callback on layoutstop

        // forces used by arbor (use arbor default on undefined)
        repulsion: undefined,
        stiffness: undefined,
        friction: undefined,
        gravity: true,
        fps: undefined,
        precision: undefined,
        // static numbers or functions that dynamically return what these
        // values should be for each element
        // e.g. nodeMass: function(n){ return n.data('weight') }
        nodeMass: undefined,
        edgeLength: undefined,
        stepSize: 0.1, // smoothing of arbor bounding box

        // function that returns true if the system is stable to indicate
        // that the layout can be stopped
        stableEnergy: function (energy) {
            var e = energy;
            return (e.max <= 0.5) || (e.mean <= 0.3);
        },
        // infinite layout options
        infinite: false // overrides all other options for a forces-all-the-time mode
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#arbor-settings-template").html(), self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        console.log(options);
        cy.layout(options);
    },
    render: function () {
        var self = this;
        self.template = _.template($("#arbor-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout2").die("click").live("click", function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate2").checked;
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime2").value);
            self.currentLayoutProperties.fit = document.getElementById("fit2").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding2").value);
//            self.currentLayoutProperties.boundingBox = Number(document.getElementById("nesting-factor").value);
            self.currentLayoutProperties.gravity = document.getElementById("gravity2").checked;
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating2").checked;
            self.currentLayoutProperties.stepSize = Number(document.getElementById("stepSize2").value);
            self.currentLayoutProperties.infinite = document.getElementById("infinite2").checked;
            /*            self.currentLayoutProperties.ready = Number(document.getElementById("ready").value);
             self.currentLayoutProperties.stop = document.getElementById("stop").checked;
             self.currentLayoutProperties.repulsion = Number(document.getElementById("repulsion").value);
             self.currentLayoutProperties.stiffness = document.getElementById("stiffness").checked;
             self.currentLayoutProperties.friction = Number(document.getElementById("friction").value);
             self.currentLayoutProperties.fps = document.getElementById("fps").checked;
             self.currentLayoutProperties.precision = Number(document.getElementById("precision").value);
             self.currentLayoutProperties.nodeMass = document.getElementById("nodeMass").checked;
             self.currentLayoutProperties.edgeLength = Number(document.getElementById("edgeLength").value);
             self.currentLayoutProperties.stableEnergy = document.getElementById("stableEnergy").checked;*/
//            if(self.currentLayoutProperties.tile === "true")
//              self.currentLayoutProperties.tile = true;
//            else
//              self.currentLayoutProperties.tile = false;

            $(self.el).dialog('close');
        });

        $("#default-layout2").die("click").live("click", function (evt) {
            self.copyProperties();
            self.template = _.template($("#arbor-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});

var SPRINGYLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'springy',
        animate: false, // whether to show the layout as it's running
        maxSimulationTime: 4000, // max length in ms to run the layout
        ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
        fit: true, // whether to fit the viewport to the graph
        padding: 30, // padding on fit
        boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        random: false, // whether to use random initial positions
        infinite3: true, // overrides all other options for a forces-all-the-time mode
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop

        // springy forces
        stiffness: 400,
        repulsion: 400,
        damping: 0.5
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        self.template = _.template($("#springy-settings-template").html(), self.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: function () {
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        console.log(options);
        cy.layout(options);
    },
    render: function () {
        var self = this;
        self.template = _.template($("#springy-settings-template").html(), self.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout3").die("click").live("click", function (evt) {
            self.currentLayoutProperties.animate = document.getElementById("animate3").checked;
            self.currentLayoutProperties.maxSimulationTime = Number(document.getElementById("maxSimulationTime3").value);
            self.currentLayoutProperties.ungrabifyWhileSimulating = document.getElementById("ungrabifyWhileSimulating3").checked;
            self.currentLayoutProperties.fit = document.getElementById("fit3").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding3").value);
            //          self.currentLayoutProperties.boundingBox = Number(document.getElementById("boundingBox").value);
            self.currentLayoutProperties.random = document.getElementById("random3").checked;
            self.currentLayoutProperties.infinite3 = document.getElementById("infinite3").checked;
            /*          self.currentLayoutProperties.ready = Number(document.getElementById("ready").value);
             self.currentLayoutProperties.stop = Number(document.getElementById("stop").value);          */
            self.currentLayoutProperties.stiffness = Number(document.getElementById("stiffness3").value);
            self.currentLayoutProperties.repulsion = Number(document.getElementById("repulsion3").value);
            self.currentLayoutProperties.damping = Number(document.getElementById("damping3").value);

//            if(self.currentLayoutProperties.tile === "true")
//              self.currentLayoutProperties.tile = true;
//            else
//              self.currentLayoutProperties.tile = false;

            $(self.el).dialog('close');
        });

        $("#default-layout3").die("click").live("click", function (evt) {
            self.copyProperties();
            self.template = _.template($("#springy-settings-template").html(), self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
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
            "add": function () {
                var name = $("#new-node-name").val();
                var w = $("#new-node-width").val();
                var h = $("#new-node-height").val();
                var x = $("#new-node-x").val();
                var y = $("#new-node-y").val();

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
                addNode(name, x, y, w, h);
                $(this).dialog("close");
            }
        }
    });
});
var addNode = function (name, x, y, w, h) {
    var nodeData = new Object();
    nodeData['group'] = 'nodes';
    nodeData['data'] = {id: name};
    nodeData['position'] = {x: x, y: y};
    cy.add(nodeData);
};
$("#addEdge").click(function (e) {

    var target = cy.$('node:selected')[0]._private.data.id;
    var source = cy.$('node:selected')[1]._private.data.id;
    var edge = new Object();
    edge['group'] = "edges";
    edge['data'] = {source: source, target: target};
    cy.add(edge);
});
$("#deleteEdge").click(function (e) {
    var tEdge = cy.$('edge:selected')[0];
    cy.remove(tEdge);
});
$("#deleteNode").click(function (e) {
    var tNode = cy.$('node:selected')[0];
    cy.remove(tNode);
});
var pNodeNum = 0;
$("#makeCompound").click(function (e) {
    var nodes = cy.$('node:selected');
    var nodesToAdd = [];
    for (var i = 0; i < nodes.length; i++) {
        nodesToAdd[i] = new Object();
    }
    var num = nodes.length;
    var pNode = new Object();
    pNode['data'] = {id: ('p' + (pNodeNum++))};
    console.log(pNodeNum);
    pNode['group'] = 'nodes';
    pNode.position = new Object();

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

    //s cy.layout({name: 'preset'});

})
$("#layout-properties").click(function (e) {
    if (tempName !== '') {
        switch (tempName) {
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



function textToXmlObject(text) {
    if (window.ActiveXObject) {
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(text);
    } else {
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
    }
    return doc;
}
;
