var dimensionValues = [];

function onBeforeRender(dashboardControl) {
    if (dashboardControl) {
        dashboardControl.on('dashboardEndUpdate', createControls);
        var viewerApiExtension = dashboardControl.findExtension("viewerApi");
    }
    if (viewerApiExtension) {
        viewerApiExtension.on('itemVisualInteractivity', addCustomInteractivity);
        viewerApiExtension.on('itemSelectionChanged', applyCurrentSelection);
    }
}

function addCustomInteractivity(args) {
    if (args.itemName == "gridDashboardItem1") {
        args.setTargetAxes(["Default"]);
        args.setSelectionMode("Multiple");
    }
    if (args.itemName == "chartDashboardItem1") {
        args.setTargetAxes(["Argument"]);
        args.enableHighlighting(true);
    }
}

function createControls() {
    $('#barGauge').dxBarGauge({
        startValue: 0,
        endValue: 10000,
        values: getAllValues(),
        title: {
            text: "Product Quantity",
            font: {
                size: 28,
            }
        },
        label: {
            format: 'fixedPoint',
            precision: 0
        },
        tooltip: {
            enabled: true,
            customizeTooltip(arg) {
                return {
                    text: getText(dimensionValues[arg.index], arg.value),
                };
            },
        },
        legend: {
            visible: true,
            verticalAlignment: 'bottom',
            horizontalAlignment: 'center',
            customizeText(arg) {
                return getText(dimensionValues[arg.item.index], arg.text);
            }
        }
    });
}

function getText(item, text) {
    return `${item} - ${text}`    
}

function applyCurrentSelection(args) {
    var quantityValues = [];
    dimensionValues = [];
    if (args.itemName == "gridDashboardItem1" & args.getCurrentSelection().length != 0) {
        var viewerApiExtension = dashboardControl.findExtension('viewerApi');
        var clientData = viewerApiExtension.getItemData("gridDashboardItem1");
        for (var i = 0; i < args.getCurrentSelection().length; i++) {
            var dimensionValue = args.getCurrentSelection()[i].getAxisPoint().getValue();
            var currentTuple = args.getCurrentSelection()[i],
                slice = clientData.getSlice(currentTuple.getAxisPoint()),
                quantity = (slice.getMeasureValue(clientData.getMeasures()[0].id)).getValue();            
            quantityValues.push(quantity);
            dimensionValues.push(dimensionValue);
        }
    } else {
        quantityValues = getAllValues();
    }
    $("#barGauge").dxBarGauge("instance").values(quantityValues);
}

function getAllValues() {
    var viewerApiExtension = dashboardControl.findExtension('viewerApi');
    dimensionValues = [];
    var quantityValues = [];
    var   clientData = viewerApiExtension.getItemData("gridDashboardItem1");
    for (var i = 0; i < clientData.getAxis("Default").getPoints().length; i++) {
        var slice = clientData.getSlice(clientData.getAxis("Default").getPoints()[i]),
            quantity = (slice.getMeasureValue(clientData.getMeasures()[0].id)).getValue(),
            dimensionValue = clientData.getAxis("Default").getPoints()[i].getValue();        
        quantityValues.push(quantity);
        dimensionValues.push(dimensionValue);
    }
    return quantityValues;
}